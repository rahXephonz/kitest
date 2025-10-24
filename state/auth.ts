import { atom } from "jotai";
import { nanoid } from "nanoid/non-secure";

import { usersAtom, authAtom } from "./atoms";

const hashPassword = (password: string): string => {
  // This is a placeholder - use proper hashing in production
  return `hashed_${password}`;
};

const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

export const registerUserAtom = atom(
  null,
  (get, set, { password, username }: { username: string; password: string }) => {
    const users = get(usersAtom);

    const existingUser = Array.from(users.values()).find(user => user.username === username);

    if (existingUser) {
      console.log("User already exist");
    }

    const newUser: User = {
      createdAt: Date.now(),
      id: nanoid(),
      passwordHash: hashPassword(password),
      username,
    };

    // Update users map
    const updatedUsers = new Map(users);
    updatedUsers.set(newUser.id, newUser);
    set(usersAtom, updatedUsers);

    // Auto-login after registration
    set(authAtom, {
      currentUserId: newUser.id,
      isAuthenticated: true,
    });

    return newUser;
  },
);

export const loginUserAtom = atom(null, (get, set, { password, username }: { username: string; password: string }) => {
  const users = get(usersAtom);
  const user = Array.from(users.values()).find(u => u.username === username);

  if (!user) {
    console.log("No user exist");
    return;
  }

  if (!verifyPassword(password, user.passwordHash)) {
    console.log("Invalid username or password");
  }

  set(authAtom, {
    currentUserId: user.id,
    isAuthenticated: true,
  });

  return user;
});

export const logoutUserAtom = atom(null, (get, set) => {
  set(authAtom, {
    currentUserId: null,
    isAuthenticated: false,
  });
});
