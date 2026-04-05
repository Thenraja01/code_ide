import { useState } from 'react';
import { auth, googleProvider } from '@/layers_UI/Login/firebase'
import { signInWithPopup } from "firebase/auth";
import { toast } from 'sonner';
import { Button } from '@/components/ui/button'
import { Chrome, Loader2 } from 'lucide-react'
import { useAuth } from '../utils/Context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface GoogleOauthProps {
  text: string;
}

export default function GoogleOauth({ text }: GoogleOauthProps) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Save to context
      login({
        id: user.uid,
        name: user.displayName || 'Google User',
        email: user.email || '',
        password: ''
      });

      toast.success("Welcome " + (user.displayName || user.email));
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Firebase Auth Error:", err);

      if (err.code === 'auth/popup-blocked') {
        toast.error("Sign-in popup was blocked by your browser. Please allow popups for this site.");
      } else if (err.code === 'auth/cancelled-popup-request') {
        // This is usually handled by the loading state, but let's be safe
        console.warn("Multiple popup requests detected.");
      } else if (err.code === 'auth/popup-closed-by-user') {
        toast.error("Sign-in popup was closed before completion.");
      } else {
        toast.error(err.message || "Google Sign-In failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      type="button"
      className="w-full gap-2"
      onClick={signIn}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Chrome className="h-4 w-4 text-orange-500" />
      )}
      {isLoading ? "Signing in..." : text}
    </Button>
  );
}
