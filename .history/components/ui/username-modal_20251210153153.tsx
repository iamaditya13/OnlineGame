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
}

export function UsernameModal({ open, onSubmit }: UsernameModalProps) {
  const [username, setUsername] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      onSubmit(username.trim())
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md bg-card border-border" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="text-foreground">Welcome to TimeKill</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose a username to get started. You can change it later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="username" className="text-foreground">
              Username
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="bg-input border-border text-foreground"
              autoFocus
              maxLength={20}
            />
          </div>
          <Button
            type="submit"
            disabled={!username.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Continue
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
