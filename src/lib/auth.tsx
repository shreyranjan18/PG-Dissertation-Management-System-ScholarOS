import * as React from "react";
import apiClient from "./apiClient";
import type { Role } from "./mock";

const THEME_KEY = "pgdms.theme";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  department: string | null;
  roll_number: string | null;
  employee_id: string | null;
  phone: string | null;
  avatar_url: string | null;
};

export type AppUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar: string;
  department: string | null;
  profile: Profile | null;
};

type Ctx = {
  user: AppUser | null;
  loading: boolean;
  login: (token: string, user: any) => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  theme: "dark" | "light";
  toggleTheme: () => void;
};

const AuthCtx = React.createContext<Ctx | null>(null);

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  return (parts[0][0] + (parts[parts.length - 1][0] ?? "")).toUpperCase();
}

function mapLaravelUserToAppUser(user: any): AppUser {
  return {
    id: String(user.id),
    email: user.email,
    name: user.name,
    role: (user.role as Role) || "student",
    avatar: initials(user.name),
    department: user.department || null,
    profile: null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AppUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [theme, setTheme] = React.useState<"dark" | "light">("dark");

  // Theme bootstrap
  React.useEffect(() => {
    try {
      const t = (localStorage.getItem(THEME_KEY) as "dark" | "light") || "dark";
      setTheme(t);
    } catch {}
  }, []);
  
  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
    try { localStorage.setItem(THEME_KEY, theme); } catch {}
  }, [theme]);

  // Auth bootstrap
  React.useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      apiClient.get('/auth/me')
        .then(res => {
          setUser(mapLaravelUserToAppUser(res.data));
        })
        .catch(() => {
          localStorage.removeItem('auth_token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token: string, userData: any) => {
    localStorage.setItem('auth_token', token);
    setUser(mapLaravelUserToAppUser(userData));
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const refresh = async () => {
    try {
      const res = await apiClient.get('/auth/me');
      setUser(mapLaravelUserToAppUser(res.data));
    } catch (e) {
      setUser(null);
    }
  };

  const value: Ctx = {
    user,
    loading,
    login,
    logout,
    refresh,
    theme,
    toggleTheme: () => setTheme(t => (t === "dark" ? "light" : "dark")),
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
}
