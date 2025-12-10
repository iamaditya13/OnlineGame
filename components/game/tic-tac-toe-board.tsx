"use client"

import { cn } from "@/lib/utils"

interface TicTacToeBoardProps {
  board: (string | null)[][]
  onCellClick: (x: number, y: number) => void
  disabled?: boolean
  currentPlayer: string
  playerId: string
  winningCells?: { x: number; y: number }[]
  lastMove?: { x: number; y: number }
}

export function TicTacToeBoard({
  board,
  onCellClick,
  disabled = false,
  currentPlayer,
  playerId,
  winningCells = [],
  lastMove,
}: TicTacToeBoardProps) {
  const isMyTurn = currentPlayer === playerId

  const isWinningCell = (x: number, y: number) => winningCells.some((cell) => cell.x === x && cell.y === y)
  const isLastMove = (x: number, y: number) => lastMove?.x === x && lastMove?.y === y

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-3 gap-2 p-4 bg-secondary rounded-xl">
        {board.map((row, x) =>
          row.map((cell, y) => (
            <button
              key={`${x}-${y}`}
              onClick={() => onCellClick(x, y)}
              disabled={disabled || !isMyTurn || cell !== null}
              className={cn(
                "w-20 h-20 sm:w-24 sm:h-24 rounded-lg text-4xl sm:text-5xl font-bold transition-all",
                "flex items-center justify-center",
                cell === null && isMyTurn && !disabled
                  ? "bg-card hover:bg-primary/20 cursor-pointer"
                  : "bg-card cursor-default",
                cell === "X" && "text-red-500",
                cell === "O" && "text-yellow-400",
                isWinningCell(x, y) && "ring-4 ring-primary bg-primary/20 animate-pulse",
                isLastMove(x, y) && !isWinningCell(x, y) && "ring-2 ring-foreground/30",
              )}
            >
              {cell}
            </button>
          )),
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        {disabled
          ? winningCells.length > 0
            ? "Game Over - Winner!"
            : "Game Over - Draw!"
          : isMyTurn
            ? "Your turn - place your mark"
            : "Opponent's turn..."}
      </p>
    </div>
  )
}
