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
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      onSubmit(email.trim())
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md bg-card border-border" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">Welcome to OnlineGame!</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter your email to sign in or create an account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="bg-input border-border text-foreground"
              autoFocus
              disabled={isLoading}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <Button
            type="submit"
            disabled={!email.trim() || isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? "Signing in..." : "Continue"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
