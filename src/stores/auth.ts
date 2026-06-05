import { create } from "zustand";
import api, { clearAuthToken, getAuthToken, setAuthToken } from "@/lib/api";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role?: "user" | "admin" | "super-admin";
  isVerified?: boolean;
  avatar?: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ user: AuthUser; token?: string }>;
  register: (name: string, email: string, password: string) => Promise<unknown>;
  logout: () => Promise<void>;
  refresh: () => Promise<AuthUser | null>;
}

const computeAdmin = (u: AuthUser | null) =>
  !!u && (u.role === "admin" || u.role === "super-admin");

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,
  isAuthenticated: false,
  isAdmin: false,

  init: async () => {
    if (get().initialized) return;
    set({ initialized: true });
    if (typeof window === "undefined") {
      set({ loading: false });
      return;
    }
    if (!getAuthToken()) {
      set({
        user: null,
        loading: false,
        isAuthenticated: false,
        isAdmin: false,
      });
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      const user: AuthUser = data.user;
      set({
        user,
        loading: false,
        isAuthenticated: !!user,
        isAdmin: computeAdmin(user),
      });
    } catch {
      clearAuthToken();
      set({
        user: null,
        loading: false,
        isAuthenticated: false,
        isAdmin: false,
      });
    }
  },

  refresh: async () => {
    try {
      const { data } = await api.get("/auth/me");
      const user: AuthUser = data.user;
      set({ user, isAuthenticated: !!user, isAdmin: computeAdmin(user) });
      return user;
    } catch {
      return null;
    }
  },

  login: async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    if (data.token) setAuthToken(data.token);
    set({
      user: data.user,
      isAuthenticated: !!data.user,
      isAdmin: computeAdmin(data.user),
    });
    return data;
  },

  register: async (name, email, password) => {
    const { data } = await api.post("/auth/signup", { name, email, password });
    return data;
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore
    } finally {
      clearAuthToken();
      set({ user: null, isAuthenticated: false, isAdmin: false });
    }
  },
}));
