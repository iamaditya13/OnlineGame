"use client"

import { useState, useEffect } from "react"

export interface LocalUser {
  id: string
  username: string
  createdAt: number
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function useLocalUser() {
  const [user, setUser] = useState<LocalUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("timekill_user")
    if (stored) {
      setUser(JSON.parse(stored))
    }
    setIsLoading(false)
  }, [])

  const createUser = (username: string) => {
    const newUser: LocalUser = {
      id: generateId(),
      username,
      createdAt: Date.now(),
    }
    localStorage.setItem("timekill_user", JSON.stringify(newUser))
    setUser(newUser)
    return newUser
  }

  const updateUsername = (username: string) => {
    if (user) {
      const updated = { ...user, username }
      localStorage.setItem("timekill_user", JSON.stringify(updated))
      setUser(updated)
    }
  }

  return { user, isLoading, createUser, updateUsername }
}
