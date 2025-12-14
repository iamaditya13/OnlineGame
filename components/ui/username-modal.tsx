"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface UsernameModalProps {
  open: boolean
  onSubmit: (username: string) => void
  isLoading?: boolean
  error?: string | null
}

export function UsernameModal({ open, onSubmit, isLoading = false, error }: UsernameModalProps) {
  const [username, setUsername] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      onSubmit(username.trim())
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md bg-card border-border" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">Welcome to OnlineGame!</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter a username to start playing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="username" className="text-foreground">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="bg-input border-border text-foreground"
              autoFocus
              disabled={isLoading}
              maxLength={15}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <Button
            type="submit"
            disabled={!username.trim() || isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? "Joining..." : "Start Playing"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
