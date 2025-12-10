"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, Clock, Construction, Sparkles } from "lucide-react"

interface GameCardProps {
  title: string
  description: string
  playerCount: string
  duration: string
  image: string
  onPlay: () => void
  isUnderConstruction?: boolean
  isBeta?: boolean
}

export function GameCard({
  title,
  description,
  playerCount,
  duration,
  image,
  onPlay,
  isUnderConstruction = false,
  isBeta = false,
}: GameCardProps) {
  return (
    <Card
      className={`group overflow-hidden bg-card border-border transition-all duration-300 ${
        isUnderConstruction
          ? "opacity-60 cursor-not-allowed"
          : "hover:border-primary/50 cursor-pointer hover:shadow-lg hover:shadow-primary/10"
      }`}
      onClick={() => !isUnderConstruction && onPlay()}
    >
      <div className="aspect-video relative overflow-hidden bg-secondary">
        <img
          src={image || "/placeholder.svg"}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {isUnderConstruction && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Construction className="h-5 w-5" />
              <span className="font-medium">Under Construction</span>
            </div>
          </div>
        )}
        {isBeta && !isUnderConstruction && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-500/90 text-black text-xs font-bold rounded-full flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            BETA
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{description}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {playerCount}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {duration}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
