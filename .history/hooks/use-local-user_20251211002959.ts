"use client"

import { useState, useEffect } from "react"

export interface LocalUser {
  _id: string
  email: string
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
    const storedEmail = localStorage.getItem("timekill_email")
    if (storedEmail) {
      fetchUser(storedEmail)
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchUser = async (email: string) => {
    try {
      const res = await fetch(`/api/user?email=${encodeURIComponent(email)}`)
      if (res.ok) {
        const userData = await res.json()
        setUser(userData)
      } else {
        localStorage.removeItem("timekill_email")
      }
    } catch (error) {
      console.error("Failed to fetch user", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createUser = async (email: string) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      
      if (res.ok) {
        const newUser = await res.json()
        localStorage.setItem("timekill_email", newUser.email)
        setUser(newUser)
        return newUser
      }
    } catch (error) {
      console.error("Failed to sign in", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateTutorialStatus = async (hasSeen: boolean) => {
    if (!user) return
    
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, hasSeenTutorial: hasSeen }),
      })
      
      if (res.ok) {
        const updatedUser = await res.json()
        setUser(updatedUser)
      }
    } catch (error) {
      console.error("Failed to update tutorial status", error)
    }
  }

  return { user, isLoading, createUser, updateTutorialStatus }
}
