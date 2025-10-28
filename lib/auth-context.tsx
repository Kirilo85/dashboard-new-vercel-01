"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User } from "./types"

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => boolean
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const MOCK_USERS: User[] = [
  {
    id: "1",
    username: "admin",
    password: "admin123",
    name: "System Administrator",
    position: "Super Admin",
    assignedClients: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    username: "john.lead",
    password: "lead123",
    name: "John Smith",
    position: "Team Lead",
    assignedClients: ["client-1"],
    createdAt: new Date().toISOString(),
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = (username: string, password: string) => {
    const foundUser = MOCK_USERS.find((u) => u.username === username && u.password === password)
    if (foundUser) {
      setUser(foundUser)
      localStorage.setItem("user", JSON.stringify(foundUser))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
