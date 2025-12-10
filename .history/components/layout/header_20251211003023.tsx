"use client"

import { Search, Plus, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TutorialButton } from "@/components/ui/tutorial-button"

interface HeaderProps {
  username?: string
  onCreateRoom: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function Header({ username, onCreateRoom, searchQuery, onSearchChange }: HeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-card px-4 flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">TK</span>
        </div>
        <span className="font-semibold text-lg text-foreground hidden sm:block">TimeKill</span>
      </div>

      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search games..."
            className="pl-10 bg-input border-border text-foreground"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <TutorialButton onClick={() => document.dispatchEvent(new CustomEvent("open-tutorial"))} />
        
        <Button onClick={onCreateRoom} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Create Room</span>
        </Button>

        {username && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">{username}</span>
          </div>
        )}
      </div>
    </header>
  )
}
