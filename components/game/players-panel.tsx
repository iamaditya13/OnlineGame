"use client"

import { Crown, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Player {
  id: string
  username: string
  symbol?: string
  isHost?: boolean
}

interface PlayersPanelProps {
  players: Player[]
  currentPlayerId: string
  currentTurn: string
}

export function PlayersPanel({ players, currentPlayerId, currentTurn }: PlayersPanelProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <h3 className="font-semibold text-foreground text-sm mb-4">Players</h3>
      <div className="space-y-3">
        {players.map((player) => (
          <div
            key={player.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg transition-colors",
              currentTurn === player.id && "bg-primary/10 ring-1 ring-primary",
            )}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground font-semibold">
                {player.symbol || player.username[0]}
              </div>
              {player.isHost && <Crown className="absolute -top-2 -right-1 h-4 w-4 text-yellow-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {player.username}
                {player.id === currentPlayerId && " (You)"}
              </p>
              {currentTurn === player.id && (
                <p className="text-xs text-primary flex items-center gap-1">
                  <Circle className="h-2 w-2 fill-current animate-pulse" />
                  Their turn
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
