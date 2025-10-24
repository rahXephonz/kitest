import { MMKV } from "react-native-mmkv";

export const storage = new MMKV({
  encryptionKey: process.env.EXPO_STORAGE_ENCRYPTION_KEY,
  id: "sporting-events-db",
});

export const StorageKeys = {
  AUTH: "auth",
  EVENTS: "events",
  REQUESTS: "requests",
  USERS: "users",
} as const;

export const StorageHelpers = {
  //For Users
  getUsers(): Map<string, User> {
    const data = storage.getString(StorageKeys.USERS);
    if (!data) return new Map();
    const obj = JSON.parse(data);
    return new Map(Object.entries(obj));
  },

  setUsers(users: Map<string, User>): void {
    const obj = Object.fromEntries(users);
    storage.set(StorageKeys.USERS, JSON.stringify(obj));
  },

  //For Events
  getEvents(): Map<string, SportingEvent> {
    const data = storage.getString(StorageKeys.EVENTS);
    if (!data) return new Map();
    const obj = JSON.parse(data);
    return new Map(Object.entries(obj));
  },

  setEvents(events: Map<string, SportingEvent>): void {
    const obj = Object.fromEntries(events);
    storage.set(StorageKeys.EVENTS, JSON.stringify(obj));
  },

  //For Join Requests
  getRequests(): Map<string, JoinRequest> {
    const data = storage.getString(StorageKeys.REQUESTS);
    if (!data) return new Map();
    const obj = JSON.parse(data);
    return new Map(Object.entries(obj));
  },

  setRequests(requests: Map<string, JoinRequest>): void {
    const obj = Object.fromEntries(requests);
    storage.set(StorageKeys.REQUESTS, JSON.stringify(obj));
  },

  //For Auth State
  getAuth(): AuthState {
    const data = storage.getString(StorageKeys.AUTH);
    if (!data) return { currentUserId: null, isAuthenticated: false };
    return JSON.parse(data);
  },

  setAuth(auth: AuthState): void {
    storage.set(StorageKeys.AUTH, JSON.stringify(auth));
  },

  //For (for logout/reset)
  clearAll(): void {
    storage.clearAll();
  },
};
