import { Chrome, Loader2 } from 'lucide-react'
import { useGoogleAuthMutation } from '@/hooks/useAuth.hooks';
import { Button } from '@/components/ui/button';

interface GoogleOauthProps {
  text: string;
}

export default function GoogleOauth({ text }: GoogleOauthProps) {
  const { mutate: googleLogin, isPending: isLoading } = useGoogleAuthMutation();

  const signIn = async () => {
    if (isLoading) return;
    googleLogin();
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
