import type { SyncStorage } from "jotai/vanilla/utils/atomWithStorage";

import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import { storage } from "@/lib/storage";

// Helper to create Map storage with proper typing
function createMapStorage<K extends string, V>(): SyncStorage<Map<K, V>> {
  return {
    getItem: (key: string, initialValue: Map<K, V>): Map<K, V> => {
      const value = storage.getString(key);
      if (!value) return initialValue;

      try {
        const parsed = JSON.parse(value);

        // Handle array format (Map entries)
        if (Array.isArray(parsed)) {
          return new Map(parsed as [K, V][]);
        }

        // Handle object format (legacy)
        if (parsed && typeof parsed === "object") {
          return new Map(Object.entries(parsed) as [K, V][]);
        }

        return initialValue;
      } catch {
        return initialValue;
      }
    },
    removeItem: (key: string): void => {
      storage.delete(key);
    },
    setItem: (key: string, value: Map<K, V>): void => {
      const serialized = JSON.stringify(Array.from(value.entries()));
      storage.set(key, serialized);
    },
  };
}

// Helper for regular JSON storage
function createJsonStorage<T>(): SyncStorage<T> {
  return {
    getItem: (key: string, initialValue: T): T => {
      const value = storage.getString(key);
      if (!value) return initialValue;

      try {
        return JSON.parse(value) as T;
      } catch {
        return initialValue;
      }
    },
    removeItem: (key: string): void => {
      storage.delete(key);
    },
    setItem: (key: string, value: T): void => {
      storage.set(key, JSON.stringify(value));
    },
  };
}

// Users atom - stores all users as a Map
export const usersAtom = atomWithStorage<Map<UserId, User>>("users", new Map(), createMapStorage<UserId, User>(), {
  getOnInit: true,
});

// Events atom - stores all events as a Map
export const eventsAtom = atomWithStorage<Map<EventId, SportingEvent>>(
  "events",
  new Map(),
  createMapStorage<EventId, SportingEvent>(),
  { getOnInit: true },
);

// Join requests atom - stores all requests as a Map
export const requestsAtom = atomWithStorage<Map<RequestId, JoinRequest>>(
  "requests",
  new Map(),
  createMapStorage<RequestId, JoinRequest>(),
  { getOnInit: true },
);

// Auth state atom - stores current user authentication state
export const authAtom = atomWithStorage<AuthState>(
  "auth",
  { currentUserId: null, isAuthenticated: false },
  createJsonStorage<AuthState>(),
  { getOnInit: true },
);

// Get current authenticated user
export const currentUserAtom = atom(get => {
  const auth = get(authAtom);
  const users = get(usersAtom);

  if (!auth.isAuthenticated || !auth.currentUserId) {
    return null;
  }

  return users.get(auth.currentUserId) ?? null;
});

// Get all future events sorted by start time (ascending)
export const futureEventsAtom = atom(get => {
  const events = get(eventsAtom);
  const now = Date.now();

  return Array.from(events.values())
    .filter(event => event.startTime > now)
    .sort((a, b) => a.startTime - b.startTime);
});

// Get requests by event ID
export const requestsByEventAtom = atom(get => {
  const requests = get(requestsAtom);
  const byEvent = new Map<EventId, JoinRequest[]>();

  requests.forEach(request => {
    const eventRequests = byEvent.get(request.eventId) ?? [];
    eventRequests.push(request);
    byEvent.set(request.eventId, eventRequests);
  });

  return byEvent;
});

// Get requests by user ID
export const requestsByUserAtom = atom(get => {
  const requests = get(requestsAtom);
  const byUser = new Map<UserId, JoinRequest[]>();

  requests.forEach(request => {
    const userRequests = byUser.get(request.userId) ?? [];
    userRequests.push(request);
    byUser.set(request.userId, userRequests);
  });

  return byUser;
});

// Get event with full details including participants
export const eventDetailsAtom = atom(get => (eventId: EventId): EventWithParticipants | null => {
  const events = get(eventsAtom);
  const requests = get(requestsAtom);
  const users = get(usersAtom);

  const event = events.get(eventId);
  if (!event) return null;

  const eventRequests = Array.from(requests.values()).filter(req => req.eventId === eventId);
  const acceptedPlayers = eventRequests.filter(req => req.status === "ACCEPTED").map(req => req.userId);
  const pendingRequests = eventRequests.filter(req => req.status === "PENDING");
  const organizer = users.get(event.organizerId);

  return {
    acceptedPlayers,
    event,
    organizerUsername: organizer?.username ?? "Unknown",
    pendingRequests,
  };
});

// Get user's events summary (created, joined, pending)
export const userEventsSummaryAtom = atom(get => (userId: UserId): UserEventsSummary => {
  const events = get(eventsAtom);
  const requests = get(requestsAtom);

  const createdEvents = Array.from(events.values())
    .filter(event => event.organizerId === userId)
    .map(event => event.id);

  const userRequests = Array.from(requests.values()).filter(req => req.userId === userId);

  const joinedEvents = userRequests.filter(req => req.status === "ACCEPTED").map(req => req.eventId);

  const pendingRequestIds = userRequests.filter(req => req.status === "PENDING").map(req => req.id);

  return {
    createdEvents,
    joinedEvents,
    pendingRequests: pendingRequestIds,
  };
});

// Check if user can join an event
export const canJoinEventAtom = atom(
  get =>
    (eventId: EventId, userId: UserId): { canJoin: boolean; reason?: string } => {
      const events = get(eventsAtom);
      const requests = get(requestsAtom);
      const now = Date.now();

      const event = events.get(eventId);
      if (!event) {
        return { canJoin: false, reason: "Event not found" };
      }

      // Check if event has started
      if (event.startTime <= now) {
        return { canJoin: false, reason: "Event has already started" };
      }

      // Check if user is the organizer
      if (event.organizerId === userId) {
        return { canJoin: false, reason: "You are the organizer" };
      }

      // Check if user already has a request
      const userRequest = Array.from(requests.values()).find(req => req.eventId === eventId && req.userId === userId);

      if (userRequest) {
        if (userRequest.status === "ACCEPTED") {
          return { canJoin: false, reason: "You are already accepted" };
        }
        if (userRequest.status === "PENDING") {
          return { canJoin: false, reason: "You have a pending request" };
        }
      }

      // Check if event is full
      const acceptedCount = Array.from(requests.values()).filter(
        req => req.eventId === eventId && req.status === "ACCEPTED",
      ).length;

      if (acceptedCount >= event.maxPlayers) {
        return { canJoin: false, reason: "Event is full" };
      }

      return { canJoin: true };
    },
);

// Get all participants for an event
export const eventParticipantsAtom = atom(get => (eventId: EventId): User[] => {
  const requests = get(requestsAtom);
  const users = get(usersAtom);

  const acceptedUserIds = Array.from(requests.values())
    .filter(req => req.eventId === eventId && req.status === "ACCEPTED")
    .map(req => req.userId);

  return acceptedUserIds.map(id => users.get(id)).filter((user): user is User => user !== undefined);
});

// Get pending requests for an event (for organizer)
export const pendingRequestsForEventAtom = atom(get => (eventId: EventId): (JoinRequest & { user: User })[] => {
  const requests = get(requestsAtom);
  const users = get(usersAtom);

  return Array.from(requests.values())
    .filter(req => req.eventId === eventId && req.status === "PENDING")
    .map(req => {
      const user = users.get(req.userId);
      return user ? { ...req, user } : null;
    })
    .filter((item): item is JoinRequest & { user: User } => item !== null);
});
