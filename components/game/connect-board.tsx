"use client"

import { cn } from "@/lib/utils"
import { useState } from "react"

interface ConnectBoardProps {
  board: (string | null)[][]
  onColumnClick: (column: number) => void
  disabled?: boolean
  currentPlayer: string
  playerId: string
  connectN?: number
  winningCells?: { x: number; y: number }[]
  lastMove?: { x: number; y: number }
}

export function ConnectBoard({
  board,
  onColumnClick,
  disabled = false,
  currentPlayer,
  playerId,
  connectN = 4,
  winningCells = [],
  lastMove,
}: ConnectBoardProps) {
  const isMyTurn = currentPlayer === playerId
  const cols = board[0]?.length || 7
  const [hoverColumn, setHoverColumn] = useState<number | null>(null)

  const isWinningCell = (x: number, y: number) => winningCells.some((cell) => cell.x === x && cell.y === y)
  const isLastMove = (x: number, y: number) => lastMove?.x === x && lastMove?.y === y
  const isColumnFull = (colIndex: number) => board[0][colIndex] !== null

  // Get current player symbol for preview
  const mySymbol = currentPlayer === playerId ? "O" : "X"

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-sm text-muted-foreground mb-2">Connect {connectN} to win!</div>

      {/* Column hover preview */}
      {isMyTurn && !disabled && (
        <div className="flex gap-1 mb-1" style={{ width: `${cols * (connectN === 4 ? 52 : 44)}px` }}>
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div
              key={colIndex}
              className={cn(
                "flex-1 h-10 sm:h-12 flex items-center justify-center transition-opacity",
                hoverColumn === colIndex && !isColumnFull(colIndex) ? "opacity-100" : "opacity-0",
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 rounded-full",
                  mySymbol === "X" ? "bg-red-500/50" : "bg-yellow-400/50",
                )}
              />
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
        <div className="flex gap-1">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <button
              key={colIndex}
              onClick={() => onColumnClick(colIndex)}
              onMouseEnter={() => setHoverColumn(colIndex)}
              onMouseLeave={() => setHoverColumn(null)}
              disabled={disabled || !isMyTurn || isColumnFull(colIndex)}
              className={cn(
                "flex flex-col gap-1 p-1 rounded transition-colors",
                !disabled && isMyTurn && !isColumnFull(colIndex) && "hover:bg-blue-500 cursor-pointer",
              )}
            >
              {board.map((row, rowIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all shadow-inner",
                    "flex items-center justify-center",
                    row[colIndex] === null && "bg-blue-900",
                    row[colIndex] === "X" && "bg-red-500 shadow-red-700",
                    row[colIndex] === "O" && "bg-yellow-400 shadow-yellow-600",
                    isWinningCell(rowIndex, colIndex) && "ring-4 ring-white animate-pulse scale-110",
                    isLastMove(rowIndex, colIndex) && !isWinningCell(rowIndex, colIndex) && "ring-2 ring-white/50",
                  )}
                />
              ))}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {disabled
          ? winningCells.length > 0
            ? "Game Over - Winner!"
            : "Game Over - Draw!"
          : isMyTurn
            ? "Your turn - click a column to drop"
            : "Opponent's turn..."}
      </p>
    </div>
  )
}
