"use client"

import { ChessState } from "@/lib/game-logic"
import { cn } from "@/lib/utils"

interface ChessBoardProps {
  chessState: ChessState
  onMove: (from: { x: number; y: number }, to: { x: number; y: number }) => void
  disabled: boolean
  playerId: string
  currentPlayer: string
}

export function ChessBoard({ chessState, onMove, disabled, playerId, currentPlayer }: ChessBoardProps) {
  const { board, turn, lastMove, winner } = chessState
  
  // Simple state to track selected piece for moving
  const [selected, setSelected] = useState<{ x: number; y: number } | null>(null)

  const handleSquareClick = (x: number, y: number) => {
    if (disabled) return
    // If it's not our turn, we can't do anything (unless local multiplayer, but we assume networked/AI)
    // Actually, we should check if currentPlayer matches playerId. 
    // But for now, let's just rely on the turn in state.
    
    // If we have a selected piece
    if (selected) {
      // If clicking same square, deselect
      if (selected.x === x && selected.y === y) {
        setSelected(null)
        return
      }
      
      // Try to move
      onMove(selected, { x, y })
      setSelected(null)
    } else {
      // Select a piece if it belongs to the current turn color
      const piece = board[x][y]
      if (piece && piece.color === turn) {
        setSelected({ x, y })
      }
    }
  }

  const getPieceSymbol = (type: string, color: string) => {
    const symbols: Record<string, string> = {
      'k': '♔', 'q': '♕', 'r': '♖', 'b': '♗', 'n': '♘', 'p': '♙'
    }
    // In many fonts, black pieces are filled, white are outlined. 
    // Or we can just use the same symbol and color them.
    // Let's use standard unicode chess pieces.
    const whiteSymbols: Record<string, string> = {
      'k': '♔', 'q': '♕', 'r': '♖', 'b': '♗', 'n': '♘', 'p': '♙'
    }
    const blackSymbols: Record<string, string> = {
      'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
    }
    
    return color === 'w' ? whiteSymbols[type] : blackSymbols[type]
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-8 border-2 border-border bg-card">
        {board.map((row, i) => (
          row.map((cell, j) => {
            const isBlackSquare = (i + j) % 2 === 1
            const isSelected = selected?.x === i && selected?.y === j
            const isLastMoveFrom = lastMove?.from.x === i && lastMove?.from.y === j
            const isLastMoveTo = lastMove?.to.x === i && lastMove?.to.y === j
            
            return (
              <div
                key={`${i}-${j}`}
                onClick={() => handleSquareClick(i, j)}
                className={cn(
                  "w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-3xl sm:text-4xl cursor-pointer select-none transition-colors",
                  isBlackSquare ? "bg-slate-600" : "bg-slate-300",
                  isSelected && "bg-yellow-400 ring-2 ring-yellow-600",
                  (isLastMoveFrom || isLastMoveTo) && !isSelected && "bg-yellow-200/50",
                  disabled && "cursor-not-allowed opacity-80"
                )}
              >
                {cell && (
                  <span className={cn(
                    "drop-shadow-sm",
                    cell.color === 'w' ? "text-white" : "text-black"
                  )}>
                    {getPieceSymbol(cell.type, cell.color)}
                  </span>
                )}
              </div>
            )
          })
        ))}
      </div>
      <div className="text-sm text-muted-foreground">
        {turn === 'w' ? "White's Turn" : "Black's Turn"}
      </div>
    </div>
  )
}

import { useState } from "react"
