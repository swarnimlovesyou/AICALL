"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BarChart3, PhoneCall, Users, FileText, Award, BookOpen, LogOut, Menu, X, Bell } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  if (!isMounted) {
    return null // Prevent hydration errors
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Call Recordings", href: "/call-recordings", icon: PhoneCall },
    { name: "Agents", href: "/agents", icon: Users },
    { name: "Reports", href: "/reports", icon: FileText },
    { name: "Leaderboard", href: "/leaderboard", icon: Award },
    { name: "Training", href: "/training", icon: BookOpen },
  ]

  const userInitials = user ? `${user.user.first_name.charAt(0)}${user.user.last_name.charAt(0)}` : "U"

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-gold/30 bg-black">
        <div className="h-16 flex items-center px-6 border-b border-gold/30">
          <Link href="/dashboard" className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5 text-gold" />
            <span className="font-serif font-bold text-lg gold-gradient">AI Call Analyzer</span>
          </Link>
        </div>
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive ? "bg-gold/20 text-gold" : "text-white/70 hover:bg-gold/10 hover:text-gold"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gold" />}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gold/30">
          <Button
            variant="ghost"
            className="w-full justify-start text-white/70 hover:bg-gold/10 hover:text-gold"
            onClick={logout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/80 z-40" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 w-64 bg-black border-r border-gold/30 z-50 transform transition-transform duration-200 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gold/30">
          <Link href="/dashboard" className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5 text-gold" />
            <span className="font-serif font-bold text-lg gold-gradient">AI Call Analyzer</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-white/70 hover:text-gold"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive ? "bg-gold/20 text-gold" : "text-white/70 hover:bg-gold/10 hover:text-gold"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gold" />}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gold/30">
          <Button
            variant="ghost"
            className="w-full justify-start text-white/70 hover:bg-gold/10 hover:text-gold"
            onClick={logout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-gold/30 bg-black flex items-center justify-between px-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white/70 hover:text-gold mr-2"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-serif font-bold gold-gradient hidden sm:block">
              {navigation.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.name ||
                "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-gold relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-gold rounded-full"></span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9 border border-gold/30">
                    <AvatarImage src="/placeholder.svg" alt={user?.user.first_name} />
                    <AvatarFallback className="bg-gold/10 text-gold">{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}

