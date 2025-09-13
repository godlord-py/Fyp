import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User, AuthContextType } from "../types"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored user on app load
    const storedUser = localStorage.getItem("examind_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)

    // Mock authentication - in real app, this would be an API call
    const mockUsers: User[] = [
      {
        id: "1",
        email: "student@example.com",
        name: "John Student",
        role: "student",
        class: "12th",
        subjects: ["Physics", "Chemistry", "Mathematics"],
        createdAt: "2024-01-01",
      },
      {
        id: "2",
        email: "admin@example.com",
        name: "Jane Admin",
        role: "admin",
        createdAt: "2024-01-01",
      },
    ]

    const foundUser = mockUsers.find((u) => u.email === email)

    if (foundUser && password === "password123") {
      setUser(foundUser)
      localStorage.setItem("examind_user", JSON.stringify(foundUser))
    } else {
      throw new Error("Invalid credentials")
    }

    setLoading(false)
  }

  const signup = async (email: string, password: string, name: string, role: "student" | "admin") => {
    setLoading(true)

    // Mock signup
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role,
      createdAt: new Date().toISOString(),
    }

    setUser(newUser)
    localStorage.setItem("examind_user", JSON.stringify(newUser))
    setLoading(false)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("examind_user")
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, loading }}>{children}</AuthContext.Provider>
}
