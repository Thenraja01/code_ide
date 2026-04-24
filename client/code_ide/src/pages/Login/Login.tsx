import { type FormEvent, type JSX } from 'react'
import GoogleOauth from './Googleoauth'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Toaster } from '@/components/ui/sonner'
import {
  User,
  Lock,
  Loader2,
  Code2
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTheme } from '@/components/Provider/themeprovider'

import { useLoginMutation } from '@/hooks/useAuth.hooks'
import type { LoginInput } from '@/api/auth.api'
import GithubOauth from './Githuboauth'

const Login = (): JSX.Element => {
  const { theme } = useTheme()
  const { mutate: loginUser, isPending } = useLoginMutation()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData.entries()) as unknown as LoginInput
    loginUser(data)
  }


  return (
    <div className="w-full max-w-lg">
      <Toaster position='top-center' theme={theme} className='text-chart-5' />
      <Card className="  min-h-600px
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
        <div className="mb-4 text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground underline">
            Sign in to your Online IDE
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
   
          <div className="space-y-1 text-start">
            <label 
              htmlFor="email"
              className="text-xs font-medium uppercase text-muted-foreground cursor-pointer"
            >
              Email
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Enter your email"
                className="pl-10 focus-visible:ring-ring"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1 text-start">
            <label 
              htmlFor="password"
              className="text-xs font-medium uppercase text-muted-foreground cursor-pointer"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                className="pl-10 focus-visible:ring-ring"
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? 'Logging in...' : 'Login'}
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

              <GithubOauth text='Github' />
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Login

