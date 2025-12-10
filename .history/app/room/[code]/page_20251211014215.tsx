"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import { ArrowLeft, Copy, Check, Clock, Users, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLocalUser } from "@/hooks/use-local-user"
import { useSocket } from "@/hooks/use-socket"
import { MatchCanvas } from "@/components/game/match-canvas"
import { ChatPanel } from "@/components/game/chat-panel"
import { PlayersPanel } from "@/components/game/players-panel"
import { UsernameModal } from "@/components/ui/username-modal"
import {
  initGoFish,
  aiGoFishTurn,
  aiBattleshipTurn,
  initBattleship,
  initSecretCode,
  initWar,
  initRummy,
  aiRummyTurn,
} from "@/lib/game-logic"

const GAME_NAMES: Record<string, string> = {
  "tic-tac-toe": "Tic-Tac-Toe",
  "connect-4": "Connect 4",
  "connect-3": "Connect 3",
  gomoku: "Gomoku",
  "secret-code": "Secret Code",
  "go-fish": "Go Fish",
  battleship: "Battleship",
  war: "War",
  rummy: "Rummy",
}

export default function RoomPage() {
  const params = useParams()
  const code = params.code as string
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading, createUser } = useLocalUser()
  const { roomState, isConnected, joinRoom, makeMove, sendChat, leaveRoom, setRoomState } = useSocket(user?._id)

  const [copied, setCopied] = useState(false)
  const [turnTimer, setTurnTimer] = useState(0)

  const gameTypeFromUrl = searchParams.get("game") || "tic-tac-toe"

  useEffect(() => {
    if (user && !roomState) {
      joinRoom(code)
    }
  }, [user, code, roomState, joinRoom])

  useEffect(() => {
    if (roomState?.status === "playing") {
      const interval = setInterval(() => {
        setTurnTimer((prev) => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [roomState?.status])

  // Go Fish AI
  useEffect(() => {
    if (!roomState?.gameState?.goFish) return

    const goFish = roomState.gameState.goFish
    if (goFish.currentTurn === "opponent" && !goFish.gameOver) {
      const timer = setTimeout(() => {
        setRoomState((prev) => {
          if (!prev?.gameState?.goFish) return prev
          const newGoFishState = aiGoFishTurn(prev.gameState.goFish)

          const winner = newGoFishState.gameOver
            ? newGoFishState.playerBooks.length > newGoFishState.opponentBooks.length
              ? user?._id || null
              : newGoFishState.playerBooks.length < newGoFishState.opponentBooks.length
                ? "player1"
                : null
            : null

          return {
            ...prev,
            gameState: {
              ...prev.gameState,
              goFish: newGoFishState,
              winner,
              isDraw:
                newGoFishState.gameOver && newGoFishState.playerBooks.length === newGoFishState.opponentBooks.length,
            },
          }
        })
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [roomState?.gameState?.goFish, user?._id, setRoomState])

  // Battleship AI
  useEffect(() => {
    if (!roomState?.gameState?.battleship) return

    const battleship = roomState.gameState.battleship
    if (battleship.phase === "playing" && battleship.currentTurn === "opponent" && !battleship.gameOver) {
      const timer = setTimeout(() => {
        setRoomState((prev) => {
          if (!prev?.gameState?.battleship) return prev
          const newBattleshipState = aiBattleshipTurn(prev.gameState.battleship)
          return {
            ...prev,
            gameState: {
              ...prev.gameState,
              battleship: newBattleshipState,
              winner:
                newBattleshipState.winner === "player"
                  ? user?._id || null
                  : newBattleshipState.winner === "opponent"
                    ? "player1"
                    : null,
            },
          }
        })
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [roomState?.gameState?.battleship, user?._id, setRoomState])

  useEffect(() => {
    if (!roomState?.gameState?.rummy) return

    const rummy = roomState.gameState.rummy
    if (rummy.currentTurn === "opponent" && rummy.phase === "playing") {
      const timer = setTimeout(() => {
        setRoomState((prev) => {
          if (!prev?.gameState?.rummy) return prev
          const newRummyState = aiRummyTurn(prev.gameState.rummy)
          return {
            ...prev,
            gameState: {
              ...prev.gameState,
              rummy: newRummyState,
              winner:
                newRummyState.winner === "player" ? user?._id || null : newRummyState.winner === "opponent" ? "player1" : null,
              isDraw: newRummyState.phase === "finished" && newRummyState.winner === null,
            },
          }
        })
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [roomState?.gameState?.rummy, user?._id, setRoomState])

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLeave = () => {
    leaveRoom()
    router.push("/")
  }

  const handleRestart = useCallback(() => {
    if (!roomState || !user) return

    const gameType = roomState.gameType
    let newGameState = roomState.gameState

    if (gameType === "go-fish") {
      newGameState = {
        ...roomState.gameState!,
        goFish: initGoFish(),
        winner: null,
        isDraw: false,
      }
    } else if (gameType === "battleship") {
      newGameState = {
        ...roomState.gameState!,
        battleship: initBattleship(),
        winner: null,
        isDraw: false,
      }
    } else if (gameType === "secret-code") {
      newGameState = {
        ...roomState.gameState!,
        secretCode: initSecretCode(),
        winner: null,
        isDraw: false,
      }
    } else if (gameType === "war") {
      newGameState = {
        ...roomState.gameState!,
        war: initWar(),
        winner: null,
        isDraw: false,
      }
    } else if (gameType === "rummy") {
      newGameState = {
        ...roomState.gameState!,
        rummy: initRummy(),
        winner: null,
        isDraw: false,
      }
    } else {
      let rows = 3
      let cols = 3

      if (gameType === "connect-4") {
        rows = 6
        cols = 7
      } else if (gameType === "connect-3") {
        rows = 4
        cols = 5
      } else if (gameType === "gomoku") {
        rows = 15
        cols = 15
      }

      newGameState = {
        board: Array(rows)
          .fill(null)
          .map(() => Array(cols).fill(null)),
        currentPlayer: roomState.players[0]?.id || "player1",
        players: roomState.gameState?.players || [
          { id: "player1", username: "Player 1", symbol: "X" },
          { id: user._id, username: "You", symbol: "O" },
        ],
        winner: null,
        isDraw: false,
        moveHistory: [],
        winningCells: [],
      }
    }

    setRoomState({
      ...roomState,
      gameState: newGameState,
      status: "playing",
    })
    setTurnTimer(0)
  }, [roomState, user, setRoomState])

  const handleStartGame = () => {
    if (roomState && user) {
      handleRestart()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <UsernameModal open={true} onSubmit={createUser} />
  }

  if (!roomState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-pulse text-muted-foreground mb-4">Connecting to room...</div>
          {!isConnected && <p className="text-sm text-destructive">Connection issues. Please wait...</p>}
        </div>
      </div>
    )
  }

  const isGameOver = roomState.gameState?.winner !== null || roomState.gameState?.isDraw

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleLeave} className="text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-semibold text-foreground">{GAME_NAMES[roomState.gameType] || roomState.gameType}</h1>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Room: {code}</span>
              <button onClick={handleCopyCode} className="text-primary hover:text-primary/80 transition-colors">
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isGameOver && (
            <Button
              onClick={handleRestart}
              variant="outline"
              size="sm"
              className="border-border text-foreground bg-transparent"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Play Again
            </Button>
          )}

          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-foreground">{formatTime(turnTimer)}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="text-sm">{roomState.players.length} / 2</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Game Area */}
        <main className="flex-1 p-4 lg:p-6 flex flex-col overflow-auto">
          {roomState.status === "waiting" ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Waiting for players...</h2>
                <p className="text-muted-foreground">
                  Share the room code <span className="font-mono text-primary">{code}</span> with a friend
                </p>
                <div className="flex justify-center gap-3">
                  <Button
                    onClick={handleCopyCode}
                    variant="outline"
                    className="border-border text-foreground bg-transparent"
                  >
                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    Copy Code
                  </Button>
                  {roomState.players.length >= 1 && (
                    <Button onClick={handleStartGame} className="bg-primary text-primary-foreground">
                      Start Game vs AI
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : roomState.gameState ? (
            <MatchCanvas
              gameType={roomState.gameType}
              gameState={roomState.gameState}
              playerId={user._id}
              onMove={makeMove}
            />
          ) : null}

          {/* Move History - only for grid-based games */}
          {roomState.gameState &&
            roomState.gameState.moveHistory.length > 0 &&
            !["go-fish", "battleship", "secret-code", "war", "rummy"].includes(roomState.gameType) && (
              <div className="mt-4 p-4 bg-card rounded-lg border border-border">
                <h3 className="text-sm font-semibold text-foreground mb-2">Move History</h3>
                <div className="flex gap-2 flex-wrap">
                  {roomState.gameState.moveHistory.slice(-10).map((move, i) => (
                    <span key={i} className="px-2 py-1 bg-secondary rounded text-xs text-muted-foreground">
                      {roomState.gameState!.moveHistory.length - 10 + i + 1}. (
                      {(move.move as { x: number; y: number }).x},{(move.move as { x: number; y: number }).y})
                    </span>
                  ))}
                </div>
              </div>
            )}
        </main>

        {/* Sidebar */}
        <aside className="w-80 border-l border-border bg-sidebar p-4 hidden lg:flex flex-col gap-4">
          <PlayersPanel
            players={
              roomState.gameState?.players ||
              roomState.players.map((p, i) => ({
                ...p,
                symbol: i === 0 ? "X" : "O",
                isHost: i === 0,
              }))
            }
            currentPlayerId={user._id}
            currentTurn={roomState.gameState?.currentPlayer || ""}
          />

          <div className="flex-1 min-h-0">
            <ChatPanel messages={roomState.chat} onSendMessage={sendChat} currentUserId={user._id} />
          </div>
        </aside>
      </div>
    </div>
  )
}
