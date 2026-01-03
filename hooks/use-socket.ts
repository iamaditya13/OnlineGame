"use client"

import { useEffect, useState, useCallback } from "react"
import { useLocalUser } from "@/hooks/use-local-user"
import {
  checkTicTacToeWin,
  checkConnectNWin,
  checkGomokuWin,
  dropPiece,
  evaluateGuess,
  initGoFish,
  askForCard,
  initBattleship,
  attackCell,
  placeShip,
  BATTLESHIP_SHIPS,
  initSecretCode,
  initWar,
  playWarRound,
  initRummy,
  drawCard,
  discardCard,
  declareRummy,
  initChess,
  applyChessMove,
  aiChessTurn,
  applySecretCodeMove,
  aiSecretCodeTurn,
  type SecretCodeState,
  type GoFishState,
  type BattleshipState,
  type WarState,
  type RummyState,
  type ChessState,
} from "@/lib/game-logic"

export interface GameState {
  board: (string | null)[][]
  currentPlayer: string
  players: { id: string; username: string; symbol?: string }[]
  winner: string | null
  isDraw: boolean
  moveHistory: { playerId: string; move: unknown; timestamp: number }[]
  winningCells?: { x: number; y: number }[]
  lastMove?: { x: number; y: number }
  difficulty: 'easy' | 'medium' | 'hard'
  secretCode?: SecretCodeState
  goFish?: GoFishState
  battleship?: BattleshipState
  war?: WarState
  rummy?: RummyState
  chess?: ChessState
}


function createInitialGameState(gameType: string, player1Id: string, player2Id: string = "player2", difficulty: 'easy' | 'medium' | 'hard' = 'medium'): GameState {
  const baseState: GameState = {
    board: [],
    currentPlayer: player1Id,
    players: [
      { id: player1Id, username: "Player 1", symbol: "X" },
      { id: player2Id, username: player2Id === "ai-player" ? "AI Opponent" : "Player 2", symbol: "O" },
    ],
    winner: null,
    isDraw: false,
    moveHistory: [],
    difficulty
  }

  switch (gameType) {
    case "tic-tac-toe":
      return {
        ...baseState,
        board: Array(3)
          .fill(null)
          .map(() => Array(3).fill(null)),
      }
    case "connect-4":
      return {
        ...baseState,
        board: Array(6)
          .fill(null)
          .map(() => Array(7).fill(null)),
      }
    case "chess":
      return {
        ...baseState,
        chess: initChess(difficulty),
      }
    case "gomoku":
      return {
        ...baseState,
        board: Array(15)
          .fill(null)
          .map(() => Array(15).fill(null)),
      }
    case "secret-code":
      return {
        ...baseState,
        secretCode: initSecretCode('colors'),
      }
    case "secret-code-numbers":
      return {
        ...baseState,
        secretCode: initSecretCode('numbers'),
      }
    case "secret-code-letters":
      return {
        ...baseState,
        secretCode: initSecretCode('letters'),
      }
    case "go-fish":
      return {
        ...baseState,
        goFish: initGoFish(),
      }
    case "battleship":
      return {
        ...baseState,
        battleship: initBattleship(),
      }
    case "war":
      return {
        ...baseState,
        war: initWar(),
      }
    case "rummy":
      return {
        ...baseState,
        rummy: initRummy(),
      }
    default:
      return {
        ...baseState,
        board: Array(3)
          .fill(null)
          .map(() => Array(3).fill(null)),
      }
  }
}

function applyMove(state: GameState, move: unknown, playerId: string, gameType: string): GameState {
  switch (gameType) {
    case "tic-tac-toe":
      return applyTicTacToeMove(state, move as { x: number; y: number }, playerId)
    case "connect-4":
      return applyConnectMove(state, move as { x: number; y: number }, playerId, 4)
    case "chess":
      const chessState = applyChessMove(state.chess!, move as { from: { x: number; y: number }, to: { x: number; y: number } })
      const winner = chessState.winner === "player1" ? state.players[0].id : chessState.winner === "player2" ? state.players[1].id : null
      
      // AI Turn
      if (chessState.turn === 'b' && !chessState.gameOver) {
         setTimeout(() => {
            window.dispatchEvent(new CustomEvent("ai-chess-turn"))
         }, 1000)
      }

      return {
        ...state,
        chess: chessState,
        winner
      }
    case "gomoku":
      return applyGomokuMove(state, move as { x: number; y: number }, playerId)
    case "secret-code":
    case "secret-code-numbers":
    case "secret-code-letters":
      const scState = applySecretCodeMove(
        state.secretCode!,
        move as { action: "setSecret" | "guess"; code: string[] },
        playerId,
        playerId === state.players?.[0]?.id,
      )
      return {
        ...state,
        secretCode: scState,
        winner: scState.winner === state.players?.[0]?.id ? "player1" : scState.winner === state.players?.[1]?.id ? "player2" : null,
      }
    case "go-fish":
      return applyGoFishMove(state, move as { rank: string }, playerId)
    case "battleship":
      return applyBattleshipMove(
        state,
        move as { x: number; y: number; horizontal?: boolean; rotate?: boolean },
        playerId,
      )
    case "war":
      return applyWarMove(state, move as { action: string })
    case "rummy":
      return applyRummyMove(state, move as { action: string; from?: string; cardId?: string }, playerId)
    default:
      return state
  }
}

export interface RoomState {
  code: string
  hostId: string
  gameType: string
  status: "waiting" | "playing" | "finished"
  players: { id: string; username: string; isReady: boolean; isHost?: boolean }[]
  chat: { userId: string; username: string; message: string; timestamp: number }[]
  settings: {
    mode: string
    isPublic: boolean
  }
  isAiGame?: boolean
  gameState?: GameState | null
}

export function useSocket(userId: string | undefined) {
  const [isConnected, setIsConnected] = useState(false)
  const [roomState, setRoomState] = useState<RoomState | null>(null)

  // Load room state from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem("timekill_room")
    if (stored) {
      try {
        setRoomState(JSON.parse(stored))
      } catch (e) {
        console.error("Failed to parse stored room state", e)
      }
    }
  }, [])

  // Save room state to local storage whenever it changes
  useEffect(() => {
    if (roomState) {
      localStorage.setItem("timekill_room", JSON.stringify(roomState))
    } else {
      // Only remove if explicitly set to null (leaving room), not initial load
      // But we can't distinguish initial null from explicit null here easily without another ref
      // For now, let's rely on leaveRoom to clear it
    }
  }, [roomState])

  useEffect(() => {
    if (!userId) return
    const timer = setTimeout(() => setIsConnected(true), 500)
    return () => clearTimeout(timer)
  }, [userId])

  const createRoom = useCallback(
    (gameType: string, mode: string, isAiGame: boolean = false, difficulty: 'easy' | 'medium' | 'hard' = 'medium') => {
      const code = generateRoomCode()
      const newRoomState: RoomState = {
        code,
        hostId: userId || "host",
        players: [
          {
            id: userId || "host",
            username: "You",
            isHost: true,
            isReady: true,
          },
        ],
        gameType,
        status: "waiting",
        settings: {
          mode,
          isPublic: true,
        },
        isAiGame,
        chat: [],
        gameState: null,
      }

      // If AI game, add AI player immediately and start game
      if (isAiGame) {
        newRoomState.players.push({
          id: "ai-player",
          username: "AI Opponent",
          isHost: false,
          isReady: true,
        })
        newRoomState.status = "playing"
        newRoomState.gameState = createInitialGameState(gameType, userId || "host", "ai-player", difficulty)
      }

      setRoomState(newRoomState)
      localStorage.setItem("timekill_room", JSON.stringify(newRoomState))
      return code
    },
    [userId],
  )

  const joinRoom = useCallback(
    (code: string) => {
      // In a real app, this would fetch room data from server
      // For now, we only support joining if we're already in the room (local state)
      if (roomState?.code === code) {
        return true
      }
      return false
    },
    [roomState],
  )

  const makeMove = useCallback(
    (move: unknown, asPlayerId?: string) => {
      if (!roomState?.gameState || !userId) return

      const playerId = asPlayerId || userId
      const newGameState = applyMove(roomState.gameState, move, playerId, roomState.gameType)
      
      setRoomState((prev) => {
        if (!prev) return null
        return {
          ...prev,
          gameState: newGameState,
        }
      })
    },
    [roomState, userId],
  )

  const sendChat = useCallback((message: string) => {
    if (!roomState || !userId) return

    const newMessage = {
      userId,
      username: roomState.players.find(p => p.id === userId)?.username || "Unknown",
      message,
      timestamp: Date.now(),
    }

    setRoomState((prev) => {
      if (!prev) return null
      const updated = {
        ...prev,
        chat: [...prev.chat, newMessage],
      }
      localStorage.setItem("timekill_room", JSON.stringify(updated))
      return updated
    })
  }, [roomState, userId])

  const leaveRoom = useCallback(() => {
    setRoomState(null)
    localStorage.removeItem("timekill_room")
  }, [])

  const { recordMatch } = useLocalUser()

  useEffect(() => {
    if (roomState?.gameState?.winner && !roomState.gameState.isDraw) {
      const isWinner = roomState.gameState.winner === userId
      const result = isWinner ? "win" : "loss"
      recordMatch(roomState.gameType, result)
    } else if (roomState?.gameState?.isDraw) {
      recordMatch(roomState.gameType, "draw")
    }
  }, [roomState?.gameState?.winner, roomState?.gameState?.isDraw])

  // AI Watcher
  useEffect(() => {
    if (!roomState?.isAiGame || !roomState.gameState) return

    if (roomState.gameType.startsWith("secret-code") && roomState.gameState.secretCode) {
      const sc = roomState.gameState.secretCode
      const isAiTurn = (sc.phase === "setup" && !sc.player2Secret) || 
                       (sc.phase === "playing" && sc.currentPlayer === "player2")
      
      if (isAiTurn) {
        const timer = setTimeout(() => {
             window.dispatchEvent(new CustomEvent("ai-secret-code-turn"))
        }, 1000)
        return () => clearTimeout(timer)
      }
    }
  }, [roomState])

  useEffect(() => {
    const handleAiMove = (e: Event) => {
      const customEvent = e as CustomEvent
      makeMove(customEvent.detail, "ai-player")
    }

    const handleAiBattleship = () => {
      if (!roomState?.gameState?.battleship) return
      // Simple random AI for battleship
      const size = 10
      let x, y
      // Try 20 times to find a valid move
      for(let i=0; i<20; i++) {
        x = Math.floor(Math.random() * size)
        y = Math.floor(Math.random() * size)
        // Check if already attacked (simplified check)
        const cell = roomState.gameState.battleship.playerBoard[x][y]
        if (cell === null || cell === "ship") break
      }
      if (x !== undefined && y !== undefined) {
        makeMove({ x, y }, "ai-player")
      }
    }

    const handleAiRummy = () => {
       // Simple AI for Rummy: Draw then Discard
       makeMove({ action: "draw", from: "deck" }, "ai-player")
       setTimeout(() => {
         // Discard a random card (simplified)
         // In a real app we would check hand and discard logic
         // For now we just skip the discard to avoid errors
       }, 500)
    }

    const handleAiSecretCode = () => {
      if (!roomState?.gameState?.secretCode) return
      
      const move = aiSecretCodeTurn(roomState.gameState.secretCode, false)
      if (move) {
        makeMove(move, "ai-player")
      }
    }

    const handleAiGoFish = () => {
      // Simple AI: ask for random rank
      const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]
      const rank = ranks[Math.floor(Math.random() * ranks.length)]
      makeMove({ rank }, "ai-player")
    }

    const handleAiWar = () => {
      // War is auto-play usually, but if manual:
      makeMove({ action: "play" }, "ai-player")
    }

    const handleAiChess = () => {
      if (!roomState?.gameState?.chess) return
      const move = aiChessTurn(roomState.gameState.chess)
      if (move) {
        makeMove(move, "ai-player")
      }
    }

    window.addEventListener("ai-move", handleAiMove)
    window.addEventListener("ai-battleship-turn", handleAiBattleship)
    window.addEventListener("ai-rummy-turn", handleAiRummy)
    window.addEventListener("ai-secret-code-turn", handleAiSecretCode)
    window.addEventListener("ai-go-fish-turn", handleAiGoFish)
    window.addEventListener("ai-war-turn", handleAiWar)
    window.addEventListener("ai-chess-turn", handleAiChess)
    
    return () => {
      window.removeEventListener("ai-move", handleAiMove)
      window.removeEventListener("ai-battleship-turn", handleAiBattleship)
      window.removeEventListener("ai-rummy-turn", handleAiRummy)
      window.removeEventListener("ai-secret-code-turn", handleAiSecretCode)
      window.removeEventListener("ai-go-fish-turn", handleAiGoFish)
      window.removeEventListener("ai-war-turn", handleAiWar)
      window.removeEventListener("ai-chess-turn", handleAiChess)
    }
  }, [makeMove, roomState])

  return {
    isConnected,
    roomState,
    createRoom,
    joinRoom,
    makeMove,
    sendChat,
    leaveRoom,
    setRoomState,
  }
}

function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}


// ==================== TIC-TAC-TOE MOVE ====================
function applyTicTacToeMove(state: GameState, move: { x: number; y: number }, playerId: string): GameState {
  const { x, y } = move

  if (x < 0 || x >= 3 || y < 0 || y >= 3) return state
  if (state.board[x][y] !== null) return state
  if (state.currentPlayer !== playerId) return state

  const currentPlayerData = state.players.find((p) => p.id === state.currentPlayer)
  const symbol = currentPlayerData?.symbol || "X"

  const newBoard = state.board.map((row, i) => row.map((cell, j) => (i === x && j === y ? symbol : cell)))

  const result = checkTicTacToeWin(newBoard)
  const winnerPlayer = result.winner ? state.players.find((p) => p.symbol === result.winner)?.id || null : null
  const nextPlayer = state.players.find((p) => p.id !== state.currentPlayer)?.id || state.currentPlayer

  if (!result.winner && !result.isDraw && nextPlayer === "ai-player") {
    setTimeout(() => {
      const aiMove = getAiTicTacToeMove(newBoard, state.difficulty)
      if (aiMove) {
        window.dispatchEvent(new CustomEvent("ai-move", { detail: aiMove }))
      }
    }, 500)
  }

  return {
    ...state,
    board: newBoard,
    currentPlayer: nextPlayer,
    winner: winnerPlayer,
    isDraw: result.isDraw,
    winningCells: result.winningCells,
    lastMove: { x, y },
    moveHistory: [...state.moveHistory, { playerId, move, timestamp: Date.now() }],
  }
}

function getAiTicTacToeMove(board: (string | null)[][], difficulty: 'easy' | 'medium' | 'hard'): { x: number; y: number } | null {
  const emptyCells: { x: number; y: number }[] = []

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i][j] === null) emptyCells.push({ x: i, y: j })
    }
  }

  if (emptyCells.length === 0) return null

  // Easy: Random move
  if (difficulty === 'easy') {
    return emptyCells[Math.floor(Math.random() * emptyCells.length)]
  }

  // Medium: Win if can, Block if must, else Random
  // Hard: Minimax (Unbeatable)

  // Check for winning move (AI is 'O')
  for (const cell of emptyCells) {
    const testBoard = board.map((r, i) => r.map((c, j) => (i === cell.x && j === cell.y ? "O" : c)))
    if (checkTicTacToeWin(testBoard).winner === "O") return cell
  }

  // Check for blocking move (Player is 'X')
  for (const cell of emptyCells) {
    const testBoard = board.map((r, i) => r.map((c, j) => (i === cell.x && j === cell.y ? "X" : c)))
    if (checkTicTacToeWin(testBoard).winner === "X") return cell
  }

  if (difficulty === 'medium') {
     if (board[1][1] === null) return { x: 1, y: 1 }
     return emptyCells[Math.floor(Math.random() * emptyCells.length)]
  }

  // Hard: Minimax
  let bestScore = -Infinity
  let bestMove = null

  for (const cell of emptyCells) {
    const testBoard = board.map((r, i) => r.map((c, j) => (i === cell.x && j === cell.y ? "O" : c)))
    const score = minimaxTicTacToe(testBoard, 0, false)
    if (score > bestScore) {
      bestScore = score
      bestMove = cell
    }
  }

  return bestMove || emptyCells[Math.floor(Math.random() * emptyCells.length)]
}

function minimaxTicTacToe(board: (string | null)[][], depth: number, isMaximizing: boolean): number {
  const result = checkTicTacToeWin(board)
  if (result.winner === "O") return 10 - depth
  if (result.winner === "X") return depth - 10
  if (result.isDraw) return 0

  if (isMaximizing) {
    let bestScore = -Infinity
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === null) {
          const newBoard = board.map((r, rI) => r.map((c, cI) => (rI === i && cI === j ? "O" : c)))
          const score = minimaxTicTacToe(newBoard, depth + 1, false)
          bestScore = Math.max(score, bestScore)
        }
      }
    }
    return bestScore
  } else {
    let bestScore = Infinity
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === null) {
          const newBoard = board.map((r, rI) => r.map((c, cI) => (rI === i && cI === j ? "X" : c)))
          const score = minimaxTicTacToe(newBoard, depth + 1, true)
          bestScore = Math.min(score, bestScore)
        }
      }
    }
    return bestScore
  }
}

// ==================== CONNECT N MOVE ====================
function applyConnectMove(state: GameState, move: { x: number; y: number }, playerId: string, n: number): GameState {
  const { y: column } = move

  if (state.currentPlayer !== playerId) return state

  const currentPlayerData = state.players.find((p) => p.id === state.currentPlayer)
  const symbol = currentPlayerData?.symbol || "X"

  const dropResult = dropPiece(state.board, column, symbol)
  if (!dropResult) return state

  const { newBoard, row } = dropResult

  const result = checkConnectNWin(newBoard, n)
  const winnerPlayer = result.winner ? state.players.find((p) => p.symbol === result.winner)?.id || null : null
  const nextPlayer = state.players.find((p) => p.id !== state.currentPlayer)?.id || state.currentPlayer

  if (!result.winner && !result.isDraw && nextPlayer === "ai-player") {
    setTimeout(() => {
      const aiColumn = getAiConnectMove(newBoard, n, state.difficulty)
      if (aiColumn !== null) {
        window.dispatchEvent(new CustomEvent("ai-move", { detail: { x: 0, y: aiColumn } }))
      }
    }, 500)
  }

  return {
    ...state,
    board: newBoard,
    currentPlayer: nextPlayer,
    winner: winnerPlayer,
    isDraw: result.isDraw,
    winningCells: result.winningCells,
    lastMove: { x: row, y: column },
    moveHistory: [...state.moveHistory, { playerId, move: { x: row, y: column }, timestamp: Date.now() }],
  }
}

function getAiConnectMove(board: (string | null)[][], n: number, difficulty: 'easy' | 'medium' | 'hard'): number | null {
  const cols = board[0].length
  const validColumns: number[] = []

  for (let c = 0; c < cols; c++) {
    if (board[0][c] === null) validColumns.push(c)
  }

  if (validColumns.length === 0) return null

  // Easy: Random
  if (difficulty === 'easy') {
    return validColumns[Math.floor(Math.random() * validColumns.length)]
  }

  // Medium/Hard: Check for immediate wins/blocks
  for (const col of validColumns) {
    const result = dropPiece(board, col, "O") // AI
    if (result && checkConnectNWin(result.newBoard, n).winner === "O") return col
  }

  for (const col of validColumns) {
    const result = dropPiece(board, col, "X") // Player
    if (result && checkConnectNWin(result.newBoard, n).winner === "X") return col
  }

  // Medium: Center bias + Random
  if (difficulty === 'medium') {
    const centerCol = Math.floor(cols / 2)
    if (validColumns.includes(centerCol) && Math.random() > 0.3) return centerCol
    return validColumns[Math.floor(Math.random() * validColumns.length)]
  }

  // Hard: Minimax with depth limit
  let bestScore = -Infinity
  let bestCol = validColumns[0]

  for (const col of validColumns) {
    const result = dropPiece(board, col, "O")
    if (result) {
       const score = minimaxConnect(result.newBoard, 4, false, 0, n)
       if (score > bestScore) {
         bestScore = score
         bestCol = col
       }
    }
  }
  return bestCol
}

function minimaxConnect(board: (string | null)[][], depth: number, isMaximizing: boolean, currentDepth: number, n: number): number {
  const result = checkConnectNWin(board, n)
  if (result.winner === "O") return 1000 - currentDepth
  if (result.winner === "X") return currentDepth - 1000
  if (result.isDraw) return 0
  if (currentDepth >= 4) return 0 // Depth limit

  const cols = board[0].length
  const validColumns: number[] = []
  for (let c = 0; c < cols; c++) {
    if (board[0][c] === null) validColumns.push(c)
  }

  if (isMaximizing) {
    let bestScore = -Infinity
    for (const col of validColumns) {
      const res = dropPiece(board, col, "O")
      if (res) {
        const score = minimaxConnect(res.newBoard, depth, false, currentDepth + 1, n)
        bestScore = Math.max(score, bestScore)
      }
    }
    return bestScore
  } else {
    let bestScore = Infinity
    for (const col of validColumns) {
      const res = dropPiece(board, col, "X")
      if (res) {
        const score = minimaxConnect(res.newBoard, depth, true, currentDepth + 1, n)
        bestScore = Math.min(score, bestScore)
      }
    }
    return bestScore
  }
}


// ==================== GOMOKU MOVE ====================
function applyGomokuMove(state: GameState, move: { x: number; y: number }, playerId: string): GameState {
  const { x, y } = move
  const size = state.board.length

  if (x < 0 || x >= size || y < 0 || y >= size) return state
  if (state.board[x][y] !== null) return state
  if (state.currentPlayer !== playerId) return state

  const currentPlayerData = state.players.find((p) => p.id === state.currentPlayer)
  const symbol = currentPlayerData?.symbol || "X"

  const newBoard = state.board.map((row, i) => row.map((cell, j) => (i === x && j === y ? symbol : cell)))

  const result = checkGomokuWin(newBoard, { x, y })
  const winnerPlayer = result.winner ? state.players.find((p) => p.symbol === result.winner)?.id || null : null
  const nextPlayer = state.players.find((p) => p.id !== state.currentPlayer)?.id || state.currentPlayer

  if (!result.winner && !result.isDraw && nextPlayer === "ai-player") {
    setTimeout(() => {
      const aiMove = getAiGomokuMove(newBoard, { x, y }, state.difficulty)
      if (aiMove) {
        window.dispatchEvent(new CustomEvent("ai-move", { detail: aiMove }))
      }
    }, 500)
  }

  return {
    ...state,
    board: newBoard,
    currentPlayer: nextPlayer,
    winner: winnerPlayer,
    isDraw: result.isDraw,
    winningCells: result.winningCells,
    lastMove: { x, y },
    moveHistory: [...state.moveHistory, { playerId, move, timestamp: Date.now() }],
  }
}

function getAiGomokuMove(
  board: (string | null)[][],
  lastMove: { x: number; y: number },
  difficulty: 'easy' | 'medium' | 'hard'
): { x: number; y: number } | null {
  const size = board.length
  
  // Easy: Random near center or random valid
  if (difficulty === 'easy') {
     const candidates: { x: number; y: number }[] = []
     for(let i=0; i<size; i++) {
        for(let j=0; j<size; j++) {
           if (board[i][j] === null) candidates.push({x: i, y: j})
        }
     }
     if (candidates.length === 0) return null
     return candidates[Math.floor(Math.random() * candidates.length)]
  }

  const candidates: { x: number; y: number; score: number }[] = []

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (board[i][j] !== null) continue

      let hasNeighbor = false
      let score = 0

      // Check neighborhood
      for (let di = -2; di <= 2; di++) {
        for (let dj = -2; dj <= 2; dj++) {
          const ni = i + di
          const nj = j + dj
          if (ni >= 0 && ni < size && nj >= 0 && nj < size && board[ni][nj] !== null) {
            hasNeighbor = true
            if (Math.abs(di) <= 1 && Math.abs(dj) <= 1) score += 2
            else score += 1
          }
        }
      }
      
      if (difficulty === 'hard') {
         // Defensive check: if opponent has 3 or 4 in a row, block it!
         // This is a simplified check. A real Gomoku AI needs full evaluation.
         // Let's simulate placing 'X' (opponent) here and see if they win or get close
         const testBoardX = board.map(r => [...r])
         testBoardX[i][j] = "X"
         const winX = checkGomokuWin(testBoardX, {x: i, y: j})
         if (winX.winner === "X") score += 1000 // Must block win

         // Offensive check: if we can win
         const testBoardO = board.map(r => [...r])
         testBoardO[i][j] = "O"
         const winO = checkGomokuWin(testBoardO, {x: i, y: j})
         if (winO.winner === "O") score += 2000 // Win immediately
      }

      if (hasNeighbor) candidates.push({ x: i, y: j, score })
    }
  }

  if (candidates.length === 0) {
    const center = Math.floor(size / 2)
    const offsets = [0, 1, -1, 2, -2]
    for (const dx of offsets) {
      for (const dy of offsets) {
        if (board[center + dx][center + dy] === null) {
          return { x: center + dx, y: center + dy }
        }
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score)

  const topCandidates = candidates.slice(0, Math.min(5, candidates.length))
  return topCandidates[Math.floor(Math.random() * topCandidates.length)]
}



// ==================== GO FISH MOVE ====================
function applyGoFishMove(state: GameState, move: { rank: string }, playerId: string): GameState {
  if (!state.goFish || state.goFish.gameOver || state.goFish.currentTurn !== "player") return state

  const newGoFishState = askForCard(state.goFish, move.rank, "player")

  return {
    ...state,
    goFish: newGoFishState,
    winner: newGoFishState.gameOver
      ? newGoFishState.playerBooks.length > newGoFishState.opponentBooks.length
        ? playerId
        : newGoFishState.playerBooks.length < newGoFishState.opponentBooks.length
          ? "player1"
          : null
      : null,
    isDraw: newGoFishState.gameOver && newGoFishState.playerBooks.length === newGoFishState.opponentBooks.length,
  }
}

// ==================== BATTLESHIP MOVE ====================
function applyBattleshipMove(
  state: GameState,
  move: { x: number; y: number; horizontal?: boolean; rotate?: boolean },
  playerId: string,
): GameState {
  if (!state.battleship || state.battleship.gameOver) return state

  const { x, y, horizontal, rotate } = move

  // Handle rotation toggle
  if (rotate) {
    return {
      ...state,
      battleship: {
        ...state.battleship,
        placementHorizontal: !state.battleship.placementHorizontal,
        lastAction: `Orientation: ${!state.battleship.placementHorizontal ? "Horizontal" : "Vertical"}. Click to place ${BATTLESHIP_SHIPS[state.battleship.placingShip].name}.`,
      },
    }
  }

  // Placement phase
  if (state.battleship.phase === "placement") {
    const shipDef = BATTLESHIP_SHIPS[state.battleship.placingShip]
    const isHorizontal = horizontal !== undefined ? horizontal : state.battleship.placementHorizontal
    const result = placeShip(state.battleship.playerBoard, x, y, shipDef.size, isHorizontal)

    if (!result) return state

    const newShips = [
      ...state.battleship.playerShips,
      { name: shipDef.name, size: shipDef.size, positions: result.positions, hits: 0 },
    ]

    const nextShipIndex = state.battleship.placingShip + 1
    const allPlaced = nextShipIndex >= BATTLESHIP_SHIPS.length
    const totalPlayerCells = newShips.reduce((sum, s) => sum + s.size, 0)

    return {
      ...state,
      battleship: {
        ...state.battleship,
        playerBoard: result.newBoard,
        playerShips: newShips,
        placingShip: nextShipIndex,
        phase: allPlaced ? "playing" : "placement",
        playerRemainingCells: totalPlayerCells,
        lastAction: allPlaced
          ? "All ships placed! Click on the enemy board to attack."
          : `Place your ${BATTLESHIP_SHIPS[nextShipIndex].name} (${BATTLESHIP_SHIPS[nextShipIndex].size} cells). Press R to rotate.`,
      },
    }
  }

  // Attack phase
  if (state.battleship.currentTurn !== "player") return state

  const newBattleshipState = attackCell(state.battleship, x, y, "player")

  // AI turn if player missed and game not over
  if (newBattleshipState.currentTurn === "opponent" && !newBattleshipState.gameOver) {
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("ai-battleship-turn"))
    }, 800)
  }

  return {
    ...state,
    battleship: newBattleshipState,
    winner:
      newBattleshipState.winner === "player" ? playerId : newBattleshipState.winner === "opponent" ? "player1" : null,
  }
}

// ==================== WAR MOVE ====================
function applyWarMove(state: GameState, move: { action: string }): GameState {
  if (!state.war || state.war.phase === "finished") return state

  if (move.action === "play") {
    const newWarState = playWarRound(state.war)

    return {
      ...state,
      war: newWarState,
      winner:
        newWarState.winner === "player" ? state.players[1].id : newWarState.winner === "opponent" ? "player1" : null,
    }
  }

  return state
}

// ==================== RUMMY MOVE ====================
function applyRummyMove(
  state: GameState,
  move: { action: string; from?: string; cardId?: string },
  playerId: string,
): GameState {
  if (!state.rummy || state.rummy.phase === "finished") return state

  let newRummyState = state.rummy

  switch (move.action) {
    case "draw":
      if (move.from === "deck" || move.from === "discard") {
        newRummyState = drawCard(state.rummy, move.from)
      }
      break
    case "discard":
      if (move.cardId) {
        newRummyState = discardCard(state.rummy, move.cardId)
        // AI turn after player discards
        if (newRummyState.currentTurn === "opponent" && newRummyState.phase === "playing") {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("ai-rummy-turn"))
          }, 1000)
        }
      }
      break
    case "declare":
      newRummyState = declareRummy(state.rummy)
      break
  }

  return {
    ...state,
    rummy: newRummyState,
    winner: newRummyState.winner === "player" ? playerId : newRummyState.winner === "opponent" ? "player1" : null,
    isDraw: newRummyState.phase === "finished" && newRummyState.winner === null,
  }
}
