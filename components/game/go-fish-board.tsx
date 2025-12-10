"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { GoFishState, GoFishCard } from "@/lib/game-logic"

interface GoFishBoardProps {
  goFishState: GoFishState
  onAskForCard: (rank: string) => void
  disabled?: boolean
}

const SUIT_SYMBOLS: Record<string, string> = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
}

const SUIT_COLORS: Record<string, string> = {
  hearts: "text-red-500",
  diamonds: "text-red-500",
  clubs: "text-foreground",
  spades: "text-foreground",
}

function Card({ card, selected, onClick }: { card: GoFishCard; selected?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-14 h-20 sm:w-16 sm:h-24 rounded-lg bg-card border-2 transition-all",
        "flex flex-col items-center justify-center text-sm font-bold shadow-md",
        selected ? "border-primary ring-2 ring-primary/50 -translate-y-2" : "border-border",
        onClick && "hover:-translate-y-1 cursor-pointer",
        SUIT_COLORS[card.suit],
      )}
    >
      <span className="text-lg">{card.rank}</span>
      <span className="text-xl">{SUIT_SYMBOLS[card.suit]}</span>
    </button>
  )
}

function CardBack() {
  return (
    <div className="w-14 h-20 sm:w-16 sm:h-24 rounded-lg bg-blue-600 border-2 border-blue-700 shadow-md flex items-center justify-center">
      <div className="w-10 h-16 sm:w-12 sm:h-20 rounded bg-blue-700 border border-blue-500" />
    </div>
  )
}

export function GoFishBoard({ goFishState, onAskForCard, disabled = false }: GoFishBoardProps) {
  const [selectedRank, setSelectedRank] = useState<string | null>(null)

  const { playerHand, opponentHand, playerBooks, opponentBooks, currentTurn, lastAction, deck, gameOver } = goFishState

  const handleAsk = () => {
    if (selectedRank) {
      onAskForCard(selectedRank)
      setSelectedRank(null)
    }
  }

  // Get unique ranks in player's hand for selection
  const uniqueRanks = [...new Set(playerHand.map((c) => c.rank))]

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
      {/* Status */}
      <div className="text-center p-3 bg-secondary rounded-lg w-full">
        <p className="text-sm text-foreground font-medium">{lastAction}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Deck: {deck.length} cards | Your books: {playerBooks.length} | Opponent: {opponentBooks.length}
        </p>
      </div>

      {/* Opponent's hand (face down) */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {"Opponent's Hand"} ({opponentHand.length})
        </span>
        <div className="flex gap-1 flex-wrap justify-center">
          {opponentHand.slice(0, 7).map((_, i) => (
            <CardBack key={i} />
          ))}
          {opponentHand.length > 7 && (
            <span className="text-xs text-muted-foreground self-center">+{opponentHand.length - 7}</span>
          )}
        </div>
      </div>

      {/* Books display */}
      <div className="flex gap-8 text-sm">
        <div className="text-center">
          <span className="text-muted-foreground">Your Books ({playerBooks.length}):</span>
          <div className="flex gap-1 mt-1 flex-wrap justify-center">
            {playerBooks.length === 0 ? (
              <span className="text-xs text-muted-foreground">None yet</span>
            ) : (
              playerBooks.map((rank) => (
                <span key={rank} className="px-2 py-1 bg-primary/20 rounded text-primary font-bold">
                  {rank}
                </span>
              ))
            )}
          </div>
        </div>
        <div className="text-center">
          <span className="text-muted-foreground">Opponent Books ({opponentBooks.length}):</span>
          <div className="flex gap-1 mt-1 flex-wrap justify-center">
            {opponentBooks.length === 0 ? (
              <span className="text-xs text-muted-foreground">None yet</span>
            ) : (
              opponentBooks.map((rank) => (
                <span key={rank} className="px-2 py-1 bg-destructive/20 rounded text-destructive font-bold">
                  {rank}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Player's hand */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-muted-foreground">Your Hand - Select a card to ask for that rank</span>
        <div className="flex gap-1 flex-wrap justify-center">
          {playerHand.map((card) => (
            <Card
              key={card.id}
              card={card}
              selected={selectedRank === card.rank}
              onClick={() => !disabled && currentTurn === "player" && !gameOver && setSelectedRank(card.rank)}
            />
          ))}
        </div>
      </div>

      {/* Action button */}
      {!gameOver && (
        <div className="flex flex-col items-center gap-2">
          <Button
            onClick={handleAsk}
            disabled={disabled || currentTurn !== "player" || !selectedRank}
            className="bg-primary text-primary-foreground"
          >
            {currentTurn === "player"
              ? selectedRank
                ? `Ask for ${selectedRank}s`
                : "Select a card from your hand"
              : "Opponent's turn..."}
          </Button>
          {currentTurn === "player" && uniqueRanks.length > 0 && (
            <p className="text-xs text-muted-foreground">You can ask for: {uniqueRanks.join(", ")}</p>
          )}
        </div>
      )}

      {gameOver && (
        <div
          className={cn(
            "text-lg font-bold p-4 rounded-lg",
            playerBooks.length > opponentBooks.length
              ? "text-green-500 bg-green-500/10"
              : playerBooks.length < opponentBooks.length
                ? "text-red-500 bg-red-500/10"
                : "text-yellow-500 bg-yellow-500/10",
          )}
        >
          {playerBooks.length > opponentBooks.length
            ? `You win! (${playerBooks.length} vs ${opponentBooks.length} books)`
            : playerBooks.length < opponentBooks.length
              ? `You lose! (${playerBooks.length} vs ${opponentBooks.length} books)`
              : `It's a tie! (${playerBooks.length} books each)`}
        </div>
      )}
    </div>
  )
}
