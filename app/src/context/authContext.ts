import { createContext } from "react";

export interface AuthContextType {
  isAuthenticated: boolean;
  user: string | null;
  login: (email: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
