"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"

interface CreateRoomModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateRoom: (gameType: string, mode: string, isAiGame: boolean) => void
  selectedGame?: string
}

const GAMES = [
  { id: "tic-tac-toe", name: "Tic-Tac-Toe" },
  { id: "connect-4", name: "Connect 4" },
  { id: "connect-3", name: "Connect 3" },
  { id: "gomoku", name: "Gomoku" },
  { id: "secret-code", name: "Secret Code" },
  { id: "go-fish", name: "Go Fish" },
  { id: "battleship", name: "Battleship" },
  { id: "war", name: "War" },
  { id: "rummy", name: "Rummy" },
]

const MODES = [
  { id: "casual", name: "Casual", description: "Relaxed play, no time pressure" },
  { id: "ranked", name: "Ranked", description: "Competitive play with rankings" },
]

export function CreateRoomModal({ open, onOpenChange, onCreateRoom, selectedGame }: CreateRoomModalProps) {
  const [gameType, setGameType] = useState(selectedGame || "tic-tac-toe")
  const [mode, setMode] = useState("casual")
  const [isAiGame, setIsAiGame] = useState(false)

  useEffect(() => {
    if (selectedGame) {
      setGameType(selectedGame)
    }
  }, [selectedGame])

  const handleCreate = () => {
    onCreateRoom(gameType, mode, isAiGame)
    onOpenChange(false)
  }

  const selectedGameData = GAMES.find((g) => g.id === gameType)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create Room</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label className="text-foreground">Game</Label>
            <Select value={gameType} onValueChange={setGameType}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {GAMES.map((game) => (
                  <SelectItem key={game.id} value={game.id} className="text-popover-foreground">
                    {game.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg bg-secondary/50 border-border">
            <Label htmlFor="ai-mode" className="flex flex-col space-y-1 cursor-pointer">
              <span className="font-medium text-foreground">Play against AI</span>
              <span className="font-normal text-xs text-muted-foreground">
                Enable to play solo against the computer
              </span>
            </Label>
            <Switch id="ai-mode" checked={isAiGame} onCheckedChange={setIsAiGame} />
          </div>

          <div className="grid gap-2">
            <Label className="text-foreground">Mode</Label>
            <RadioGroup value={mode} onValueChange={setMode} className="grid grid-cols-2 gap-4">
              {MODES.map((m) => (
                <label
                  key={m.id}
                  className={`flex flex-col gap-1 p-4 rounded-lg border cursor-pointer transition-colors ${
                    mode === m.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value={m.id} id={m.id} />
                    <span className="font-medium text-foreground">{m.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{m.description}</span>
                </label>
              ))}
            </RadioGroup>
          </div>

          <div className="grid gap-2">
            <Label className="text-foreground">Preview</Label>
            <div className="aspect-video rounded-lg bg-secondary border border-border flex items-center justify-center">
              <img
                src={`/.jpg?height=160&width=280&query=${selectedGameData?.name || "board game"} game board preview`}
                alt="Game preview"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border text-foreground">
            Cancel
          </Button>
          <Button onClick={handleCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Create Room
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
