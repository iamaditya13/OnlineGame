"use client"

import { useEffect } from "react"
import { TicTacToeBoard } from "./tic-tac-toe-board"
import { ConnectBoard } from "./connect-board"
import { GomokuBoard } from "./gomoku-board"
import { SecretCodeBoard } from "./secret-code-board"
import { GoFishBoard } from "./go-fish-board"
import { BattleshipBoard } from "./battleship-board"
import { WarBoard } from "./war-board"
import { RummyBoard } from "./rummy-board"
import { ChessBoard } from "./chess-board"
import type { GameState } from "@/hooks/use-socket"

interface MatchCanvasProps {
  gameType: string
  gameState: GameState
  playerId: string
  onMove: (move: unknown) => void
}

export function MatchCanvas({ gameType, gameState, playerId, onMove }: MatchCanvasProps) {
  const isGameOver = gameState.winner !== null || gameState.isDraw

  useEffect(() => {
    const handleAiMove = (e: CustomEvent) => {
      onMove(e.detail)
    }

    window.addEventListener("ai-move", handleAiMove as EventListener)

    return () => {
      window.removeEventListener("ai-move", handleAiMove as EventListener)
    }
  }, [onMove])

  const handleCellClick = (x: number, y: number) => {
    if (!isGameOver) {
      onMove({ x, y })
    }
  }

  const handleColumnClick = (column: number) => {
    if (!isGameOver) {
      onMove({ x: 0, y: column })
    }
  }

  const renderGameBoard = () => {
    switch (gameType) {
      case "tic-tac-toe":
        return (
          <TicTacToeBoard
            board={gameState.board}
            onCellClick={handleCellClick}
            disabled={isGameOver}
            currentPlayer={gameState.currentPlayer}
            playerId={playerId}
            winningCells={gameState.winningCells}
            lastMove={gameState.lastMove}
          />
        )
      case "connect-4":
        return (
          <ConnectBoard
            board={gameState.board}
            onColumnClick={handleColumnClick}
            disabled={isGameOver}
            currentPlayer={gameState.currentPlayer}
            playerId={playerId}
            connectN={4}
            winningCells={gameState.winningCells}
            lastMove={gameState.lastMove}
          />
        )
      case "chess":
        if (!gameState.chess) return <div className="text-muted-foreground">Loading Chess...</div>
        return (
          <ChessBoard
            chessState={gameState.chess}
            onMove={(from, to) => onMove({ from, to })}
            disabled={isGameOver}
            playerId={playerId}
            currentPlayer={gameState.currentPlayer}
          />
        )
      case "gomoku":
        return (
          <GomokuBoard
            board={gameState.board}
            onCellClick={handleCellClick}
            disabled={isGameOver}
            currentPlayer={gameState.currentPlayer}
            playerId={playerId}
            winningCells={gameState.winningCells}
            lastMove={gameState.lastMove}
          />
        )
      case "secret-code":
      case "secret-code-numbers":
      case "secret-code-letters":
        return (
          <SecretCodeBoard
            secretCodeState={gameState.secretCode!}
            onGuess={(colors) => onMove({ colors })}
            disabled={isGameOver}
          />
        )
      case "go-fish":
        return (
          <GoFishBoard
            goFishState={gameState.goFish!}
            onAskForCard={(rank) => onMove({ rank })}
            disabled={isGameOver}
          />
        )
      case "battleship":
        return (
          <BattleshipBoard
            battleshipState={gameState.battleship!}
            onMove={(x, y, horizontal) => onMove({ x, y, horizontal })}
            onRotate={() => onMove({ rotate: true, x: 0, y: 0 })}
            disabled={isGameOver}
          />
        )
      case "war":
        return (
          <WarBoard warState={gameState.war!} onPlayRound={() => onMove({ action: "play" })} disabled={isGameOver} />
        )
      case "rummy":
        return (
          <RummyBoard
            rummyState={gameState.rummy!}
            onDraw={(from) => onMove({ action: "draw", from })}
            onDiscard={(cardId) => onMove({ action: "discard", cardId })}
            onDeclare={() => onMove({ action: "declare" })}
            disabled={isGameOver}
          />
        )
      default:
        return (
          <div className="flex items-center justify-center h-64 text-muted-foreground">Game board not available</div>
        )
    }
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 p-4 sm:p-8 bg-card rounded-xl border border-border min-h-[400px]">
      {isGameOver && (
        <div className="mb-6 p-4 rounded-lg bg-primary/10 text-center">
          {gameState.winner ? (
            <p className="text-lg font-bold text-primary">{gameState.winner === playerId ? "You won!" : "You lost!"}</p>
          ) : (
            <p className="text-lg font-bold text-muted-foreground">{"It's a draw!"}</p>
          )}
        </div>
      )}
      {renderGameBoard()}
    </div>
  )
}
