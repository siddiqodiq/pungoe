"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Shield, Eye, EyeOff, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")

  useEffect(() => {
    if (password && confirmPassword && password !== confirmPassword) {
      setPasswordError("Passwords do not match")
    } else {
      setPasswordError("")
    }
  }, [password, confirmPassword])

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black p-4">
      <div className="absolute inset-0 grid-pattern opacity-20"></div>
      <div className="relative w-full max-w-md mx-auto">
        <Card className="w-full border-gray-800 bg-black/80 backdrop-blur-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full gradient-bg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold gradient-text">Create an account</CardTitle>
            <CardDescription className="text-gray-400">Enter your information to create your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="first-name" className="text-sm font-medium text-gray-300">
                  First name
                </label>
                <Input
                  id="first-name"
                  placeholder="John"
                  className="bg-gray-900/70 border-gray-800 focus:border-blue-600 hover-input"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="last-name" className="text-sm font-medium text-gray-300">
                  Last name
                </label>
                <Input
                  id="last-name"
                  placeholder="Doe"
                  className="bg-gray-900/70 border-gray-800 focus:border-blue-600 hover-input"
                />
              </div>
            </div>
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
              <label htmlFor="password" className="text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="bg-gray-900/70 border-gray-800 focus:border-blue-600 pr-10 hover-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium text-gray-300">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`bg-gray-900/70 border-gray-800 focus:border-blue-600 pr-10 hover-input ${
                    passwordError ? "border-red-500" : ""
                  }`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
                </button>
              </div>
              {passwordError && (
                <div className="flex items-center text-red-500 text-xs mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span>{passwordError}</span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              className="w-full gradient-btn button-hover"
              disabled={!!passwordError}
            >
              Sign Up
            </Button>
            <div className="text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-500 hover:text-blue-400 hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}