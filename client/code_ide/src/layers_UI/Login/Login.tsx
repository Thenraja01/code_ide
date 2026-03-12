import { useState } from 'react'
import type { FormEvent, JSX } from 'react'
import GoogleOauth from './Googleoauth'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import {
  Github,
  User,
  Lock,
  Loader2,
  Code2
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/Context/AuthContext'
import { useTheme } from '@/components/Provider/themeprovider'
import { auth } from './firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'

const Login = (): JSX.Element => {
  const [loading, setLoading] = useState<boolean>(false)
  const { login, logout } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)

    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') || '') // changed from username to email for firebase
    const password = String(form.get('password') || '')

    // For simplicity I'll skip username specific validation here and just use email
    if (!email || !password) {
      toast.warning("Please enter both email and password")
      setLoading(false)
      return
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      login({
        id: user.uid,
        name: user.displayName || email.split('@')[0],
        password: password,
        email: email
      })

      toast.success('Logged in successfully')
      navigate('/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Login failed')
      logout()
      console.log(err)
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="w-full max-w-lg">
      <Toaster position='top-center' theme={theme} className='text-chart-5' />
      <Card className="  min-h-660px
          p-10 md:p-12
          flex flex-col justify-center
          rounded-3xl
          border
          shadow-2xl
          bg-card">

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-md">
            <Code2 className="h-7 w-7" />
          </div>
        </div>

        {/* Header */}
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your Online IDE
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-1 text-start">
            <label className="text-xs font-medium uppercase  text-muted-foreground">
              Email
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="email"
                type="email"
                required
                placeholder="Enter your email"
                className="pl-10 focus-visible:ring-ring"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1 text-start">
            <label className="text-xs font-medium uppercase text-muted-foreground">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="password"
                type="password"
                required
                placeholder="Enter your password"
                className="pl-10 focus-visible:ring-ring"
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Logging in...' : 'Login'}
          </Button>

        </form>

        {/* Divider */}
        <div className="my-2">
          <Separator />
        </div>

        {/* Signup*/}
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Don't Have an account?{' '}
          <Link
            to="/signup"
            className="font-medium text-primary hover:underline"
          >
            Signup
          </Link>
        </p>
        {/* OAuth */}
        <div className="space-y-4">
          <p className="text-center text-xs uppercase text-muted-foreground">
            Continue with
          </p>

          <div className="grid grid-cols-2 gap-3">
            <GoogleOauth text="Google" />

            <Button variant="secondary" type="button" className="gap-2">
              <Github className="h-4 w-4" />
              GitHub
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Login

