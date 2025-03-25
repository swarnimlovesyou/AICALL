"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { getApi, mockApi } from "@/lib/api"

type User = {
  id: number
  username: string
  first_name: string
  last_name: string
}

type AuthContextType = {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const api = getApi()

  useEffect(() => {
    // Check if we have a token in localStorage
    const storedToken = localStorage.getItem("auth_token")
    const storedUser = localStorage.getItem("auth_user")

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Redirect logic
    if (!isLoading) {
      const publicPaths = ["/login", "/"]
      const isPublicPath = publicPaths.includes(pathname)

      if (!token && !isPublicPath) {
        router.push("/login")
      } else if (token && pathname === "/login") {
        router.push("/dashboard")
      }
    }
  }, [token, pathname, isLoading, router])

  const login = async (username: string, password: string) => {
    setIsLoading(true)

    try {
      // For development: Check if we should use mock authentication
      const useMockAuth = process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_API_URL

      let userData
      let authToken

      if (useMockAuth) {
        // Use mock authentication
        console.log("Using mock authentication")
        const result = await mockApi.login(username, password)
        authToken = result.token
        userData = result
      } else {
        // Use real API
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

        const response = await fetch(`${apiUrl}/api-token-auth/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ username, password }),
          credentials: "include",
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error("Login response error:", response.status, errorData)
          throw new Error(errorData.detail || `Login failed with status: ${response.status}`)
        }

        const data = await response.json()
        authToken = data.token

        // Fetch user details
        const userResponse = await fetch(`${apiUrl}/api/agents/me/`, {
          headers: {
            Authorization: `Bearer ${data.token}`,
            Accept: "application/json",
          },
          credentials: "include",
        })

        if (!userResponse.ok) {
          console.error("User details response error:", userResponse.status)
          throw new Error(`Failed to fetch user details: ${userResponse.status}`)
        }

        userData = await userResponse.json()
      }

      // Save to state and localStorage
      setToken(authToken)
      setUser(userData)
      localStorage.setItem("auth_token", authToken)
      localStorage.setItem("auth_user", JSON.stringify(userData))

      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.user?.first_name || userData.first_name || username}!`,
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Login error details:", error)
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
    router.push("/login")
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
  }

  return <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

