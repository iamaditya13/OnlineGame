"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { RummyState, RummyCard } from "@/lib/game-logic"

interface RummyBoardProps {
  rummyState: RummyState
  onDraw: (from: "deck" | "discard") => void
  onDiscard: (cardId: string) => void
  onDeclare: () => void
  disabled?: boolean
}

function PlayingCard({
  card,
  faceDown = false,
  selected = false,
  onClick,
  small = false,
}: {
  card?: RummyCard
  faceDown?: boolean
  selected?: boolean
  onClick?: () => void
  small?: boolean
}) {
  if (faceDown) {
    return (
      <div
        className={cn(
          "rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-400 shadow-md flex items-center justify-center cursor-pointer hover:scale-105 transition-transform",
          small ? "w-10 h-14" : "w-12 h-18 sm:w-14 sm:h-20",
        )}
        onClick={onClick}
      >
        <div className={cn("rounded border border-blue-300/30 bg-blue-500/30", small ? "w-6 h-8" : "w-8 h-10")} />
      </div>
    )
  }

  if (!card) return null

  const isRed = card.suit === "♥" || card.suit === "♦"

  return (
    <div
      className={cn(
        "rounded-lg bg-white border-2 shadow-md flex flex-col items-center justify-center transition-all cursor-pointer",
        isRed ? "text-red-600" : "text-gray-900",
        selected ? "border-primary ring-2 ring-primary -translate-y-2" : "border-gray-200 hover:border-gray-400",
        small ? "w-10 h-14" : "w-12 h-18 sm:w-14 sm:h-20",
      )}
      onClick={onClick}
    >
      <span className={cn("font-bold", small ? "text-sm" : "text-lg")}>{card.display}</span>
      <span className={small ? "text-xs" : "text-sm"}>{card.suit}</span>
    </div>
  )
}

export function RummyBoard({ rummyState, onDraw, onDiscard, onDeclare, disabled = false }: RummyBoardProps) {
  const [selectedCard, setSelectedCard] = useState<string | null>(null)

  const { phase, deck, discardPile, playerHand, opponentHand, currentTurn, turnPhase, winner, lastAction } = rummyState

  const gameOver = phase === "finished"
  const isPlayerTurn = currentTurn === "player"
  const topDiscard = discardPile[discardPile.length - 1]

  const handleCardClick = (cardId: string) => {
    if (turnPhase === "discard" && isPlayerTurn && !gameOver) {
      if (selectedCard === cardId) {
        // Double click to discard
        onDiscard(cardId)
        setSelectedCard(null)
      } else {
        setSelectedCard(cardId)
      }
    }
  }

  const handleDiscardSelected = () => {
    if (selectedCard) {
      onDiscard(selectedCard)
      setSelectedCard(null)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-4xl mx-auto">
      {/* Status */}
      <div className="text-center p-3 bg-secondary rounded-lg w-full">
        <p className="text-sm text-foreground font-medium">{lastAction}</p>
        {!gameOver && (
          <p className="text-xs text-muted-foreground mt-1">
            {isPlayerTurn
              ? turnPhase === "draw"
                ? "Draw a card from deck or discard pile"
                : "Select a card to discard (click twice or use button)"
              : "Opponent's turn..."}
          </p>
        )}
      </div>

      {/* Opponent's Hand (face down) */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm text-muted-foreground">Opponent ({opponentHand.length} cards)</span>
        <div className="flex gap-1 flex-wrap justify-center">
          {opponentHand.slice(0, 13).map((_, i) => (
            <PlayingCard key={i} faceDown small />
          ))}
        </div>
      </div>

      {/* Center Area - Deck and Discard */}
      <div className="flex items-center gap-8 py-4">
        {/* Draw Deck */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground">Deck ({deck.length})</span>
          <div className="relative">
            <PlayingCard faceDown onClick={() => isPlayerTurn && turnPhase === "draw" && !gameOver && onDraw("deck")} />
            {isPlayerTurn && turnPhase === "draw" && !gameOver && (
              <div className="absolute inset-0 rounded-lg border-2 border-primary animate-pulse pointer-events-none" />
            )}
          </div>
        </div>

        {/* Discard Pile */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground">Discard</span>
          <div className="relative">
            {topDiscard ? (
              <PlayingCard
                card={topDiscard}
                onClick={() => isPlayerTurn && turnPhase === "draw" && !gameOver && onDraw("discard")}
              />
            ) : (
              <div className="w-14 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                <span className="text-xs text-muted-foreground">Empty</span>
              </div>
            )}
            {isPlayerTurn && turnPhase === "draw" && !gameOver && topDiscard && (
              <div className="absolute inset-0 rounded-lg border-2 border-primary animate-pulse pointer-events-none" />
            )}
          </div>
        </div>
      </div>

      {/* Player's Hand */}
      <div className="flex flex-col items-center gap-3 w-full">
        <span className="text-sm text-foreground font-medium">Your Hand ({playerHand.length} cards)</span>
        <div className="flex gap-1 flex-wrap justify-center p-4 bg-secondary/50 rounded-xl min-h-[100px]">
          {playerHand.map((card) => (
            <PlayingCard
              key={card.id}
              card={card}
              selected={selectedCard === card.id}
              onClick={() => handleCardClick(card.id)}
            />
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      {!gameOver && isPlayerTurn && turnPhase === "discard" && (
        <div className="flex gap-3">
          <Button
            onClick={handleDiscardSelected}
            disabled={!selectedCard || disabled}
            variant="outline"
            className="border-border text-foreground bg-transparent"
          >
            Discard Selected
          </Button>
          <Button onClick={onDeclare} disabled={disabled} className="bg-green-600 hover:bg-green-700 text-white">
            Declare Rummy!
          </Button>
        </div>
      )}

      {/* Game Over */}
      {gameOver && (
        <div
          className={cn(
            "p-6 rounded-xl text-center",
            winner === "player" ? "bg-green-500/20" : winner === "opponent" ? "bg-red-500/20" : "bg-gray-500/20",
          )}
        >
          <p className="text-2xl font-bold text-foreground">
            {winner === "player" ? "You Won!" : winner === "opponent" ? "Opponent Won!" : "Draw!"}
          </p>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-muted-foreground text-center max-w-md">
        <p>
          <strong>Sets:</strong> 3-4 cards of same rank, different suits. <strong>Runs:</strong> 3+ consecutive cards of
          same suit.
        </p>
        <p className="mt-1">Declare when your entire hand forms valid melds!</p>
      </div>
    </div>
  )
}
