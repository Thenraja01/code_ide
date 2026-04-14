import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { Code2, Mail, Lock, Eye, EyeOff, Loader2, Github } from 'lucide-react'
import { useTheme } from '@/components/Provider/themeprovider'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import GoogleOauth from './Googleoauth'
import { useRegisterMutation } from '@/hooks/useAuth.hooks'
import type { RegisterInput } from '@/api/auth.api'

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false)
  const { theme } = useTheme()
  const { mutate: registerUser, isPending } = useRegisterMutation()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData.entries()) as unknown as RegisterInput
    
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    registerUser(data)
  }

  return (
    <div className="w-full max-w-lg ">
      <Toaster position='top-center' theme={theme} />
      <Card
        className="
          p-10 md:p-12
          flex flex-col justify-center
          rounded-3xl
          border
          shadow-2xl
          bg-card
        "
      >
        {/* Logo */}
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-md">
            <Code2 className="h-8 w-8" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-2 ">
          <h1 className="text-3xl font-bold tracking-tight">
            Create your account
          </h1>
          <p className="text-sm text-muted-foreground">
            Build faster with your Online IDE
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
        
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase text-muted-foreground">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="email"
                required
                autoComplete="email"
                type="email"
                placeholder="you@example.com"
                className="pl-10 h-11"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase text-muted-foreground">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="password"
                required
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Create a strong password"
                className="pl-10 pr-10 h-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase text-muted-foreground">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="confirmPassword"
                required
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Confirm your password"
                className="pl-10 pr-10 h-11"
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-11"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Creating account…' : 'Sign up'}
          </Button>
        </form>
        <div className="my-8">
          <Separator />
        </div>
        <div className="space-y-6">
          <p className="text-center text-xs uppercase text-muted-foreground">
            Or sign up with
          </p>

          <div className="grid grid-cols-2 gap-4">
            <GoogleOauth text="Google" />

            <Button variant="secondary" className="h-11 gap-2">
              <Github className="h-4 w-4" />
              GitHub
            </Button>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary hover:underline"
          >
            Login
          </Link>
        </p>
      </Card>
    </div>
  )
}

export default Signup

