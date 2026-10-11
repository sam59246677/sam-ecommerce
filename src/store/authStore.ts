
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types/user";

interface RegisteredUser {
  user: User;
  password: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  registeredUsers: RegisteredUser[];
  login: (user: User) => void;
  authenticate: (email: string, password: string) => User | null;
  registerUser: (name: string, email: string, password: string ) => User | null;
  logout: () => void;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      registeredUsers: [],

      login: (user) => {
        set({
          user,
          isAuthenticated: true,
        });
      },

      authenticate: (email, password) => {
        const normalizedEmail = email.trim().toLowerCase();
        let user: User | null = null;

        if (
          normalizedEmail === "admin@example.com" &&
          password === "admin123"
        ) {
          user = {
            id: 2,
            name: "Admin",
            email: normalizedEmail,
            role: "admin",
          };
        } else if (
          normalizedEmail === "customer@example.com" &&
          password === "customer123"
        ) {
          user = {
            id: 1,
            name: "Customer",
            email: normalizedEmail,
            role: "customer",
          };
        } else {
          const registeredUser = get().registeredUsers.find(
            (item) =>
              item.user.email === normalizedEmail &&
              item.password === password
          );

          if (registeredUser) {
            user = registeredUser.user;
          }
        }

        if (!user) {
          return null;
        }

        set({
          user,
          isAuthenticated: true,
        });

        return user;
      },

      registerUser: (name, email, password) => {
        const normalizedName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();
        const emailExists = get().registeredUsers.some( (item) => item.user.email === normalizedEmail );

        if (
          !normalizedName ||
          !normalizedEmail ||
          !password ||
          emailExists ||
          normalizedEmail === "admin@example.com" ||
          normalizedEmail === "customer@example.com"
        ) {
          return null;
        }

        const newUser: User = {
          id: Date.now(),
          name: normalizedName,
          email: normalizedEmail,
          role: "customer",
        };

        set((state) => ({
          registeredUsers: [
            ...state.registeredUsers,
            {
              user: newUser,
              password,
            },
          ],
          user: newUser,
          isAuthenticated: true,
        }));

        return newUser;
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
export default useAuthStore;