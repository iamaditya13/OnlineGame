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

export function ProfileDialog({ open, onOpenChange, user, onLogout }: ProfileDialogProps) {
  if (!user) return null

  const totalGames = user.wins + user.losses
  const winRate = totalGames > 0 ? Math.round((user.wins / totalGames) * 100) : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">Player Profile</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {user.username} ({user.email})
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
            {user.matchHistory && user.matchHistory.length > 0 ? (
              <div className="space-y-4">
                {[...user.matchHistory].reverse().map((match, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                    <div>
                      <p className="font-medium text-foreground capitalize">{match.gameId.replace("-", " ")}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(match.date), "PP p")}</p>
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        match.result === "win"
                          ? "bg-green-500/20 text-green-500"
                          : match.result === "loss"
                            ? "bg-red-500/20 text-red-500"
                            : "bg-yellow-500/20 text-yellow-500"
                      }`}
                    >
                      {match.result}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No matches played yet.</p>
            )}
          </ScrollArea>
        </div>
      <DialogFooter className="sm:justify-start border-t border-border pt-4 mt-4">
        <Button 
          variant="destructive" 
          onClick={() => {
            onLogout()
            onOpenChange(false)
          }}
          className="w-full sm:w-auto"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </DialogFooter>
    </DialogContent>
    </Dialog>
  )
}
