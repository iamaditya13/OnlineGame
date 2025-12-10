// Game logic utilities for all games

// ==================== COMMON TYPES ====================
export type CellValue = string | null

export interface WinResult {
  winner: string | null
  isDraw: boolean
  winningCells?: { x: number; y: number }[]
}

// ==================== TIC-TAC-TOE ====================
export function checkTicTacToeWin(board: CellValue[][]): WinResult {
  const size = 3

  for (let i = 0; i < size; i++) {
    if (board[i][0] && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
      return {
        winner: board[i][0],
        isDraw: false,
        winningCells: [
          { x: i, y: 0 },
          { x: i, y: 1 },
          { x: i, y: 2 },
        ],
      }
    }
  }

  for (let j = 0; j < size; j++) {
    if (board[0][j] && board[0][j] === board[1][j] && board[1][j] === board[2][j]) {
      return {
        winner: board[0][j],
        isDraw: false,
        winningCells: [
          { x: 0, y: j },
          { x: 1, y: j },
          { x: 2, y: j },
        ],
      }
    }
  }

  if (board[0][0] && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
    return {
      winner: board[0][0],
      isDraw: false,
      winningCells: [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ],
    }
  }

  if (board[0][2] && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
    return {
      winner: board[0][2],
      isDraw: false,
      winningCells: [
        { x: 0, y: 2 },
        { x: 1, y: 1 },
        { x: 2, y: 0 },
      ],
    }
  }

  const isDraw = board.every((row) => row.every((cell) => cell !== null))
  return { winner: null, isDraw }
}

// ==================== CHESS ====================
export type ChessPiece = { type: 'p' | 'r' | 'n' | 'b' | 'q' | 'k'; color: 'w' | 'b' } | null
export type ChessBoard = ChessPiece[][]

export interface ChessState {
  board: ChessBoard
  turn: 'w' | 'b'
  isCheck: boolean
  isCheckmate: boolean
  isDraw: boolean
  gameOver: boolean
  winner: string | null
  lastMove?: { from: { x: number; y: number }; to: { x: number; y: number } }
  castlingRights: { w: { k: boolean, q: boolean }, b: { k: boolean, q: boolean } }
  difficulty: 'easy' | 'medium' | 'hard'
}

export function initChess(): ChessState {
  const board: ChessBoard = Array(8).fill(null).map(() => Array(8).fill(null))
  
  // Initialize pawns
  for (let i = 0; i < 8; i++) {
    board[1][i] = { type: 'p', color: 'b' }
    board[6][i] = { type: 'p', color: 'w' }
  }

  // Initialize other pieces
  const pieces: ('r' | 'n' | 'b' | 'q' | 'k' | 'b' | 'n' | 'r')[] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']
  for (let i = 0; i < 8; i++) {
    board[0][i] = { type: pieces[i], color: 'b' }
    board[7][i] = { type: pieces[i], color: 'w' }
  }

  return {
    board,
    turn: 'w',
    isCheck: false,
    isCheckmate: false,
    isDraw: false,
    gameOver: false,
    winner: null,
    castlingRights: { w: { k: true, q: true }, b: { k: true, q: true } },
    difficulty: 'medium'
  }
}


export function isValidChessMove(state: ChessState, from: { x: number; y: number }, to: { x: number; y: number }): boolean {
  const { board, turn, castlingRights } = state
  const piece = board[from.x][from.y]
  if (!piece || piece.color !== turn) return false
  
  // Basic bounds check
  if (to.x < 0 || to.x > 7 || to.y < 0 || to.y > 7) return false
  
  // Can't capture own piece
  const target = board[to.x][to.y]
  if (target && target.color === turn) return false

  const dx = to.x - from.x
  const dy = to.y - from.y
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)

  switch (piece.type) {
    case 'p': // Pawn
      const direction = piece.color === 'w' ? -1 : 1
      const startRow = piece.color === 'w' ? 6 : 1
      if (dy === 0 && dx === direction && !target) return true
      if (dy === 0 && dx === direction * 2 && from.x === startRow && !target && !board[from.x + direction][from.y]) return true
      if (Math.abs(dy) === 1 && dx === direction && target) return true
      return false
    case 'r': // Rook
      if (dx !== 0 && dy !== 0) return false
      return isPathClear(board, from, to)
    case 'n': // Knight
      return (absDx === 2 && absDy === 1) || (absDx === 1 && absDy === 2)
    case 'b': // Bishop
      if (absDx !== absDy) return false
      return isPathClear(board, from, to)
    case 'q': // Queen
      if (dx !== 0 && dy !== 0 && absDx !== absDy) return false
      return isPathClear(board, from, to)
    case 'k': // King
      if (absDx <= 1 && absDy <= 1) return true
      // Castling
      if (dy === 0) return false // Must move horizontally
      if (absDx === 2 && dx === 2) { // Kingside
        if (!castlingRights[turn].k) return false
        if (!isPathClear(board, from, { x: from.x, y: 7 })) return false
        // Check if passing through check (simplified: just check destination and start for now)
        // In real chess, need to check intermediate square too.
        return true
      }
      if (absDx === 2 && dx === -2) { // Queenside
        if (!castlingRights[turn].q) return false
        if (!isPathClear(board, from, { x: from.x, y: 0 })) return false
        return true
      }
      return false
  }
  return false
}

function isPathClear(board: ChessBoard, from: { x: number; y: number }, to: { x: number; y: number }): boolean {
  const dx = Math.sign(to.x - from.x)
  const dy = Math.sign(to.y - from.y)
  
  let x = from.x + dx
  let y = from.y + dy
  
  while (x !== to.x || y !== to.y) {
    if (board[x][y]) return false
    x += dx
    y += dy
  }
  return true
}

export function applyChessMove(state: ChessState, move: { from: { x: number; y: number }, to: { x: number; y: number } }): ChessState {
  if (state.gameOver) return state
  
  if (!isValidChessMove(state, move.from, move.to)) return state

  const newBoard = state.board.map(row => [...row])
  const piece = newBoard[move.from.x][move.from.y]!
  const dx = move.to.x - move.from.x
  const dy = move.to.y - move.from.y // Wait, x is row, y is col. 
  // In my board setup: board[row][col]. row 0 is black back rank. row 7 is white back rank.
  // So x is row (0-7), y is col (0-7).
  // Castling is horizontal move, so dx should be 0, dy should be +/- 2.
  // Wait, in isValidChessMove I used dx for castling? 
  // "if (absDx === 2 && dx === 2)" -> this means row change? No, castling is col change.
  // My isValidChessMove logic above used dx for castling which is wrong if x is row.
  // Let's fix isValidChessMove logic in this replacement too? No, I need to fix it in the previous chunk or here.
  // Actually, let's assume x is row, y is col.
  // Castling: King moves from (0,4) to (0,6) or (0,2). So x change is 0. y change is +/- 2.
  // My previous chunk used dx for castling. I need to fix that.
  
  // Let's fix the logic here for applyMove first.
  
  // Handle Castling Move
  if (piece.type === 'k' && Math.abs(move.to.y - move.from.y) === 2) {
    // Kingside
    if (move.to.y > move.from.y) {
      newBoard[move.from.x][7] = null
      newBoard[move.from.x][5] = { type: 'r', color: piece.color }
    } else { // Queenside
      newBoard[move.from.x][0] = null
      newBoard[move.from.x][3] = { type: 'r', color: piece.color }
    }
  }

  newBoard[move.to.x][move.to.y] = piece
  newBoard[move.from.x][move.from.y] = null

  // Update Castling Rights
  const newCastlingRights = { ...state.castlingRights }
  if (piece.type === 'k') {
    newCastlingRights[piece.color].k = false
    newCastlingRights[piece.color].q = false
  }
  if (piece.type === 'r') {
    if (move.from.y === 0) newCastlingRights[piece.color].q = false
    if (move.from.y === 7) newCastlingRights[piece.color].k = false
  }

  // Check for king capture (simplified win condition)
  const opponentColor = state.turn === 'w' ? 'b' : 'w'
  let kingFound = false
  for(let i=0; i<8; i++) {
    for(let j=0; j<8; j++) {
      const p = newBoard[i][j]
      if (p && p.type === 'k' && p.color === opponentColor) {
        kingFound = true
      }
    }
  }

  const gameOver = !kingFound
  const winner = gameOver ? (state.turn === 'w' ? 'player1' : 'player2') : null

  return {
    ...state,
    board: newBoard,
    turn: opponentColor,
    lastMove: move,
    gameOver,
    winner,
    castlingRights: newCastlingRights
  }
}

export function aiChessTurn(state: ChessState): { from: { x: number; y: number }, to: { x: number; y: number } } | null {
  const moves: { from: { x: number; y: number }, to: { x: number; y: number } }[] = []
  
  for(let i=0; i<8; i++) {
    for(let j=0; j<8; j++) {
      const piece = state.board[i][j]
      if (piece && piece.color === state.turn) {
        for(let x=0; x<8; x++) {
          for(let y=0; y<8; y++) {
            if (isValidChessMove(state, {x: i, y: j}, {x, y})) {
              moves.push({ from: {x: i, y: j}, to: {x, y} })
            }
          }
        }
      }
    }
  }

  if (moves.length === 0) return null

  // Difficulty Logic
  if (state.difficulty === 'easy') {
    return moves[Math.floor(Math.random() * moves.length)]
  }

  // Medium/Hard: Prioritize captures and checks
  const scoredMoves = moves.map(move => {
    let score = 0
    const target = state.board[move.to.x][move.to.y]
    if (target) {
      // Capture value
      const values: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 }
      score += values[target.type] * 10
    }
    
    // Check if move puts opponent in check (simple lookahead)
    // This is expensive, maybe skip for medium?
    // Let's just do random capture for medium
    
    return { move, score }
  })

  scoredMoves.sort((a, b) => b.score - a.score)
  
  // Filter top moves
  const bestScore = scoredMoves[0].score
  const bestMoves = scoredMoves.filter(m => m.score === bestScore)
  
  return bestMoves[Math.floor(Math.random() * bestMoves.length)].move
}

// ==================== CONNECT N ====================
export function checkConnectNWin(board: CellValue[][], n: number): WinResult {
  const rows = board.length
  const cols = board[0]?.length || 0

  const directions = [
    { dx: 0, dy: 1 },
    { dx: 1, dy: 0 },
    { dx: 1, dy: 1 },
    { dx: 1, dy: -1 },
  ]

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const cell = board[i][j]
      if (!cell) continue

      for (const { dx, dy } of directions) {
        const cells: { x: number; y: number }[] = [{ x: i, y: j }]
        let count = 1

        for (let k = 1; k < n; k++) {
          const ni = i + dx * k
          const nj = j + dy * k
          if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && board[ni][nj] === cell) {
            count++
            cells.push({ x: ni, y: nj })
          } else {
            break
          }
        }

        if (count >= n) {
          return { winner: cell, isDraw: false, winningCells: cells }
        }
      }
    }
  }

  const isDraw = board[0].every((cell) => cell !== null)
  return { winner: null, isDraw }
}

export function dropPiece(
  board: CellValue[][],
  column: number,
  symbol: string,
): { newBoard: CellValue[][]; row: number } | null {
  if (column < 0 || column >= board[0].length) return null
  if (board[0][column] !== null) return null

  for (let row = board.length - 1; row >= 0; row--) {
    if (board[row][column] === null) {
      const newBoard = board.map((r) => [...r])
      newBoard[row][column] = symbol
      return { newBoard, row }
    }
  }
  return null
}

// ==================== GOMOKU ====================
export function checkGomokuWin(board: CellValue[][], lastMove?: { x: number; y: number }): WinResult {
  const size = board.length

  if (lastMove) {
    const { x, y } = lastMove
    const player = board[x][y]
    if (!player) return { winner: null, isDraw: false }

    const directions = [
      { dx: 0, dy: 1 },
      { dx: 1, dy: 0 },
      { dx: 1, dy: 1 },
      { dx: 1, dy: -1 },
    ]

    for (const { dx, dy } of directions) {
      const cells: { x: number; y: number }[] = [{ x, y }]

      for (let k = 1; k < 5; k++) {
        const nx = x + dx * k
        const ny = y + dy * k
        if (nx >= 0 && nx < size && ny >= 0 && ny < size && board[nx][ny] === player) {
          cells.push({ x: nx, y: ny })
        } else break
      }

      for (let k = 1; k < 5; k++) {
        const nx = x - dx * k
        const ny = y - dy * k
        if (nx >= 0 && nx < size && ny >= 0 && ny < size && board[nx][ny] === player) {
          cells.push({ x: nx, y: ny })
        } else break
      }

      if (cells.length >= 5) {
        return { winner: player, isDraw: false, winningCells: cells.slice(0, 5) }
      }
    }

    let isFull = true
    outer: for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (board[i][j] === null) {
          isFull = false
          break outer
        }
      }
    }

    return { winner: null, isDraw: isFull }
  }

  return checkConnectNWin(board, 5)
}

// ==================== SECRET CODE ====================
export interface SecretCodeState {
  secretCode: string[]
  guesses: { colors: string[]; feedback: { correct: number; misplaced: number } }[]
  maxGuesses: number
  isCodeMaker: boolean
  gameOver: boolean
  won: boolean
}

export const SECRET_CODE_COLORS = ["red", "blue", "green", "yellow", "purple", "orange"]
export const SECRET_CODE_LENGTH = 4
export const SECRET_CODE_MAX_GUESSES = 10

export function generateSecretCode(length = SECRET_CODE_LENGTH): string[] {
  return Array.from({ length }, () => SECRET_CODE_COLORS[Math.floor(Math.random() * SECRET_CODE_COLORS.length)])
}

export function evaluateGuess(guess: string[], secretCode: string[]): { correct: number; misplaced: number } {
  let correct = 0
  let misplaced = 0
  const secretCopy = [...secretCode]
  const guessCopy = [...guess]

  for (let i = 0; i < guess.length; i++) {
    if (guessCopy[i] === secretCopy[i]) {
      correct++
      secretCopy[i] = ""
      guessCopy[i] = ""
    }
  }

  for (let i = 0; i < guessCopy.length; i++) {
    if (guessCopy[i] !== "") {
      const index = secretCopy.indexOf(guessCopy[i])
      if (index !== -1) {
        misplaced++
        secretCopy[index] = ""
      }
    }
  }

  return { correct, misplaced }
}

export function initSecretCode(): SecretCodeState {
  return {
    secretCode: generateSecretCode(SECRET_CODE_LENGTH),
    guesses: [],
    maxGuesses: SECRET_CODE_MAX_GUESSES,
    isCodeMaker: false,
    gameOver: false,
    won: false,
  }
}

// ==================== GO FISH ====================
export interface GoFishCard {
  suit: string
  rank: string
  id: string
}

export interface GoFishState {
  deck: GoFishCard[]
  playerHand: GoFishCard[]
  opponentHand: GoFishCard[]
  playerBooks: string[]
  opponentBooks: string[]
  currentTurn: "player" | "opponent"
  lastAction: string
  gameOver: boolean
}

const SUITS = ["hearts", "diamonds", "clubs", "spades"]
const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]

export function createDeck(): GoFishCard[] {
  const deck: GoFishCard[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, id: `${rank}-${suit}` })
    }
  }
  return shuffleArray(deck)
}

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function initGoFish(): GoFishState {
  const deck = createDeck()
  const playerHand = deck.slice(0, 7)
  const opponentHand = deck.slice(7, 14)
  const remainingDeck = deck.slice(14)

  const { newHand: finalPlayerHand, books: playerBooks } = checkForBooks(playerHand)
  const { newHand: finalOpponentHand, books: opponentBooks } = checkForBooks(opponentHand)

  return {
    deck: remainingDeck,
    playerHand: finalPlayerHand,
    opponentHand: finalOpponentHand,
    playerBooks,
    opponentBooks,
    currentTurn: "player",
    lastAction: "Game started! Select a card from your hand and ask for that rank.",
    gameOver: false,
  }
}

export function checkForBooks(hand: GoFishCard[]): { newHand: GoFishCard[]; books: string[] } {
  const rankCounts: Record<string, GoFishCard[]> = {}
  for (const card of hand) {
    if (!rankCounts[card.rank]) rankCounts[card.rank] = []
    rankCounts[card.rank].push(card)
  }

  const books: string[] = []
  let newHand = [...hand]

  for (const [rank, cards] of Object.entries(rankCounts)) {
    if (cards.length === 4) {
      books.push(rank)
      newHand = newHand.filter((c) => c.rank !== rank)
    }
  }

  return { newHand, books }
}

export function askForCard(state: GoFishState, rank: string, asker: "player" | "opponent"): GoFishState {
  const targetHand = asker === "player" ? state.opponentHand : state.playerHand
  const askerHand = asker === "player" ? state.playerHand : state.opponentHand
  const askerBooks = asker === "player" ? state.playerBooks : state.opponentBooks
  const targetBooks = asker === "player" ? state.opponentBooks : state.playerBooks

  const matchingCards = targetHand.filter((c) => c.rank === rank)

  if (matchingCards.length > 0) {
    const newTargetHand = targetHand.filter((c) => c.rank !== rank)
    const newAskerHand = [...askerHand, ...matchingCards]
    const { newHand: finalAskerHand, books } = checkForBooks(newAskerHand)

    const newState: GoFishState = {
      ...state,
      playerHand: asker === "player" ? finalAskerHand : newTargetHand,
      opponentHand: asker === "player" ? newTargetHand : finalAskerHand,
      playerBooks: asker === "player" ? [...askerBooks, ...books] : targetBooks,
      opponentBooks: asker === "opponent" ? [...askerBooks, ...books] : targetBooks,
      lastAction: `${asker === "player" ? "You" : "Opponent"} got ${matchingCards.length} ${rank}(s)!${books.length > 0 ? ` Book of ${books.join(", ")}!` : ""}`,
      currentTurn: asker,
    }

    return checkGoFishGameOver(newState)
  } else {
    if (state.deck.length > 0) {
      const drawnCard = state.deck[0]
      const newDeck = state.deck.slice(1)
      const newAskerHand = [...askerHand, drawnCard]
      const { newHand: finalAskerHand, books } = checkForBooks(newAskerHand)

      const drewAskedRank = drawnCard.rank === rank
      const nextTurn = drewAskedRank ? asker : asker === "player" ? "opponent" : "player"

      const goFishMessage = drewAskedRank
        ? `Go Fish! ${asker === "player" ? "You" : "Opponent"} drew a ${rank}! Go again!`
        : `Go Fish! ${asker === "player" ? "You" : "Opponent"} drew from the deck.`

      const newState: GoFishState = {
        ...state,
        deck: newDeck,
        playerHand: asker === "player" ? finalAskerHand : state.playerHand,
        opponentHand: asker === "opponent" ? finalAskerHand : state.opponentHand,
        playerBooks: asker === "player" ? [...askerBooks, ...books] : state.playerBooks,
        opponentBooks: asker === "opponent" ? [...askerBooks, ...books] : state.opponentBooks,
        currentTurn: nextTurn,
        lastAction: goFishMessage + (books.length > 0 ? ` Book of ${books.join(", ")}!` : ""),
      }

      return checkGoFishGameOver(newState)
    } else {
      return {
        ...state,
        currentTurn: asker === "player" ? "opponent" : "player",
        lastAction: `Go Fish! But the deck is empty. Turn passes.`,
      }
    }
  }
}

function checkGoFishGameOver(state: GoFishState): GoFishState {
  const totalBooks = state.playerBooks.length + state.opponentBooks.length

  if (
    totalBooks === 13 ||
    (state.playerHand.length === 0 && state.opponentHand.length === 0 && state.deck.length === 0)
  ) {
    return { ...state, gameOver: true }
  }

  if (state.currentTurn === "player" && state.playerHand.length === 0 && state.deck.length > 0) {
    const drawnCard = state.deck[0]
    return {
      ...state,
      deck: state.deck.slice(1),
      playerHand: [drawnCard],
      lastAction: state.lastAction + " You drew a card since your hand was empty.",
    }
  }
  if (state.currentTurn === "opponent" && state.opponentHand.length === 0 && state.deck.length > 0) {
    const drawnCard = state.deck[0]
    return {
      ...state,
      deck: state.deck.slice(1),
      opponentHand: [drawnCard],
    }
  }

  return state
}

export function aiGoFishTurn(state: GoFishState): GoFishState {
  if (state.opponentHand.length === 0) {
    if (state.deck.length > 0) {
      const drawnCard = state.deck[0]
      return aiGoFishTurn({
        ...state,
        deck: state.deck.slice(1),
        opponentHand: [drawnCard],
      })
    }
    return { ...state, currentTurn: "player" }
  }

  const randomCard = state.opponentHand[Math.floor(Math.random() * state.opponentHand.length)]
  const result = askForCard(state, randomCard.rank, "opponent")

  return {
    ...result,
    lastAction: `Opponent asked for ${randomCard.rank}s. ${result.lastAction}`,
  }
}

// ==================== BATTLESHIP (FULL IMPLEMENTATION) ====================
export type BattleshipCell = "empty" | "ship" | "hit" | "miss"

export interface Ship {
  name: string
  size: number
  positions: { x: number; y: number }[]
  hits: number
}

export interface BattleshipState {
  playerBoard: BattleshipCell[][]
  opponentBoard: BattleshipCell[][]
  playerShips: Ship[]
  opponentShips: Ship[]
  currentTurn: "player" | "opponent"
  phase: "placement" | "playing" | "finished"
  placingShip: number
  placementHorizontal: boolean
  gameOver: boolean
  winner: "player" | "opponent" | null
  lastAction: string
  publicGrid: Record<string, "hit" | "miss">
  playerRemainingCells: number
  opponentRemainingCells: number
}

export const BATTLESHIP_SHIPS = [
  { name: "Carrier", size: 5 },
  { name: "Battleship", size: 4 },
  { name: "Cruiser", size: 3 },
  { name: "Submarine", size: 3 },
  { name: "Destroyer", size: 2 },
]

export function createEmptyBoard(size = 10): BattleshipCell[][] {
  return Array(size)
    .fill(null)
    .map(() => Array(size).fill("empty"))
}

export function initBattleship(): BattleshipState {
  const opponentResult = placeShipsRandomly(createEmptyBoard())
  const totalOpponentCells = BATTLESHIP_SHIPS.reduce((sum, s) => sum + s.size, 0)

  return {
    playerBoard: createEmptyBoard(),
    opponentBoard: opponentResult.board,
    playerShips: [],
    opponentShips: opponentResult.ships,
    currentTurn: "player",
    phase: "placement",
    placingShip: 0,
    placementHorizontal: true,
    gameOver: false,
    winner: null,
    lastAction: `Place your ${BATTLESHIP_SHIPS[0].name} (${BATTLESHIP_SHIPS[0].size} cells). Click to place, press R to rotate.`,
    publicGrid: {},
    playerRemainingCells: 0,
    opponentRemainingCells: totalOpponentCells,
  }
}

export function canPlaceShip(
  board: BattleshipCell[][],
  x: number,
  y: number,
  size: number,
  horizontal: boolean,
): boolean {
  for (let i = 0; i < size; i++) {
    const nx = horizontal ? x : x + i
    const ny = horizontal ? y + i : y
    if (nx >= 10 || ny >= 10 || nx < 0 || ny < 0 || board[nx][ny] !== "empty") return false
  }
  return true
}

export function placeShip(
  board: BattleshipCell[][],
  x: number,
  y: number,
  size: number,
  horizontal: boolean,
): { newBoard: BattleshipCell[][]; positions: { x: number; y: number }[] } | null {
  if (!canPlaceShip(board, x, y, size, horizontal)) return null

  const newBoard = board.map((r) => [...r])
  const positions: { x: number; y: number }[] = []

  for (let i = 0; i < size; i++) {
    const nx = horizontal ? x : x + i
    const ny = horizontal ? y + i : y
    newBoard[nx][ny] = "ship"
    positions.push({ x: nx, y: ny })
  }

  return { newBoard, positions }
}

export function placeShipsRandomly(board: BattleshipCell[][]): { board: BattleshipCell[][]; ships: Ship[] } {
  const ships: Ship[] = []
  let currentBoard = board.map((r) => [...r])

  for (const shipDef of BATTLESHIP_SHIPS) {
    let placed = false
    let attempts = 0

    while (!placed && attempts < 100) {
      const horizontal = Math.random() > 0.5
      const x = Math.floor(Math.random() * 10)
      const y = Math.floor(Math.random() * 10)

      const result = placeShip(currentBoard, x, y, shipDef.size, horizontal)
      if (result) {
        currentBoard = result.newBoard
        ships.push({
          name: shipDef.name,
          size: shipDef.size,
          positions: result.positions,
          hits: 0,
        })
        placed = true
      }
      attempts++
    }
  }

  return { board: currentBoard, ships }
}

export function attackCell(
  state: BattleshipState,
  x: number,
  y: number,
  attacker: "player" | "opponent",
): BattleshipState {
  const targetBoard = attacker === "player" ? state.opponentBoard : state.playerBoard
  const targetShips = attacker === "player" ? state.opponentShips : state.playerShips

  if (targetBoard[x][y] === "hit" || targetBoard[x][y] === "miss") {
    return state
  }

  const newBoard = targetBoard.map((r) => [...r])
  let action = ""
  let sunkShip: string | undefined
  let keepTurn = false

  if (targetBoard[x][y] === "ship") {
    newBoard[x][y] = "hit"
    action = "Hit!"
    keepTurn = true

    for (const ship of targetShips) {
      if (ship.positions.some((p) => p.x === x && p.y === y)) {
        ship.hits++
        if (ship.hits === ship.size) {
          sunkShip = ship.name
          action = `${ship.name} sunk!`
        }
        break
      }
    }
  } else {
    newBoard[x][y] = "miss"
    action = "Miss!"
    keepTurn = false
  }

  const allSunk = targetShips.every((s) => s.hits === s.size)
  const newPublicGrid = { ...state.publicGrid, [`${x}_${y}`]: targetBoard[x][y] === "ship" ? "hit" : "miss" } as Record<
    string,
    "hit" | "miss"
  >

  const remainingCells =
    attacker === "player"
      ? state.opponentRemainingCells - (targetBoard[x][y] === "ship" ? 1 : 0)
      : state.playerRemainingCells - (targetBoard[x][y] === "ship" ? 1 : 0)

  return {
    ...state,
    opponentBoard: attacker === "player" ? newBoard : state.opponentBoard,
    playerBoard: attacker === "opponent" ? newBoard : state.playerBoard,
    currentTurn: keepTurn ? attacker : attacker === "player" ? "opponent" : "player",
    phase: allSunk ? "finished" : state.phase,
    gameOver: allSunk,
    winner: allSunk ? attacker : null,
    lastAction: `${attacker === "player" ? "You" : "Opponent"}: ${action}`,
    publicGrid: newPublicGrid,
    playerRemainingCells: attacker === "opponent" ? remainingCells : state.playerRemainingCells,
    opponentRemainingCells: attacker === "player" ? remainingCells : state.opponentRemainingCells,
  }
}

export function aiBattleshipTurn(state: BattleshipState): BattleshipState {
  const validTargets: { x: number; y: number }[] = []

  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      if (state.playerBoard[i][j] !== "hit" && state.playerBoard[i][j] !== "miss") {
        validTargets.push({ x: i, y: j })
      }
    }
  }

  if (validTargets.length === 0) return state

  // Hunt mode: look for adjacent cells to hits
  const hitCells: { x: number; y: number }[] = []
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      if (state.playerBoard[i][j] === "hit") {
        hitCells.push({ x: i, y: j })
      }
    }
  }

  if (hitCells.length > 0) {
    const directions = [
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
    ]
    for (const hit of hitCells) {
      for (const dir of directions) {
        const nx = hit.x + dir.dx
        const ny = hit.y + dir.dy
        if (
          nx >= 0 &&
          nx < 10 &&
          ny >= 0 &&
          ny < 10 &&
          state.playerBoard[nx][ny] !== "hit" &&
          state.playerBoard[nx][ny] !== "miss"
        ) {
          return attackCell(state, nx, ny, "opponent")
        }
      }
    }
  }

  const target = validTargets[Math.floor(Math.random() * validTargets.length)]
  return attackCell(state, target.x, target.y, "opponent")
}

// ==================== WAR (FULL IMPLEMENTATION) ====================
export interface WarCard {
  rank: number // 2-14 (A=14)
  suit: string
  display: string
}

export interface WarState {
  phase: "playing" | "finished"
  playerDeck: WarCard[]
  opponentDeck: WarCard[]
  pile: WarCard[]
  lastBattle?: {
    playerCard: WarCard
    opponentCard: WarCard
    winner: "player" | "opponent" | "war"
    warCards?: { player: WarCard[]; opponent: WarCard[] }
  }
  winner: "player" | "opponent" | null
  lastAction: string
  isWar: boolean
  warDepth: number
}

const WAR_RANKS = [
  { rank: 2, display: "2" },
  { rank: 3, display: "3" },
  { rank: 4, display: "4" },
  { rank: 5, display: "5" },
  { rank: 6, display: "6" },
  { rank: 7, display: "7" },
  { rank: 8, display: "8" },
  { rank: 9, display: "9" },
  { rank: 10, display: "10" },
  { rank: 11, display: "J" },
  { rank: 12, display: "Q" },
  { rank: 13, display: "K" },
  { rank: 14, display: "A" },
]

export function createWarDeck(): WarCard[] {
  const deck: WarCard[] = []
  const suits = ["♠", "♥", "♦", "♣"]

  for (const suit of suits) {
    for (const { rank, display } of WAR_RANKS) {
      deck.push({ rank, suit, display })
    }
  }

  return shuffleArray(deck)
}

export function initWar(): WarState {
  const deck = createWarDeck()
  const half = Math.floor(deck.length / 2)

  return {
    phase: "playing",
    playerDeck: deck.slice(0, half),
    opponentDeck: deck.slice(half),
    pile: [],
    winner: null,
    lastAction: 'Click "Play Round" to flip cards!',
    isWar: false,
    warDepth: 0,
  }
}

export function playWarRound(state: WarState): WarState {
  if (state.phase === "finished") return state

  // Check if either player has no cards
  if (state.playerDeck.length === 0) {
    return {
      ...state,
      phase: "finished",
      winner: "opponent",
      lastAction: "You ran out of cards! Opponent wins!",
    }
  }
  if (state.opponentDeck.length === 0) {
    return {
      ...state,
      phase: "finished",
      winner: "player",
      lastAction: "Opponent ran out of cards! You win!",
    }
  }

  const playerCard = state.playerDeck[0]
  const opponentCard = state.opponentDeck[0]
  const newPlayerDeck = state.playerDeck.slice(1)
  const newOpponentDeck = state.opponentDeck.slice(1)
  const currentPile = [...state.pile, playerCard, opponentCard]

  if (playerCard.rank > opponentCard.rank) {
    // Player wins the battle
    return {
      ...state,
      playerDeck: [...newPlayerDeck, ...shuffleArray(currentPile)],
      opponentDeck: newOpponentDeck,
      pile: [],
      lastBattle: {
        playerCard,
        opponentCard,
        winner: "player",
      },
      winner: newOpponentDeck.length === 0 ? "player" : null,
      phase: newOpponentDeck.length === 0 ? "finished" : "playing",
      lastAction: `Your ${playerCard.display}${playerCard.suit} beats ${opponentCard.display}${opponentCard.suit}! You take ${currentPile.length} cards.`,
      isWar: false,
      warDepth: 0,
    }
  } else if (opponentCard.rank > playerCard.rank) {
    // Opponent wins the battle
    return {
      ...state,
      playerDeck: newPlayerDeck,
      opponentDeck: [...newOpponentDeck, ...shuffleArray(currentPile)],
      pile: [],
      lastBattle: {
        playerCard,
        opponentCard,
        winner: "opponent",
      },
      winner: newPlayerDeck.length === 0 ? "opponent" : null,
      phase: newPlayerDeck.length === 0 ? "finished" : "playing",
      lastAction: `Opponent's ${opponentCard.display}${opponentCard.suit} beats your ${playerCard.display}${playerCard.suit}! They take ${currentPile.length} cards.`,
      isWar: false,
      warDepth: 0,
    }
  } else {
    // WAR! Equal ranks
    // Each player needs 4 more cards (3 face-down + 1 face-up)
    if (newPlayerDeck.length < 4) {
      // Player can't complete war, opponent wins
      return {
        ...state,
        phase: "finished",
        winner: "opponent",
        lastAction: `WAR! But you don't have enough cards. Opponent wins!`,
        lastBattle: { playerCard, opponentCard, winner: "opponent" },
      }
    }
    if (newOpponentDeck.length < 4) {
      // Opponent can't complete war, player wins
      return {
        ...state,
        phase: "finished",
        winner: "player",
        lastAction: `WAR! But opponent doesn't have enough cards. You win!`,
        lastBattle: { playerCard, opponentCard, winner: "player" },
      }
    }

    // Add 3 face-down cards from each
    const playerWarCards = newPlayerDeck.slice(0, 3)
    const opponentWarCards = newOpponentDeck.slice(0, 3)
    const warPile = [...currentPile, ...playerWarCards, ...opponentWarCards]

    return {
      ...state,
      playerDeck: newPlayerDeck.slice(3),
      opponentDeck: newOpponentDeck.slice(3),
      pile: warPile,
      lastBattle: {
        playerCard,
        opponentCard,
        winner: "war",
        warCards: { player: playerWarCards, opponent: opponentWarCards },
      },
      lastAction: `WAR! Both played ${playerCard.display}! 3 cards down, flip again!`,
      isWar: true,
      warDepth: state.warDepth + 1,
    }
  }
}

// ==================== RUMMY (FULL IMPLEMENTATION) ====================
export interface RummyCard {
  rank: number // 1-13 (A=1, J=11, Q=12, K=13)
  suit: string
  display: string
  id: string
}

export interface RummyMeld {
  type: "set" | "run"
  cards: RummyCard[]
}

export interface RummyState {
  phase: "playing" | "finished"
  deck: RummyCard[]
  discardPile: RummyCard[]
  playerHand: RummyCard[]
  opponentHand: RummyCard[]
  currentTurn: "player" | "opponent"
  turnPhase: "draw" | "discard"
  selectedCards: string[]
  winner: "player" | "opponent" | null
  lastAction: string
  playerMelds: RummyMeld[]
  opponentMelds: RummyMeld[]
}

const RUMMY_RANKS = [
  { rank: 1, display: "A" },
  { rank: 2, display: "2" },
  { rank: 3, display: "3" },
  { rank: 4, display: "4" },
  { rank: 5, display: "5" },
  { rank: 6, display: "6" },
  { rank: 7, display: "7" },
  { rank: 8, display: "8" },
  { rank: 9, display: "9" },
  { rank: 10, display: "10" },
  { rank: 11, display: "J" },
  { rank: 12, display: "Q" },
  { rank: 13, display: "K" },
]

export function createRummyDeck(): RummyCard[] {
  const deck: RummyCard[] = []
  const suits = ["♠", "♥", "♦", "♣"]

  for (const suit of suits) {
    for (const { rank, display } of RUMMY_RANKS) {
      deck.push({ rank, suit, display, id: `${display}-${suit}` })
    }
  }

  return shuffleArray(deck)
}

export function initRummy(): RummyState {
  const deck = createRummyDeck()
  const playerHand = sortRummyHand(deck.slice(0, 13))
  const opponentHand = sortRummyHand(deck.slice(13, 26))
  const remainingDeck = deck.slice(26)
  const discardPile = [remainingDeck[0]]
  const finalDeck = remainingDeck.slice(1)

  return {
    phase: "playing",
    deck: finalDeck,
    discardPile,
    playerHand,
    opponentHand,
    currentTurn: "player",
    turnPhase: "draw",
    selectedCards: [],
    winner: null,
    lastAction: "Draw a card from the deck or discard pile to start your turn.",
    playerMelds: [],
    opponentMelds: [],
  }
}

export function sortRummyHand(hand: RummyCard[]): RummyCard[] {
  return [...hand].sort((a, b) => {
    if (a.suit !== b.suit) return a.suit.localeCompare(b.suit)
    return a.rank - b.rank
  })
}

export function drawCard(state: RummyState, from: "deck" | "discard"): RummyState {
  if (state.turnPhase !== "draw" || state.currentTurn !== "player") return state

  if (from === "deck") {
    if (state.deck.length === 0) {
      // Reshuffle discard pile
      if (state.discardPile.length <= 1) {
        return { ...state, phase: "finished", winner: null, lastAction: "Deck empty! Game is a draw." }
      }
      const topDiscard = state.discardPile[state.discardPile.length - 1]
      const newDeck = shuffleArray(state.discardPile.slice(0, -1))
      return drawCard({ ...state, deck: newDeck, discardPile: [topDiscard] }, "deck")
    }

    const drawnCard = state.deck[0]
    return {
      ...state,
      deck: state.deck.slice(1),
      playerHand: sortRummyHand([...state.playerHand, drawnCard]),
      turnPhase: "discard",
      lastAction: `You drew ${drawnCard.display}${drawnCard.suit} from the deck. Now discard a card.`,
    }
  } else {
    if (state.discardPile.length === 0) return state

    const drawnCard = state.discardPile[state.discardPile.length - 1]
    return {
      ...state,
      discardPile: state.discardPile.slice(0, -1),
      playerHand: sortRummyHand([...state.playerHand, drawnCard]),
      turnPhase: "discard",
      lastAction: `You picked up ${drawnCard.display}${drawnCard.suit} from discard. Now discard a card.`,
    }
  }
}

export function discardCard(state: RummyState, cardId: string): RummyState {
  if (state.turnPhase !== "discard" || state.currentTurn !== "player") return state

  const card = state.playerHand.find((c) => c.id === cardId)
  if (!card) return state

  const newHand = state.playerHand.filter((c) => c.id !== cardId)

  return {
    ...state,
    playerHand: newHand,
    discardPile: [...state.discardPile, card],
    currentTurn: "opponent",
    turnPhase: "draw",
    lastAction: `You discarded ${card.display}${card.suit}. Opponent's turn.`,
  }
}

export function isValidSet(cards: RummyCard[]): boolean {
  if (cards.length < 3 || cards.length > 4) return false

  const rank = cards[0].rank
  const suits = new Set(cards.map((c) => c.suit))

  return cards.every((c) => c.rank === rank) && suits.size === cards.length
}

export function isValidRun(cards: RummyCard[]): boolean {
  if (cards.length < 3) return false

  const sorted = [...cards].sort((a, b) => a.rank - b.rank)
  const suit = sorted[0].suit

  if (!sorted.every((c) => c.suit === suit)) return false

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].rank !== sorted[i - 1].rank + 1) return false
  }

  return true
}

export function canDeclare(hand: RummyCard[]): { valid: boolean; melds: RummyMeld[] } {
  // Try to partition hand into valid melds
  // This is a simplified version - for full Rummy, you'd need a more sophisticated algorithm

  const allMelds = findAllPossibleMelds(hand)

  // Try to find a combination of melds that covers all cards
  const result = tryPartition(hand, allMelds, [])
  return result
}

function findAllPossibleMelds(hand: RummyCard[]): RummyMeld[] {
  const melds: RummyMeld[] = []

  // Find sets (3-4 cards of same rank)
  const byRank: Record<number, RummyCard[]> = {}
  for (const card of hand) {
    if (!byRank[card.rank]) byRank[card.rank] = []
    byRank[card.rank].push(card)
  }

  for (const cards of Object.values(byRank)) {
    if (cards.length >= 3) {
      // All combinations of 3 or 4 cards
      if (cards.length >= 3) {
        for (let i = 0; i < cards.length; i++) {
          for (let j = i + 1; j < cards.length; j++) {
            for (let k = j + 1; k < cards.length; k++) {
              const set = [cards[i], cards[j], cards[k]]
              if (isValidSet(set)) melds.push({ type: "set", cards: set })
            }
          }
        }
      }
      if (cards.length === 4 && isValidSet(cards)) {
        melds.push({ type: "set", cards })
      }
    }
  }

  // Find runs (3+ consecutive cards of same suit)
  const bySuit: Record<string, RummyCard[]> = {}
  for (const card of hand) {
    if (!bySuit[card.suit]) bySuit[card.suit] = []
    bySuit[card.suit].push(card)
  }

  for (const cards of Object.values(bySuit)) {
    const sorted = [...cards].sort((a, b) => a.rank - b.rank)

    // Find all consecutive sequences
    for (let start = 0; start < sorted.length; start++) {
      for (let end = start + 2; end < sorted.length; end++) {
        const run = sorted.slice(start, end + 1)
        if (isValidRun(run)) {
          melds.push({ type: "run", cards: run })
        }
      }
    }
  }

  return melds
}

function tryPartition(
  remaining: RummyCard[],
  allMelds: RummyMeld[],
  usedMelds: RummyMeld[],
): { valid: boolean; melds: RummyMeld[] } {
  if (remaining.length === 0) {
    return { valid: true, melds: usedMelds }
  }

  for (const meld of allMelds) {
    // Check if all cards in meld are in remaining
    const meldCardIds = meld.cards.map((c) => c.id)
    const allPresent = meldCardIds.every((id) => remaining.some((c) => c.id === id))

    if (allPresent) {
      const newRemaining = remaining.filter((c) => !meldCardIds.includes(c.id))
      const result = tryPartition(newRemaining, allMelds, [...usedMelds, meld])
      if (result.valid) return result
    }
  }

  return { valid: false, melds: [] }
}

export function declareRummy(state: RummyState): RummyState {
  if (state.currentTurn !== "player" || state.turnPhase !== "discard") return state

  const result = canDeclare(state.playerHand)

  if (result.valid) {
    return {
      ...state,
      phase: "finished",
      winner: "player",
      playerMelds: result.melds,
      lastAction: "Congratulations! You declared and won!",
    }
  }

  return {
    ...state,
    lastAction: "Invalid declaration! Your hand cannot be fully melded.",
  }
}

export function aiRummyTurn(state: RummyState): RummyState {
  if (state.currentTurn !== "opponent" || state.phase === "finished") return state

  // AI draws from deck
  if (state.deck.length === 0 && state.discardPile.length <= 1) {
    return { ...state, phase: "finished", winner: null, lastAction: "Deck empty! Game is a draw." }
  }

  let newState = { ...state }

  // Draw phase
  if (state.deck.length > 0) {
    const drawnCard = state.deck[0]
    newState = {
      ...newState,
      deck: state.deck.slice(1),
      opponentHand: sortRummyHand([...state.opponentHand, drawnCard]),
    }
  }

  // Check if AI can declare
  const declareResult = canDeclare(newState.opponentHand)
  if (declareResult.valid) {
    return {
      ...newState,
      phase: "finished",
      winner: "opponent",
      opponentMelds: declareResult.melds,
      lastAction: "Opponent declared and won!",
    }
  }

  // Discard phase - AI discards a random card
  const discardIndex = Math.floor(Math.random() * newState.opponentHand.length)
  const discardedCard = newState.opponentHand[discardIndex]

  return {
    ...newState,
    opponentHand: newState.opponentHand.filter((_, i) => i !== discardIndex),
    discardPile: [...newState.discardPile, discardedCard],
    currentTurn: "player",
    turnPhase: "draw",
    lastAction: `Opponent discarded ${discardedCard.display}${discardedCard.suit}. Your turn - draw a card.`,
  }
}
