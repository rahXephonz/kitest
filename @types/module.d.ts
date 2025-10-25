type UserId = string;
type EventId = string;
type RequestId = string;

enum EventStatus {
  UPCOMING = "Upcoming",
  INPROGRESS = "In Progress",
  COMPLETED = "Completed",
}

enum RequestStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

interface User {
  id: UserId;
  username: string;
  createdAt: number;
  passwordHash: string;
}

interface SportingEvent {
  id: EventId;
  title: string;
  sport: string;
  endTime: number;
  location: string;
  startTime: number;
  createdAt: number;
  maxPlayers: number;
  description: string;
  organizerId: UserId;
}

interface JoinRequest {
  id: RequestId;
  userId: UserId;
  eventId: EventId;
  createdAt: number;
  updatedAt: number;
  status: RequestStatus;
}

interface AuthState {
  isAuthenticated: boolean;
  currentUserId: UserId | null;
}

interface EventWithParticipants {
  event: SportingEvent;
  acceptedPlayers: UserId[];
  organizerUsername: string;
  pendingRequests: JoinRequest[];
}

interface UserEventsSummary {
  joinedEvents: EventId[];
  createdEvents: EventId[];
  pendingRequests: RequestId[];
}
