import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { getAuthData, setAuthData, clearAuthData } from "../utils/storage";
import type { AuthContextType, User } from "../types/types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuthData();
    if (auth.token) {
      setIsAuthenticated(true);
      setUser(auth.user);
    }
    setLoading(false);
  }, []);

  const login = (token: string, user: User) => {
    setAuthData(token, user);
    setIsAuthenticated(true);
    setUser(user);
  };

  const logout = () => {
    clearAuthData();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
