"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

interface RouteGuardProps {
  children: React.ReactNode
}

export function RouteGuard({ children }: RouteGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    // This is a simplified auth check
    // In a real app, you would check for a valid token or session
    const authCheck = () => {
      // Public paths that don't require authentication
      const publicPaths = ["/login", "/register"]
      const path = pathname

      // If the path is not public and the user is not logged in, redirect to login
      // For demo purposes, we'll just check if the path is not public
      if (!publicPaths.includes(path)) {
        // For demo purposes, we'll just set authorized to true
        // In a real app, you would check for a valid token or session
        setAuthorized(true)

        // Uncomment this to redirect to login
        // router.push("/login")
      } else {
        setAuthorized(true)
      }
    }

    authCheck()
  }, [pathname, router])

  // Show loading indicator while checking auth
  if (!authorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  return <>{children}</>
}
