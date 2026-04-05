import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { loginUser, registerUser, googleAuth, getMe } from '@/api/auth.api'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'


export const useLoginMutation = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      localStorage.setItem('token', data.token)
      // login(data.user) // If user data is returned, update context
      toast.success('Login Successful!')
      navigate('/dashboard')
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed')
    }
  })
}

export const useRegisterMutation = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success('Registration Successful! Please login.')
      navigate('/login')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed')
    }
  })
}

export const useGoogleAuthMutation = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: googleAuth,
    onSuccess: (data) => {
      localStorage.setItem('token', data.token)
      toast.success('Google Login Successful!')
      navigate('/dashboard')
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
    onError: (error: any) => {
       toast.error(error.response?.data?.message || 'Google authentication failed')
    }
  })
}

export const useMeQuery = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: getMe,
    enabled: !!localStorage.getItem('token'),
    staleTime: 1000 * 60 * 10,
  });
};
