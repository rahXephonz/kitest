import { atom } from "jotai";

import { authAtom, eventsAtom, requestsAtom, usersAtom } from "./atoms";

export const clearAllDataAtom = atom(null, (_get, set) => {
  set(usersAtom, new Map());
  set(eventsAtom, new Map());
  set(requestsAtom, new Map());
  set(authAtom, { currentUserId: null, isAuthenticated: false });
});
