import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import Match from "@/models/Match"
import { createInitialGameState } from "@/lib/game-logic"

// POST /api/match/create
// Body: { gameType: string, mode: string, isAiGame: boolean, difficulty: string, userId: string }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { gameType, mode, isAiGame, difficulty, userId } = body

    if (!gameType || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await connectToDatabase()

    // Generate a unique 6-character code
    const generateCode = () => {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
      let result = ""
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return result
    }

    let code = generateCode()
    // Ensure uniqueness (simple retry)
    let existing = await Match.findOne({ code })
    while (existing) {
      code = generateCode()
      existing = await Match.findOne({ code })
    }

    // Create Initial Game State
    // Note: createInitialGameState expects player IDs.
    // For now we use the userId as host.
    const initialGameState = createInitialGameState(gameType, userId, isAiGame ? "ai-player" : "waiting...", difficulty)

    // Create RoomState (matches frontend RoomState structure)
    const roomState = {
      code,
      hostId: userId,
      gameType,
      status: isAiGame ? "playing" : "waiting",
      players: [
        { id: userId, username: "Host", isHost: true, isReady: true }
      ],
      settings: { mode, isPublic: true },
      isAiGame,
      chat: [],
      gameState: initialGameState
    }

    if (isAiGame) {
      roomState.players.push({
         id: "ai-player",
         username: "AI Opponent",
         isHost: false,
         isReady: true
      })
    }

    const match = await Match.create({
      code,
      roomState
    })

    return NextResponse.json({ code, roomState })
  } catch (error) {
    console.error("Error creating match:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
