"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Trophy, XCircle, History, LogOut } from "lucide-react"
import { format } from "date-fns"
import type { LocalUser } from "@/hooks/use-local-user"

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: LocalUser | null
  onLogout: () => void
}

export function ProfileDialog({ open, onOpenChange, user }: Omit<ProfileDialogProps, "onLogout">) {
  if (!user) return null

  const totalGames = user.wins + user.losses
  const winRate = totalGames > 0 ? Math.round((user.wins / totalGames) * 100) : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">Player Profile</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {user.username}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 py-4">
          <div className="flex flex-col items-center p-4 bg-secondary rounded-lg">
            <Trophy className="h-8 w-8 text-yellow-500 mb-2" />
            <span className="text-2xl font-bold text-foreground">{user.wins}</span>
            <span className="text-xs text-muted-foreground uppercase">Wins</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-secondary rounded-lg">
            <XCircle className="h-8 w-8 text-red-500 mb-2" />
            <span className="text-2xl font-bold text-foreground">{user.losses}</span>
            <span className="text-xs text-muted-foreground uppercase">Losses</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-secondary rounded-lg">
            <History className="h-8 w-8 text-blue-500 mb-2" />
            <span className="text-2xl font-bold text-foreground">{winRate}%</span>
            <span className="text-xs text-muted-foreground uppercase">Win Rate</span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Match History</h3>
          <ScrollArea className="h-[200px] w-full rounded-md border border-border p-4">
              <p className="text-center text-muted-foreground py-8">Match history is not available in guest mode.</p>
          </ScrollArea>
        </div>
    </DialogContent>
    </Dialog>
  )
}
