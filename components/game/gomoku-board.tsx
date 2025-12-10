"use client"

import { cn } from "@/lib/utils"
import { useRef, useState, useEffect } from "react"

interface GomokuBoardProps {
  board: (string | null)[][]
  onCellClick: (x: number, y: number) => void
  disabled?: boolean
  currentPlayer: string
  playerId: string
  winningCells?: { x: number; y: number }[]
  lastMove?: { x: number; y: number }
}

export function GomokuBoard({
  board,
  onCellClick,
  disabled = false,
  currentPlayer,
  playerId,
  winningCells = [],
  lastMove,
}: GomokuBoardProps) {
  const isMyTurn = currentPlayer === playerId
  const size = board.length
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  const isWinningCell = (x: number, y: number) => winningCells.some((cell) => cell.x === x && cell.y === y)
  const isLastMove = (x: number, y: number) => lastMove?.x === x && lastMove?.y === y

  // Auto-scale for smaller screens
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.parentElement?.clientWidth || 600
        const boardWidth = size * 28 + 16 // cell size + padding
        if (containerWidth < boardWidth) {
          setScale(containerWidth / boardWidth)
        } else {
          setScale(1)
        }
      }
    }
    updateScale()
    window.addEventListener("resize", updateScale)
    return () => window.removeEventListener("resize", updateScale)
  }, [size])

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-sm text-muted-foreground mb-2">Connect 5 stones to win! (15×15 board)</div>

      <div
        ref={containerRef}
        className="overflow-auto max-w-full"
        style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
      >
        <div className="bg-amber-700 p-2 rounded-lg shadow-lg">
          <div
            className="grid gap-0 relative"
            style={{
              gridTemplateColumns: `repeat(${size}, 1fr)`,
            }}
          >
            {board.map((row, x) =>
              row.map((cell, y) => (
                <button
                  key={`${x}-${y}`}
                  onClick={() => onCellClick(x, y)}
                  disabled={disabled || !isMyTurn || cell !== null}
                  className={cn(
                    "w-6 h-6 sm:w-7 sm:h-7 relative transition-all",
                    "flex items-center justify-center",
                    "border border-amber-900/50",
                    // Grid line styling
                    x === 0 && "border-t-0",
                    y === 0 && "border-l-0",
                    x === size - 1 && "border-b-0",
                    y === size - 1 && "border-r-0",
                    cell === null && isMyTurn && !disabled && "hover:bg-amber-600 cursor-pointer",
                  )}
                >
                  {/* Star points for standard Gomoku board */}
                  {cell === null &&
                    ((x === 3 && y === 3) ||
                      (x === 3 && y === 11) ||
                      (x === 11 && y === 3) ||
                      (x === 11 && y === 11) ||
                      (x === 7 && y === 7)) && <div className="absolute w-1.5 h-1.5 rounded-full bg-amber-900/70" />}
                  {cell && (
                    <div
                      className={cn(
                        "w-5 h-5 sm:w-6 sm:h-6 rounded-full absolute shadow-md transition-transform",
                        cell === "X" && "bg-gray-900",
                        cell === "O" && "bg-gray-100",
                        isWinningCell(x, y) && "ring-2 ring-primary animate-pulse scale-110",
                        isLastMove(x, y) && !isWinningCell(x, y) && "ring-2 ring-red-500",
                      )}
                    />
                  )}
                </button>
              )),
            )}
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {disabled
          ? winningCells.length > 0
            ? "Game Over - 5 in a row!"
            : "Game Over - Draw!"
          : isMyTurn
            ? "Your turn - place a stone"
            : "Opponent's turn..."}
      </p>
    </div>
  )
}
