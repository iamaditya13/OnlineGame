"use client"

import { useState, useEffect } from "react"

export interface LocalUser {
  _id: string
  username: string
  wins: number
  losses: number
  hasSeenTutorial: boolean
  createdAt: string
}

export function useLocalUser() {
  const [user, setUser] = useState<LocalUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("timekill_user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error("Failed to parse user", e)
        localStorage.removeItem("timekill_user")
      }
    }
    setIsLoading(false)
  }, [])

  const createUser = (username: string) => {
    const newUser: LocalUser = {
      _id: `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      username,
      wins: 0,
      losses: 0,
      hasSeenTutorial: false,
      createdAt: new Date().toISOString(),
    }
    
    localStorage.setItem("timekill_user", JSON.stringify(newUser))
    setUser(newUser)
    return newUser
  }

  const updateTutorialStatus = (hasSeen: boolean) => {
    if (!user) return
    
    const updatedUser = { ...user, hasSeenTutorial: hasSeen }
    localStorage.setItem("timekill_user", JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  const recordMatch = (gameId: string, result: "win" | "loss" | "draw") => {
    if (!user) return

    const updatedUser = { ...user }
    if (result === "win") updatedUser.wins += 1
    if (result === "loss") updatedUser.losses += 1
    
    localStorage.setItem("timekill_user", JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("timekill_user")
  }

  return {
    user,
    isLoading,
    isSigningIn: false, // Kept for compatibility
    error: null, // Kept for compatibility
    createUser,
    updateTutorialStatus,
    recordMatch,
    refreshUser: () => {}, // No-op for local user
    logout
  }
}
