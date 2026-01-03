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
  type GameState,
  createInitialGameState,
} from "@/lib/game-logic"

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

  // Polling for Room State Updates
  useEffect(() => {
    if (!roomState?.code) return

    const poll = async () => {
      try {
        const res = await fetch(`/api/match/${roomState.code}`)
        if (res.ok) {
          const data = await res.json()
          setRoomState(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(data)) {
               return data
            }
            return prev
          })
        }
      } catch (err) {
        console.error("Polling error:", err)
      }
    }

    const interval = setInterval(poll, 1000)
    return () => clearInterval(interval)
  }, [roomState?.code])

  // Connection Simulation
  useEffect(() => {
    if (!userId) return
    const timer = setTimeout(() => setIsConnected(true), 500)
    return () => clearTimeout(timer)
  }, [userId])

  const createRoom = useCallback(
    async (gameType: string, mode: string, isAiGame: boolean = false, difficulty: 'easy' | 'medium' | 'hard' = 'medium') => {
      try {
        const res = await fetch("/api/match/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameType,
            mode,
            isAiGame,
            difficulty,
            userId
          })
        })
        const data = await res.json()
        if (data.roomState) {
          setRoomState(data.roomState)
          return data.code
        }
      } catch (e) { console.error("Create room failed", e) }
      return null
    },
    [userId]
  )

  const joinRoom = useCallback(
    async (code: string, gameType?: string) => {
      if (!userId) return false
      try {
        if (roomState?.code === code) return true

        const res = await fetch(`/api/match/${code}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "join",
            userId,
            payload: { username: "Guest" } // We could prompt name later
          })
        })
        
        if (res.ok) {
           const data = await res.json()
           setRoomState(data)
           return true
        }
      } catch (e) { console.error("Join room failed", e) }
      return false
    },
    [roomState, userId],
  )

  const makeMove = useCallback(
    async (move: unknown, asPlayerId?: string) => {
      if (!roomState?.gameState || (!userId && !asPlayerId)) return

      const playerId = asPlayerId || userId || "unknown"
      const newGameState = applyMove(roomState.gameState, move, playerId, roomState.gameType)
      
      setRoomState((prev) => {
        if (!prev) return null
        return {
          ...prev,
          gameState: newGameState,
        }
      })

      try {
        await fetch(`/api/match/${roomState.code}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
             action: "move",
             userId: playerId, 
             payload: { gameState: newGameState } 
          })
        })
      } catch(e) { console.error("Move failed", e) }
    },
    [roomState, userId],
  )

  const sendChat = useCallback(async (message: string) => {
    if (!roomState || !userId) return

    const newMessage = {
      userId,
      username: roomState.players.find(p => p.id === userId)?.username || "Unknown",
      message,
      timestamp: Date.now(),
    }

    setRoomState((prev) => {
      if (!prev) return null
      return {
        ...prev,
        chat: [...prev.chat, newMessage],
      }
    })

    try {
        await fetch(`/api/match/${roomState.code}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
             action: "chat",
             userId,
             payload: newMessage
          })
        })
      } catch(e) { console.error("Chat failed", e) }
  }, [roomState, userId])

  const leaveRoom = useCallback(() => {
    setRoomState(null)
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

  const isHost = roomState?.players[0]?.id === userId
  
  useEffect(() => {
    if (!isHost && !roomState?.isAiGame) return 
    
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
  }, [roomState, isHost])

  useEffect(() => {
    if (!isHost && roomState?.isAiGame) return 
    
    const handleAiMove = (e: Event) => {
      const customEvent = e as CustomEvent
      makeMove(customEvent.detail, "ai-player")
    }

    const handleAiBattleship = () => {
      if (!roomState?.gameState?.battleship) return
      const size = 10
      let x, y
      for(let i=0; i<20; i++) {
        x = Math.floor(Math.random() * size)
        y = Math.floor(Math.random() * size)
        const cell = roomState.gameState.battleship.playerBoard[x][y]
        if (cell === null || cell === "ship") break
      }
      if (x !== undefined && y !== undefined) {
        makeMove({ x, y }, "ai-player")
      }
    }

    const handleAiRummy = () => {
       makeMove({ action: "draw", from: "deck" }, "ai-player")
       setTimeout(() => {
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
      const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]
      const rank = ranks[Math.floor(Math.random() * ranks.length)]
      makeMove({ rank }, "ai-player")
    }

    const handleAiWar = () => {
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
  }, [makeMove, roomState, isHost])

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

function applyMove(state: GameState, move: unknown, playerId: string, gameType: string): GameState {
  switch (gameType) {
    case "tic-tac-toe":
      return applyTicTacToeMove(state, move as { x: number; y: number }, playerId)
    case "connect-4":
      return applyConnectMove(state, move as { x: number; y: number }, playerId, 4)
    case "chess":
      const chessState = applyChessMove(state.chess!, move as { from: { x: number; y: number }, to: { x: number; y: number } })
      const winner = chessState.winner === "player1" ? state.players[0].id : chessState.winner === "player2" ? state.players[1].id : null
      
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

  if (difficulty === 'easy') {
    return emptyCells[Math.floor(Math.random() * emptyCells.length)]
  }

  for (const cell of emptyCells) {
    const testBoard = board.map((r, i) => r.map((c, j) => (i === cell.x && j === cell.y ? "O" : c)))
    if (checkTicTacToeWin(testBoard).winner === "O") return cell
  }

  for (const cell of emptyCells) {
    const testBoard = board.map((r, i) => r.map((c, j) => (i === cell.x && j === cell.y ? "X" : c)))
    if (checkTicTacToeWin(testBoard).winner === "X") return cell
  }

  if (difficulty === 'medium') {
     if (board[1][1] === null) return { x: 1, y: 1 }
     return emptyCells[Math.floor(Math.random() * emptyCells.length)]
  }

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

  if (difficulty === 'easy') {
    return validColumns[Math.floor(Math.random() * validColumns.length)]
  }

  for (const col of validColumns) {
    const result = dropPiece(board, col, "O") 
    if (result && checkConnectNWin(result.newBoard, n).winner === "O") return col
  }

  for (const col of validColumns) {
    const result = dropPiece(board, col, "X") 
    if (result && checkConnectNWin(result.newBoard, n).winner === "X") return col
  }

  if (difficulty === 'medium') {
    const centerCol = Math.floor(cols / 2)
    if (validColumns.includes(centerCol) && Math.random() > 0.3) return centerCol
    return validColumns[Math.floor(Math.random() * validColumns.length)]
  }

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
  if (currentDepth >= 4) return 0 

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
         const testBoardX = board.map(r => [...r])
         testBoardX[i][j] = "X"
         const winX = checkGomokuWin(testBoardX, {x: i, y: j})
         if (winX.winner === "X") score += 1000 

         const testBoardO = board.map(r => [...r])
         testBoardO[i][j] = "O"
         const winO = checkGomokuWin(testBoardO, {x: i, y: j})
         if (winO.winner === "O") score += 2000 
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

  if (state.battleship.currentTurn !== "player") return state

  const newBattleshipState = attackCell(state.battleship, x, y, "player")

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
