"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { User, LoginCredentials } from "@/interfaces";
import {
  authenticate,
  getStoredUser,
  storeUser,
  clearUser,
} from "@/services/auth.service";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = (credentials: LoginCredentials): string | null => {
    const authenticatedUser = authenticate(credentials);
    if (authenticatedUser) {
      setUser(authenticatedUser);
      storeUser(authenticatedUser);
      router.push("/projects");
      return null;
    }
    return "Invalid username or password";
  };

  const logout = () => {
    setUser(null);
    clearUser();
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
