"use client"

import { useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import type { BattleshipState, BattleshipCell } from "@/lib/game-logic"
import { BATTLESHIP_SHIPS } from "@/lib/game-logic"

interface BattleshipBoardProps {
  battleshipState: BattleshipState
  onMove: (x: number, y: number, horizontal?: boolean) => void
  onRotate: () => void
  disabled?: boolean
}

function Cell({
  cell,
  isHidden,
  onClick,
  isPreview,
  canClick,
}: {
  cell: BattleshipCell
  isHidden?: boolean
  onClick?: () => void
  isPreview?: boolean
  canClick?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={!canClick}
      className={cn(
        "w-7 h-7 sm:w-8 sm:h-8 border border-blue-900/50 transition-all",
        "flex items-center justify-center text-xs font-bold",
        cell === "empty" && "bg-blue-900/30",
        cell === "ship" && !isHidden && "bg-gray-500",
        cell === "ship" && isHidden && "bg-blue-900/30",
        cell === "hit" && "bg-red-500",
        cell === "miss" && "bg-blue-300",
        isPreview && "bg-gray-400/70",
        canClick && cell !== "hit" && cell !== "miss" && "hover:bg-blue-700 cursor-pointer",
      )}
    >
      {cell === "hit" && "X"}
      {cell === "miss" && "•"}
    </button>
  )
}

export function BattleshipBoard({ battleshipState, onMove, onRotate, disabled = false }: BattleshipBoardProps) {
  const {
    playerBoard,
    opponentBoard,
    phase,
    placingShip,
    placementHorizontal,
    currentTurn,
    lastAction,
    gameOver,
    playerShips,
    opponentShips,
  } = battleshipState

  const currentShip = phase === "placement" ? BATTLESHIP_SHIPS[placingShip] : null

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") {
        if (phase === "placement") {
          onRotate()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [phase, onRotate])

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Status */}
      <div className="text-center p-3 bg-secondary rounded-lg w-full max-w-md">
        <p className="text-sm text-foreground font-medium">{lastAction}</p>
      </div>

      {phase === "placement" && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRotate}
            className="border-border text-foreground bg-transparent"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            {placementHorizontal ? "Horizontal" : "Vertical"} (R)
          </Button>
          <span className="text-sm text-muted-foreground">
            Placing: {currentShip?.name} ({currentShip?.size} cells)
          </span>
        </div>
      )}

      <div className="flex gap-4 lg:gap-8 flex-wrap justify-center">
        {/* Player's board */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium text-foreground">Your Fleet</span>
          <div className="bg-blue-950 p-1 rounded-lg">
            <div className="grid grid-cols-10 gap-0">
              {playerBoard.map((row, x) =>
                row.map((cell, y) => (
                  <Cell
                    key={`p-${x}-${y}`}
                    cell={cell}
                    onClick={() => phase === "placement" && onMove(x, y, placementHorizontal)}
                    canClick={phase === "placement" && !disabled}
                  />
                )),
              )}
            </div>
          </div>
          {/* Ship status */}
          <div className="flex gap-1 flex-wrap justify-center mt-1">
            {playerShips.map((ship) => (
              <span
                key={ship.name}
                className={cn(
                  "px-2 py-0.5 rounded text-xs",
                  ship.hits === ship.size ? "bg-red-500/50 line-through" : "bg-green-500/30",
                )}
              >
                {ship.name}
              </span>
            ))}
          </div>
        </div>

        {/* Opponent's board - only show during playing phase */}
        {phase === "playing" && (
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium text-foreground">Enemy Waters</span>
            <div className="bg-blue-950 p-1 rounded-lg">
              <div className="grid grid-cols-10 gap-0">
                {opponentBoard.map((row, x) =>
                  row.map((cell, y) => (
                    <Cell
                      key={`o-${x}-${y}`}
                      cell={cell}
                      isHidden={true}
                      onClick={() => onMove(x, y)}
                      canClick={!disabled && !gameOver && currentTurn === "player" && cell !== "hit" && cell !== "miss"}
                    />
                  )),
                )}
              </div>
            </div>
            {/* Enemy ship status */}
            <div className="flex gap-1 flex-wrap justify-center mt-1">
              {opponentShips.map((ship) => (
                <span
                  key={ship.name}
                  className={cn(
                    "px-2 py-0.5 rounded text-xs",
                    ship.hits === ship.size ? "bg-red-500/50 line-through" : "bg-gray-500/30",
                  )}
                >
                  {ship.name}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {gameOver ? "Game Over!" : currentTurn === "player" ? "Click to attack!" : "Enemy's turn..."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
