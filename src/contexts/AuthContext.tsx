import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "@/lib/api";
import {
  clearStoredSession,
  getStoredSession,
  setStoredSession,
} from "@/lib/api/auth-storage";
import type {
  ApiUser,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from "@/lib/api/types";

interface AuthContextValue {
  user: ApiUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  register: (payload: RegisterPayload) => Promise<AuthResponse>;
  logout: () => void;
  refreshProfile: () => Promise<ApiUser | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const storedSession = getStoredSession();
  const [user, setUser] = useState<ApiUser | null>(storedSession?.user ?? null);
  const [token, setToken] = useState<string | null>(
    storedSession?.accessToken ?? null,
  );
  const [isLoading, setIsLoading] = useState(Boolean(storedSession?.accessToken));

  useEffect(() => {
    if (!storedSession?.accessToken) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    authApi
      .me()
      .then((currentUser) => {
        if (cancelled) {
          return;
        }

        setUser(currentUser);
        setStoredSession({
          accessToken: storedSession.accessToken,
          user: currentUser,
        });
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        clearStoredSession();
        setUser(null);
        setToken(null);
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [storedSession?.accessToken]);

  const persistSession = (session: AuthResponse) => {
    setUser(session.user);
    setToken(session.accessToken);
    setStoredSession(session);
    return session;
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login: async (payload) => persistSession(await authApi.login(payload)),
      register: async (payload) => persistSession(await authApi.register(payload)),
      logout: () => {
        clearStoredSession();
        setUser(null);
        setToken(null);
      },
      refreshProfile: async () => {
        if (!token) {
          return null;
        }

        const currentUser = await authApi.me();
        setUser(currentUser);
        setStoredSession({ accessToken: token, user: currentUser });
        return currentUser;
      },
    }),
    [isLoading, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}