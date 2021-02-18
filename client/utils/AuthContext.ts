import { createContext } from "react";

export interface AuthInfo {
  access_token: string
}

interface AuthContextType {
  auth: AuthInfo | null;
  setAuth: (auth: AuthInfo) => void;
}

export const AuthContext = createContext<AuthContextType>({
  auth: null,
  setAuth: () => { }
});