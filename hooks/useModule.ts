import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo } from "react";

import { loginUserAtom, logoutUserAtom, registerUserAtom } from "@/state/auth";
import {
  acceptJoinRequestAtom,
  cancelJoinRequestAtom,
  createEventAtom,
  createJoinRequestAtom,
  deleteEventAtom,
  rejectJoinRequestAtom,
  updateEventAtom,
  expirePendingRequestsAtom,
} from "@/state/event";
import {
  authAtom,
  canJoinEventAtom,
  currentUserAtom,
  eventDetailsAtom,
  eventParticipantsAtom,
  eventsAtom,
  futureEventsAtom,
  pendingRequestsForEventAtom,
  requestsAtom,
  userEventsSummaryAtom,
  usersAtom,
} from "@/state/atoms";

// ============================================================================
// Authentication Hooks
// ============================================================================

export const useAuth = () => {
  const auth = useAtomValue(authAtom);
  const currentUser = useAtomValue(currentUserAtom);
  const register = useSetAtom(registerUserAtom);
  const login = useSetAtom(loginUserAtom);
  const logout = useSetAtom(logoutUserAtom);

  return {
    auth,
    currentUser,
    isAuthenticated: auth.isAuthenticated,
    login,
    logout,
    register,
  };
};

// ============================================================================
// Event Hooks
// ============================================================================

export const useFutureEvents = () => {
  const events = useAtomValue(futureEventsAtom);
  const expireRequests = useSetAtom(expirePendingRequestsAtom);

  // Expire old requests when component mounts or events change
  useEffect(() => {
    expireRequests();
  }, [expireRequests, events.length]);

  return events;
};

export const useEventDetails = (eventId: EventId) => {
  const getEventDetails = useAtomValue(eventDetailsAtom);

  // Memoize to prevent recalculation on every render
  return useMemo(() => getEventDetails(eventId), [getEventDetails, eventId]);
};

export const useEventParticipants = (eventId: EventId) => {
  const getParticipants = useAtomValue(eventParticipantsAtom);

  return useMemo(() => getParticipants(eventId), [getParticipants, eventId]);
};

export const usePendingRequestsForEvent = (eventId: EventId) => {
  const getPendingRequests = useAtomValue(pendingRequestsForEventAtom);

  return useMemo(() => getPendingRequests(eventId), [getPendingRequests, eventId]);
};

export const useCanJoinEvent = (eventId: EventId, userId: UserId) => {
  const checkCanJoin = useAtomValue(canJoinEventAtom);

  return useMemo(() => checkCanJoin(eventId, userId), [checkCanJoin, eventId, userId]);
};

// ============================================================================
// Event Actions Hooks
// ============================================================================

export const useCreateEvent = () => {
  const createEvent = useSetAtom(createEventAtom);

  return useCallback(
    async (eventData: Omit<SportingEvent, "id" | "organizerId" | "createdAt">) => {
      try {
        const event = createEvent(eventData);
        return { event, success: true };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "Unknown error",
          success: false,
        };
      }
    },
    [createEvent],
  );
};

export const useUpdateEvent = () => {
  const updateEvent = useSetAtom(updateEventAtom);

  return useCallback(
    async (eventId: EventId, updates: Partial<SportingEvent>) => {
      try {
        const event = updateEvent({ eventId, updates });
        return { event, success: true };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "Unknown error",
          success: false,
        };
      }
    },
    [updateEvent],
  );
};

export const useDeleteEvent = () => {
  const deleteEvent = useSetAtom(deleteEventAtom);

  return useCallback(
    async (eventId: EventId) => {
      try {
        deleteEvent(eventId);
        return { success: true };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "Unknown error",
          success: false,
        };
      }
    },
    [deleteEvent],
  );
};

// ============================================================================
// Request Actions Hooks
// ============================================================================

export const useJoinEvent = () => {
  const createRequest = useSetAtom(createJoinRequestAtom);

  return useCallback(
    async (eventId: EventId) => {
      try {
        const request = createRequest(eventId);
        return { request, success: true };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "Unknown error",
          success: false,
        };
      }
    },
    [createRequest],
  );
};

export const useAcceptRequest = () => {
  const acceptRequest = useSetAtom(acceptJoinRequestAtom);

  return useCallback(
    async (requestId: RequestId) => {
      try {
        const request = acceptRequest(requestId);
        return { request, success: true };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "Unknown error",
          success: false,
        };
      }
    },
    [acceptRequest],
  );
};

export const useRejectRequest = () => {
  const rejectRequest = useSetAtom(rejectJoinRequestAtom);

  return useCallback(
    async (requestId: RequestId) => {
      try {
        const request = rejectRequest(requestId);
        return { request, success: true };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "Unknown error",
          success: false,
        };
      }
    },
    [rejectRequest],
  );
};

export const useCancelRequest = () => {
  const cancelRequest = useSetAtom(cancelJoinRequestAtom);

  return useCallback(
    async (requestId: RequestId) => {
      try {
        const request = cancelRequest(requestId);
        return { request, success: true };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "Unknown error",
          success: false,
        };
      }
    },
    [cancelRequest],
  );
};

// ============================================================================
// User Profile Hooks
// ============================================================================

export const useUserEventsSummary = (userId: UserId) => {
  const getSummary = useAtomValue(userEventsSummaryAtom);

  return useMemo(() => getSummary(userId), [getSummary, userId]);
};

export const useCurrentUserEvents = () => {
  const currentUser = useAtomValue(currentUserAtom);
  const getSummary = useAtomValue(userEventsSummaryAtom);

  return useMemo(() => {
    if (!currentUser) {
      return {
        createdEvents: [],
        joinedEvents: [],
        pendingRequests: [],
      };
    }
    return getSummary(currentUser.id);
  }, [currentUser, getSummary]);
};

// ============================================================================
// Direct Atom Access (for advanced use cases)
// ============================================================================

export const useEvents = () => useAtomValue(eventsAtom);
export const useRequests = () => useAtomValue(requestsAtom);
export const useUsers = () => useAtomValue(usersAtom);
