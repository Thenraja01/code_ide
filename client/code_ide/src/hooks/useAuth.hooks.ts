import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { auth, googleProvider, githubProvider } from '@/services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup 
} from 'firebase/auth';

export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: any) => {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const token = await userCredential.user.getIdToken();
      return { token, user: userCredential.user };
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      toast.success('Login Successful!');
      navigate('/dashboard');
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Login failed');
    }
  });
};

export const useRegisterMutation = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: any) => {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const token = await userCredential.user.getIdToken();
      return { token, user: userCredential.user };
    },
    onSuccess: () => {
      toast.success('Registration Successful! Please login.');
      navigate('/login');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Registration failed');
    }
  });
};

export const useGoogleAuthMutation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const token = await userCredential.user.getIdToken();
      return { token, user: userCredential.user };
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      toast.success('Google Login Successful!');
      navigate('/dashboard');
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Google authentication failed');
    }
  });
};

export const useGithubAuthMutation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      const userCredential = await signInWithPopup(auth, githubProvider);
      const token = await userCredential.user.getIdToken();
      return { token, user: userCredential.user };
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      toast.success('Github Login Successful!');
      navigate('/dashboard');
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Github authentication failed');
    }
  });
};

export interface AuthUser {
  id: string;
  name: string | null;
  email: string | null;
  provider: string;
  isEmailVerified: boolean;
}

export const useMeQuery = () => {
  return useQuery<AuthUser>({
    queryKey: ['user'],
    queryFn: async () => {
      return new Promise((resolve, reject) => {
        auth.onAuthStateChanged((user) => {
          if (user) {
            resolve({
              id: user.uid,
              name: user.displayName,
              email: user.email,
              provider: user.providerData?.[0]?.providerId || 'password',
              isEmailVerified: user.emailVerified
            });
          } else {
            reject(new Error("Not logged in"));
          }
        });
      });
    },
    enabled: !!localStorage.getItem('token'),
    staleTime: 1000 * 60 * 10,
    retry: 1
  });
};

export const useUsersQuery = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => [] 
  });
};
