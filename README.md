# Sporting Events App - Kitest

A comprehensive state management solution for a sporting events application built with **React Native**, **Jotai**, and **MMKV**.

## Architecture Overview

### Technology Stack

- **Jotai**: Atomic state management for React
- **MMKV**: Fast, persistent key-value storage for React Native
- **TypeScript**: Type safety throughout the application

### Design Principles

1. **Atomic State**: Each piece of state (users, events, requests) is stored in separate atoms
2. **Persistence**: All data is automatically persisted to MMKV storage
3. **Derived State**: Computed values are derived from base atoms using Jotai's atom composition
4. **Immutable Updates**: All state updates create new Map instances for React's reconciliation
5. **Type Safety**: Full TypeScript coverage for all state operations

## File Structure

```
├── @types/module.d.ts              # TypeScript type definitions
├── storage.ts                      # MMKV storage utilities
├── atoms.ts                        # Jotai atoms (base and derived)
├── @/state/*.ts                    # Write-Read atoms for mutations
├── @hooks/module.ts                # Custom React hooks for components
└── package.json                    # Dependencies
```

## Core Concepts

### 1. Base Atoms (Persisted State)

These atoms store the core data and are automatically persisted to MMKV:

- `usersAtom`: Map of all users
- `eventsAtom`: Map of all sporting events
- `requestsAtom`: Map of all join requests
- `authAtom`: Current authentication state

```typescript
// Example: Base atom with MMKV persistence
export const eventsAtom = atomWithStorage<Map<EventId, SportingEvent>>("events", new Map(), mmkvStorage, {
  getOnInit: true,
});
```

### 2. Derived Atoms (Computed State)

These atoms compute values from base atoms without storing additional state:

- `currentUserAtom`: Get the currently logged-in user
- `futureEventsAtom`: Get upcoming events sorted by time
- `eventDetailsAtom`: Get full event details with participants
- `canJoinEventAtom`: Check if a user can join an event

```typescript
// Example: Derived atom
export const futureEventsAtom = atom(get => {
  const events = get(eventsAtom);
  const now = Date.now();

  return Array.from(events.values())
    .filter(event => event.startTime > now)
    .sort((a, b) => a.startTime - b.startTime);
});
```

### 3. Action Atoms (Mutations)

Write-only atoms that encapsulate business logic for state mutations:

- `registerUserAtom`: Register a new user
- `loginUserAtom`: Authenticate a user
- `createEventAtom`: Create a sporting event
- `createJoinRequestAtom`: Request to join an event
- `acceptJoinRequestAtom`: Accept a join request (organizer only)
- `rejectJoinRequestAtom`: Reject a join request (organizer only)
- `cancelJoinRequestAtom`: Cancel a pending request (requester only)

```typescript
// Example: Action atom with validation
export const createJoinRequestAtom = atom(null, (get, set, eventId: EventId) => {
  const auth = get(authAtom);

  // Validation logic
  if (!auth.isAuthenticated) {
    throw new Error("User must be authenticated");
  }

  // Create and persist new request
  const newRequest = {
    /* ... */
  };
  const updatedRequests = new Map(get(requestsAtom));
  updatedRequests.set(newRequest.id, newRequest);
  set(requestsAtom, updatedRequests);

  return newRequest;
});
```

### 4. Custom Hooks

React hooks that provide a clean API for components:

```typescript
// Authentication
const { currentUser, login, logout, register } = useAuth();

// Events
const events = useFutureEvents();
const eventDetails = useEventDetails(eventId);
const participants = useEventParticipants(eventId);

// Actions
const createEvent = useCreateEvent();
const joinEvent = useJoinEvent();
const acceptRequest = useAcceptRequest();
```

## Usage Examples

### Setup

```typescript
import { Provider } from 'jotai';

export const App = () => (
  <Provider>
    <YourAppContent />
  </Provider>
);
```

### Authentication

```typescript
const LoginScreen = () => {
  const { login, register } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await login({ username, password });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    // ... UI components
  );
};
```

### Display Events

```typescript
const HomeScreen = () => {
  const events = useFutureEvents(); // Auto-sorted by start time

  return (
    <FlatList
      data={events}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <EventCard event={item} />
      )}
    />
  );
};
```

### Join Event

```typescript
const EventDetailsScreen = ({ eventId }) => {
  const { currentUser } = useAuth();
  const eventDetails = useEventDetails(eventId);
  const canJoin = useCanJoinEvent(eventId, currentUser?.id || '');
  const joinEvent = useJoinEvent();

  const handleJoin = async () => {
    const result = await joinEvent(eventId);
    if (!result.success) {
      alert(result.error);
    }
  };

  return (
    <View>
      <Text>{eventDetails?.event.title}</Text>
      {canJoin.canJoin ? (
        <Button title="Join Event" onPress={handleJoin} />
      ) : (
        <Text>{canJoin.reason}</Text>
      )}
    </View>
  );
};
```

### Manage Requests (Organizer)

```typescript
const ManageRequestsScreen = ({ eventId }) => {
  const pendingRequests = usePendingRequestsForEvent(eventId);
  const acceptRequest = useAcceptRequest();
  const rejectRequest = useRejectRequest();

  return (
    <FlatList
      data={pendingRequests}
      renderItem={({ item }) => (
        <View>
          <Text>{item.user.username}</Text>
          <Button
            title="Accept"
            onPress={() => acceptRequest(item.id)}
          />
          <Button
            title="Reject"
            onPress={() => rejectRequest(item.id)}
          />
        </View>
      )}
    />
  );
};
```

## Key Features Implemented

### 1. Authentication

- ✅ User registration with username/password
- ✅ User login with validation
- ✅ Persistent authentication state
- ✅ Password hashing (placeholder - use bcrypt in production)

### 2. Event Management

- ✅ Create events with time, location, and player limits
- ✅ Update events (organizer only)
- ✅ Delete events (organizer only)
- ✅ View future events sorted by start time
- ✅ View event details with participants

### 3. Join Request System

- ✅ Request to join events
- ✅ Accept/reject requests (organizer only)
- ✅ Cancel requests before event starts
- ✅ Auto-expire pending requests when events start
- ✅ Validation: max players, event started, duplicate requests

### 4. Data Queries

- ✅ List participants in an event
- ✅ Check if user can join an event
- ✅ Get user's created events
- ✅ Get user's joined events
- ✅ Get user's pending requests

## State Flow Diagram

```
┌─────────────┐
│   MMKV      │ ← Persistent Storage
│   Storage   │
└──────┬──────┘
       │
       │ (Auto-sync)
       │
┌──────▼──────┐
│ Base Atoms  │ ← users, events, requests, auth
└──────┬──────┘
       │
       │ (Derive)
       │
┌──────▼──────────┐
│ Derived Atoms   │ ← futureEvents, eventDetails, etc.
└──────┬──────────┘
       │
       │ (Read)
       │
┌──────▼──────────┐
│ Custom Hooks    │ ← useAuth, useFutureEvents, etc.
└──────┬──────────┘
       │
       │ (Use)
       │
┌──────▼──────────┐
│ React Components│
└─────────────────┘
```

## Performance Considerations

1. **Map-based Storage**: Using `Map<ID, Entity>` for O(1) lookups
2. **Memoization**: Jotai automatically memoizes derived atoms
3. **Selective Updates**: Only affected components re-render
4. **MMKV Performance**: Native C++ implementation, faster than AsyncStorage

## Business Rules Enforced

1. **Event Joining**:

   - Users cannot join their own events
   - Users cannot join events that have started
   - Users cannot join full events
   - Users can only have one active request per event

2. **Request Management**:

   - Only organizers can accept/reject requests
   - Only requesters can cancel their own requests
   - Requests cannot be canceled after event starts
   - Pending requests expire when events start

3. **Authentication**:
   - Usernames must be unique
   - Users must be authenticated for all actions except login/register

## Testing Strategy

```typescript
// Example test setup
import { createStore } from "jotai";

describe("Event Creation", () => {
  it("should create event when authenticated", () => {
    const store = createStore();

    // Set auth state
    store.set(authAtom, {
      currentUserId: "user-1",
      isAuthenticated: true,
    });

    // Create event
    const event = store.set(createEventAtom, {
      title: "Basketball Game",
      sport: "Basketball",
      // ...
    });

    expect(event.id).toBeDefined();
  });
});
```

## Production Considerations

1. **Password Security**: Replace placeholder hash with bcrypt or argon2
2. **Error Handling**: Add global error boundary and logging
3. **Offline Support**: MMKV already provides offline-first storage
4. **Data Migration**: Add version numbers and migration logic
5. **Performance**: Add pagination for large event lists
6. **Real-time Updates**: Consider WebSocket integration for live updates
7. **Image Upload**: Add support for event images
8. **Push Notifications**: Notify users when requests are accepted/rejected

## Advantages of This Architecture

1. **Type Safety**: Full TypeScript coverage catches errors at compile time
2. **Predictable**: Unidirectional data flow, immutable updates
3. **Testable**: Pure functions for business logic
4. **Performant**: Atomic updates, minimal re-renders
5. **Maintainable**: Clear separation of concerns
6. **Scalable**: Easy to add new features without refactoring

## License

MIT
