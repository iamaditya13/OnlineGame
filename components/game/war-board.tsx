"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { WarState } from "@/lib/game-logic"

interface WarBoardProps {
  warState: WarState
  onPlayRound: () => void
  disabled?: boolean
}

function PlayingCard({ card, faceDown = false }: { card?: { display: string; suit: string }; faceDown?: boolean }) {
  if (!card) return null

  const isRed = card.suit === "♥" || card.suit === "♦"

  if (faceDown) {
    return (
      <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-400 shadow-lg flex items-center justify-center">
        <div className="w-10 h-14 sm:w-12 sm:h-16 rounded border border-blue-300/30 bg-blue-500/30" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "w-16 h-24 sm:w-20 sm:h-28 rounded-lg bg-white border-2 shadow-lg flex flex-col items-center justify-center",
        isRed ? "text-red-600 border-red-200" : "text-gray-900 border-gray-200",
      )}
    >
      <span className="text-2xl sm:text-3xl font-bold">{card.display}</span>
      <span className="text-xl sm:text-2xl">{card.suit}</span>
    </div>
  )
}

export function WarBoard({ warState, onPlayRound, disabled = false }: WarBoardProps) {
  const { phase, playerDeck, opponentDeck, lastBattle, winner, lastAction, isWar, pile } = warState

  const gameOver = phase === "finished"

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      {/* Status */}
      <div className="text-center p-3 bg-secondary rounded-lg w-full">
        <p className="text-sm text-foreground font-medium">{lastAction}</p>
        {isWar && (
          <p className="text-xs text-yellow-500 mt-1 font-bold animate-pulse">WAR! {pile.length} cards in the pot!</p>
        )}
      </div>

      {/* Game Area */}
      <div className="flex items-center justify-center gap-8 sm:gap-16 py-8">
        {/* Opponent Side */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Opponent</span>
          <div className="relative">
            {lastBattle?.opponentCard ? (
              <PlayingCard card={lastBattle.opponentCard} />
            ) : (
              <PlayingCard card={{ display: "?", suit: "" }} faceDown />
            )}
            {isWar && lastBattle?.warCards?.opponent && (
              <div className="absolute -bottom-2 -right-2 flex">
                {lastBattle.warCards.opponent.map((_, i) => (
                  <div
                    key={i}
                    className="w-4 h-6 bg-blue-700 rounded border border-blue-500 -ml-2 first:ml-0"
                    style={{ transform: `rotate(${(i - 1) * 5}deg)` }}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-full">
            <span className="text-xs text-muted-foreground">Cards:</span>
            <span className="text-sm font-bold text-foreground">{opponentDeck.length}</span>
          </div>
        </div>

        {/* VS Indicator */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl font-bold text-primary">VS</span>
          {lastBattle && !isWar && (
            <span
              className={cn(
                "px-3 py-1 rounded-full text-xs font-bold",
                lastBattle.winner === "player"
                  ? "bg-green-500/20 text-green-500"
                  : lastBattle.winner === "opponent"
                    ? "bg-red-500/20 text-red-500"
                    : "bg-yellow-500/20 text-yellow-500",
              )}
            >
              {lastBattle.winner === "player" ? "YOU WIN" : lastBattle.winner === "opponent" ? "THEY WIN" : "WAR!"}
            </span>
          )}
        </div>

        {/* Player Side */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">You</span>
          <div className="relative">
            {lastBattle?.playerCard ? (
              <PlayingCard card={lastBattle.playerCard} />
            ) : (
              <PlayingCard card={{ display: "?", suit: "" }} faceDown />
            )}
            {isWar && lastBattle?.warCards?.player && (
              <div className="absolute -bottom-2 -left-2 flex">
                {lastBattle.warCards.player.map((_, i) => (
                  <div
                    key={i}
                    className="w-4 h-6 bg-blue-700 rounded border border-blue-500 -ml-2 first:ml-0"
                    style={{ transform: `rotate(${(i - 1) * -5}deg)` }}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-full">
            <span className="text-xs text-muted-foreground">Cards:</span>
            <span className="text-sm font-bold text-foreground">{playerDeck.length}</span>
          </div>
        </div>
      </div>

      {/* Play Button */}
      {!gameOver && (
        <Button
          onClick={onPlayRound}
          disabled={disabled}
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
        >
          {isWar ? "Resolve War!" : "Play Round"}
        </Button>
      )}

      {/* Final Result */}
      {gameOver && (
        <div
          className={cn(
            "p-6 rounded-xl text-center",
            winner === "player" ? "bg-green-500/20" : winner === "opponent" ? "bg-red-500/20" : "bg-gray-500/20",
          )}
        >
          <p className="text-2xl font-bold text-foreground">
            {winner === "player" ? "You Won the War!" : winner === "opponent" ? "You Lost the War!" : "Draw!"}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Final cards - You: {playerDeck.length}, Opponent: {opponentDeck.length}
          </p>
        </div>
      )}

      {/* Card Count Bar */}
      <div className="w-full max-w-md">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>You: {playerDeck.length}</span>
          <span>Opponent: {opponentDeck.length}</span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden flex">
          <div
            className="bg-primary transition-all duration-500"
            style={{ width: `${(playerDeck.length / 52) * 100}%` }}
          />
          <div
            className="bg-red-500 transition-all duration-500"
            style={{ width: `${(opponentDeck.length / 52) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
