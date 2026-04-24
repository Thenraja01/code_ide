import { Github, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useGithubAuthMutation } from '@/hooks/useAuth.hooks';

interface GithubOauthProps {
  text: string;
}

export default function GithubOauth({ text }: GithubOauthProps) {
  const { mutate: githubLogin, isPending: isLoading } = useGithubAuthMutation();

  const signIn = async () => {
    if (isLoading) return;
    githubLogin();
  };

  return (
    <Button
      variant="secondary"
      type="button"
      className="w-full gap-2 border-white/5 bg-white/[0.03] hover:bg-white/[0.08] text-white"
      onClick={signIn}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Github className="h-4 w-4" />
      )}
      {isLoading ? "Signing in..." : text}
    </Button>
  );
}
