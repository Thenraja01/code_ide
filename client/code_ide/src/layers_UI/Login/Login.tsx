'use client'

import { useState } from 'react'
import type { FormEvent, JSX } from 'react'

import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Github,
  User,
  Lock,
  Loader2,
  Code2,
  Chrome
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { validatePassword, validateUsername } from './Validator'
import { useAuth } from '../Navbar/AuthContext'
const Login = (): JSX.Element => {
  const [loading, setLoading] = useState<boolean>(false)
   const [error, setError] = useState<boolean>(true)
  const {user,login,logout,setUser}=useAuth()
  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    try{

      event.preventDefault()
      setLoading(true)
      
    }
    catch(err){
      logout()
      console.log(err)
    }
    // simulate API call
    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }

  return (
    <div className="w-full max-w-lg">
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
          {/* Username */}
          <div className="space-y-1 text-start">
            <label className="text-xs font-medium uppercase  text-muted-foreground">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="username"
                required
                placeholder="Enter your username"
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
            {loading ? 'login to…' : 'Login'}
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
            <Button variant="secondary" type="button" className="gap-2">
              <Chrome className="h-4 w-4 text-orange-500" />
              Google
            </Button>

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
