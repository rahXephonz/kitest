import { atom } from "jotai";

import { authAtom, eventsAtom, requestsAtom } from "./atoms";

const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const createEventAtom = atom(
  null,
  (get, set, eventData: Omit<SportingEvent, "id" | "organizerId" | "createdAt">) => {
    const auth = get(authAtom);

    if (!auth.isAuthenticated || !auth.currentUserId) {
      throw new Error("User must be authenticated to create an event");
    }

    const events = get(eventsAtom);

    const newEvent: SportingEvent = {
      id: generateUUID(),
      ...eventData,
      createdAt: Date.now(),
      organizerId: auth.currentUserId,
    };

    const updatedEvents = new Map(events);
    updatedEvents.set(newEvent.id, newEvent);
    set(eventsAtom, updatedEvents);

    return newEvent;
  },
);

export const updateEventAtom = atom(
  null,
  (get, set, { eventId, updates }: { eventId: EventId; updates: Partial<SportingEvent> }) => {
    const auth = get(authAtom);
    const events = get(eventsAtom);

    if (!auth.isAuthenticated || !auth.currentUserId) {
      throw new Error("User must be authenticated");
    }

    const event = events.get(eventId);

    if (!event) {
      throw new Error("Event not found");
    }

    if (event.organizerId !== auth.currentUserId) {
      throw new Error("Only the organizer can update the event");
    }

    const updatedEvent = { ...event, ...updates };
    const updatedEvents = new Map(events);
    updatedEvents.set(eventId, updatedEvent);
    set(eventsAtom, updatedEvents);

    return updatedEvent;
  },
);

export const deleteEventAtom = atom(null, (get, set, eventId: EventId) => {
  const auth = get(authAtom);
  const events = get(eventsAtom);
  const requests = get(requestsAtom);

  if (!auth.isAuthenticated || !auth.currentUserId) {
    throw new Error("User must be authenticated");
  }

  const event = events.get(eventId);

  if (!event) {
    throw new Error("Event not found");
  }

  if (event.organizerId !== auth.currentUserId) {
    throw new Error("Only the organizer can delete the event");
  }

  // Delete event
  const updatedEvents = new Map(events);
  updatedEvents.delete(eventId);
  set(eventsAtom, updatedEvents);

  // Delete all associated requests
  const updatedRequests = new Map(requests);
  requests.forEach((request, requestId) => {
    if (request.eventId === eventId) {
      updatedRequests.delete(requestId);
    }
  });

  set(requestsAtom, updatedRequests);
});

// ============================================================================
// Join Request Actions
// ============================================================================

export const createJoinRequestAtom = atom(null, (get, set, eventId: EventId) => {
  const auth = get(authAtom);
  const events = get(eventsAtom);
  const requests = get(requestsAtom);

  if (!auth.isAuthenticated || !auth.currentUserId) {
    throw new Error("User must be authenticated to join an event");
  }

  const event = events.get(eventId);
  const now = Date.now();

  if (!event) {
    throw new Error("Event not found");
  }

  // Validate can join
  if (event.startTime <= now) {
    throw new Error("Event has already started");
  }

  if (event.organizerId === auth.currentUserId) {
    throw new Error("Organizer cannot join their own event");
  }

  // Check for existing request
  const existingRequest = Array.from(requests.values()).find(
    req =>
      req.eventId === eventId &&
      req.userId === auth.currentUserId &&
      (req.status === "PENDING" || req.status === "ACCEPTED"),
  );

  if (existingRequest) {
    throw new Error(`You already have a ${existingRequest.status.toLowerCase()} request`);
  }

  // Check if event is full
  const acceptedCount = Array.from(requests.values()).filter(
    req => req.eventId === eventId && req.status === "ACCEPTED",
  ).length;

  if (acceptedCount >= event.maxPlayers) {
    throw new Error("Event is full");
  }

  // Create request
  const newRequest: JoinRequest = {
    createdAt: now,
    eventId,
    id: generateUUID(),
    status: "PENDING" as RequestStatus,
    updatedAt: now,
    userId: auth.currentUserId,
  };

  const updatedRequests = new Map(requests);
  updatedRequests.set(newRequest.id, newRequest);
  set(requestsAtom, updatedRequests);

  return newRequest;
});

export const acceptJoinRequestAtom = atom(null, (get, set, requestId: RequestId) => {
  const auth = get(authAtom);
  const events = get(eventsAtom);
  const requests = get(requestsAtom);

  if (!auth.isAuthenticated || !auth.currentUserId) {
    throw new Error("User must be authenticated");
  }

  const request = requests.get(requestId);

  if (!request) {
    throw new Error("Request not found");
  }

  const event = events.get(request.eventId);

  if (!event) {
    throw new Error("Event not found");
  }

  if (event.organizerId !== auth.currentUserId) {
    throw new Error("Only the organizer can accept requests");
  }

  if (request.status !== "PENDING") {
    throw new Error("Request is not pending");
  }

  // Check if event is full
  const acceptedCount = Array.from(requests.values()).filter(
    req => req.eventId === request.eventId && req.status === "ACCEPTED",
  ).length;

  if (acceptedCount >= event.maxPlayers) {
    throw new Error("Event is full");
  }

  // Accept request
  const updatedRequest = {
    ...request,
    status: "ACCEPTED" as RequestStatus,
    updatedAt: Date.now(),
  };

  const updatedRequests = new Map(requests);
  updatedRequests.set(requestId, updatedRequest);
  set(requestsAtom, updatedRequests);

  return updatedRequest;
});

export const rejectJoinRequestAtom = atom(null, (get, set, requestId: RequestId) => {
  const auth = get(authAtom);
  const events = get(eventsAtom);
  const requests = get(requestsAtom);

  if (!auth.isAuthenticated || !auth.currentUserId) {
    throw new Error("User must be authenticated");
  }

  const request = requests.get(requestId);

  if (!request) {
    throw new Error("Request not found");
  }

  const event = events.get(request.eventId);

  if (!event) {
    throw new Error("Event not found");
  }

  if (event.organizerId !== auth.currentUserId) {
    throw new Error("Only the organizer can reject requests");
  }

  if (request.status !== "PENDING") {
    throw new Error("Request is not pending");
  }

  // Reject request
  const updatedRequest = {
    ...request,
    status: "REJECTED" as RequestStatus,
    updatedAt: Date.now(),
  };

  const updatedRequests = new Map(requests);
  updatedRequests.set(requestId, updatedRequest);
  set(requestsAtom, updatedRequests);

  return updatedRequest;
});

export const cancelJoinRequestAtom = atom(null, (get, set, requestId: RequestId) => {
  const auth = get(authAtom);
  const events = get(eventsAtom);
  const requests = get(requestsAtom);

  if (!auth.isAuthenticated || !auth.currentUserId) {
    throw new Error("User must be authenticated");
  }

  const request = requests.get(requestId);

  if (!request) {
    throw new Error("Request not found");
  }

  if (request.userId !== auth.currentUserId) {
    throw new Error("You can only cancel your own requests");
  }

  if (request.status !== "PENDING") {
    throw new Error("Can only cancel pending requests");
  }

  const event = events.get(request.eventId);

  if (!event) {
    throw new Error("Event not found");
  }

  // Check if event has started
  if (event.startTime <= Date.now()) {
    throw new Error("Cannot cancel request after event has started");
  }

  // Cancel request
  const updatedRequest = {
    ...request,
    status: "CANCELLED" as RequestStatus,
    updatedAt: Date.now(),
  };

  const updatedRequests = new Map(requests);
  updatedRequests.set(requestId, updatedRequest);
  set(requestsAtom, updatedRequests);

  return updatedRequest;
});

// Expire all pending requests for events that have started
export const expirePendingRequestsAtom = atom(null, (get, set) => {
  const events = get(eventsAtom);
  const requests = get(requestsAtom);
  const now = Date.now();

  const updatedRequests = new Map(requests);
  let expiredCount = 0;

  requests.forEach((request, requestId) => {
    if (request.status === "PENDING") {
      const event = events.get(request.eventId);

      if (event && event.startTime <= now) {
        updatedRequests.set(requestId, {
          ...request,
          status: "EXPIRED" as RequestStatus,
          updatedAt: now,
        });
        expiredCount++;
      }
    }
  });

  if (expiredCount > 0) {
    set(requestsAtom, updatedRequests);
  }

  return expiredCount;
});
