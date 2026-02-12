'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import {
  Github,
  User,
  Mail,
  Lock,
  Loader2,
  Code2,
  Chrome,
  Eye,
  EyeOff,
} from 'lucide-react'

const Signup = () => {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }

  return (
    <div className="w-full max-w-lg">
      <Card
        className="
          min-h-[660px]
          p-10 md:p-12
          flex flex-col justify-center
          rounded-3xl
          border
          shadow-2xl
          bg-card
        "
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-md">
            <Code2 className="h-8 w-8" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-2 mb-10">
          <h1 className="text-3xl font-bold tracking-tight">
            Create your account
          </h1>
          <p className="text-sm text-muted-foreground">
            Build faster with your Online IDE
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Username */}
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase text-muted-foreground">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                required
                placeholder="Choose a username"
                className="pl-10 h-11"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase text-muted-foreground">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                required
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
                required
                type={showPassword ? 'text' : 'password'}
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

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Creating account…' : 'Sign up'}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-8">
          <Separator />
        </div>

        {/* OAuth */}
        <div className="space-y-6">
          <p className="text-center text-xs uppercase text-muted-foreground">
            Or sign up with
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="secondary" className="h-11 gap-2">
              <Chrome className="h-4 w-4 text-blue-500" />
              Google
            </Button>

            <Button variant="secondary" className="h-11 gap-2">
              <Github className="h-4 w-4" />
              GitHub
            </Button>
          </div>
        </div>

        {/* Footer */}
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
