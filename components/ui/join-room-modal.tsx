"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

interface JoinRoomModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JoinRoomModal({ open, onOpenChange }: JoinRoomModalProps) {
  const [code, setCode] = useState("")
  const router = useRouter()
  const [error, setError] = useState("")

  const handleJoin = () => {
    if (code.length < 6) {
      setError("Room code must be at least 6 characters")
      return
    }
    // In a real app we might check if room exists here, 
    // but for now we just navigate.
    router.push(`/room/${code}`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Join Room</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="room-code" className="text-foreground">
              Room Code
            </Label>
            <Input
              id="room-code"
              placeholder="ENTER CODE"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase())
                setError("")
              }}
              className="bg-input border-border text-foreground uppercase tracking-widest text-center text-lg h-12"
              maxLength={6}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="text-sm text-muted-foreground text-center">
            Enter the 6-character code shared by the host to join their game.
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border text-foreground">
            Cancel
          </Button>
          <Button onClick={handleJoin} className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={!code}>
            Join Room
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
