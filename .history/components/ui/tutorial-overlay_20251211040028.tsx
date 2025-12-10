"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface TutorialOverlayProps {
  open: boolean
  onClose: () => void
}

export function TutorialOverlay({ open, onClose }: TutorialOverlayProps) {
  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">Welcome to OnlineGame!</DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground">
            Here's how to get started:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4 text-foreground">
          <div className="flex items-start gap-3">
            <div className="bg-primary/20 p-2 rounded-full text-primary font-bold">1</div>
            <div>
              <h3 className="font-semibold">Choose a Game</h3>
              <p className="text-sm text-muted-foreground">Browse our catalog of classic games like Tic-Tac-Toe, Connect 4, and more.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-primary/20 p-2 rounded-full text-primary font-bold">2</div>
            <div>
              <h3 className="font-semibold">Create or Join a Room</h3>
              <p className="text-sm text-muted-foreground">Start a new room and share the code, or join a friend's room.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-primary/20 p-2 rounded-full text-primary font-bold">3</div>
            <div>
              <h3 className="font-semibold">Track Your Stats</h3>
              <p className="text-sm text-muted-foreground">Your wins and losses are saved automatically. Check your history anytime!</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Got it, let's play!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
