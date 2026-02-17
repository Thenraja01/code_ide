import { createContext, useContext, useState,ReactNode, type Dispatch, type SetStateAction } from "react";
type User = {
  id: string;
  name: string;
  email: string;
} | null;

type AuthContextType = {
  user: User;
  login: (userData:User) => void;
  logout: () => void;
  setUser:Dispatch<SetStateAction<User>>
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode}) {
  const [user, setUser] = useState<User|null>(null);


  const login = (userData: User) => {
    setUser(userData);
  };


  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ setUser,user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
