import { createContext, useContext, useState, useEffect, type Dispatch, type SetStateAction, type ReactNode } from "react";
import { auth } from "@/services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export type User = {
  id: string; // We'll map this to the Convex _id
  name: string;
  email: string;
  avatar?: string;
  firebaseUid: string;
} | null;

type AuthContextType = {
  user: User;
  setUser: Dispatch<SetStateAction<User>>;
  logout: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  const syncUser = useMutation(api.users.syncUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const convexUserId = await syncUser({
            email: firebaseUser.email || "",
            firebaseUid: firebaseUser.uid,
            name: firebaseUser.displayName || "",
            avatar: firebaseUser.photoURL || "",
          });

          const token = await firebaseUser.getIdToken();
          localStorage.setItem('token', token);

          setUser({
            id: convexUserId || '',
            name: firebaseUser.displayName || "",
            email: firebaseUser.email || "",
            avatar: firebaseUser.photoURL || "",
            firebaseUid: firebaseUser.uid,
          });
        } else {
          setUser(null);
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error("Auth sync error:", error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [syncUser]);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('token');
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, isLoading }}>
      {!isLoading && children}
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

