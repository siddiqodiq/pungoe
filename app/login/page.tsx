"use client"

import { useState } from "react"
import Link from "next/link"
import { Shield, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useIsMobile } from "@/hooks/use-mobile"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const isMobile = useIsMobile()

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black p-4">
      <div className="absolute inset-0 grid-pattern opacity-20"></div>
      <div className="relative w-full max-w-md mx-auto"> {/* Container tambahan */}
        <Card className="w-full border-gray-800 bg-black/80 backdrop-blur-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full gradient-bg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold gradient-text">Welcome back</CardTitle>
            <CardDescription className="text-gray-400">Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-300">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="bg-gray-900/70 border-gray-800 focus:border-blue-600 hover-input"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-gray-300">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs text-blue-500 hover:text-blue-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="bg-gray-900/70 border-gray-800 focus:border-blue-600 pr-10 hover-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
              </button>
            </div>
          </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
          <Button className="w-full gradient-btn button-hover">Sign In</Button>
          <div className="text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link href="/register" className="text-blue-500 hover:text-blue-400 hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
    </div>
  )
}