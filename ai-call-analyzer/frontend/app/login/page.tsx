"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PhoneCall, Loader2, UserRound } from "lucide-react"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const { login, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(username, password)
  }

  const handleDemoLogin = async () => {
    setUsername("demo")
    setPassword("password")
    
    // Small delay to show the values being filled in
    setTimeout(() => {
      login("demo", "password")
    }, 300)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0D0D0D] p-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <PhoneCall className="h-6 w-6 text-gold" />
        <h1 className="text-2xl font-serif font-bold gold-gradient">AI Call Analyzer</h1>
      </Link>

      <Card className="w-full max-w-md border-gold/30 bg-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-serif text-center gold-gradient">Sign In</CardTitle>
          <CardDescription className="text-center text-white/60">
            Enter your credentials to access your account
          </CardDescription>
          
          <Button 
            variant="outline" 
            onClick={handleDemoLogin} 
            className="mt-4 w-full border-gold/30 bg-gold/10 hover:bg-gold/20 text-gold"
            disabled={isLoading}
          >
            <UserRound className="mr-2 h-4 w-4" />
            Login with Demo Account
          </Button>
          
          <div className="mt-4 text-center">
            <span className="px-2 bg-card relative z-10 text-xs text-muted-foreground">or sign in with your credentials</span>
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gold/20"></span>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="border-gold/30 bg-black/50 focus:border-gold focus:ring-gold"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-sm text-gold hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-gold/30 bg-black/50 focus:border-gold focus:ring-gold"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-gold hover:bg-gold/90 text-black font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
