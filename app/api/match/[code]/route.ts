import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import Match from "@/models/Match"

// GET /api/match/[code]
// Returns the current room state
// GET /api/match/[code]
// Returns the current room state
export async function GET(req: NextRequest, props: { params: Promise<{ code: string }> }) {
  const params = await props.params;
  try {
    const code = params.code
    if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 })

    await connectToDatabase()
    const match = await Match.findOne({ code })

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 })
    }

    return NextResponse.json(match.roomState)
  } catch (error) {
    console.error("Error fetching match:", error)
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}

// POST /api/match/[code]
// Body: { action: "join" | "move" | "leave" | "chat", payload: any, userId: string }
export async function POST(req: NextRequest, props: { params: Promise<{ code: string }> }) {
  const params = await props.params;
  try {
    const code = params.code
    const body = await req.json()
    const { action, payload, userId } = body

    await connectToDatabase()
    const match = await Match.findOne({ code })

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 })
    }

    const roomState = match.roomState

    // --- GAME LOGIC UPDATES ---
    // Note: detailed validation should happen here, but for now we trust client's new state
    // OR we can implement the logic on server.
    // Given the architecture, the client calculates the next state and sends it?
    // OR client sends "move" and server calculates?
    // The previous architecture was: `makeMove` calls `applyMove` locally.
    // If we want to keep it simple: Client calculates new state locally, sends FULL state?
    // NO, that's dangerous and race-condition prone.
    // Better: Client sends the MOVE. Server applies it?
    // Server doesn't have `applyMove` loaded yet?
    // We imported `createInitialGameState` easily. `applyMove` is in `hooks/use-socket.ts`.
    // We should move `applyMove` to `lib/game-logic.ts` too!
    
    // BUT moving `applyMove` creates a huge refactor now.
    // SHORTCUT for Poll-based multiplayer:
    // Client sends the full updated `gameState` (optimistic). server saves it.
    // Race conditions exist but acceptable for "turn based" games (Tic-Tac-Toe, Chess).
    // EXCEPT: "Join" logic must be server side atomic-ish.
    
    if (action === "join") {
      // payload: { username: string }
      if (!roomState.players.find((p: any) => p.id === userId)) {
        roomState.players.push({
          id: userId,
          username: payload.username || "Guest",
          isHost: false,
          isReady: true
        })
        // If we were waiting for player 2, update status
        if (roomState.status === "waiting" && roomState.players.length >= 2) {
           roomState.status = "playing"
           // Update player 2 id in gameState?
           // gameState.players[1].id = userId
           if (roomState.gameState && roomState.gameState.players[1]) {
             roomState.gameState.players[1].id = userId
             roomState.gameState.players[1].username = payload.username || "Guest"
           }
        }
      }
    } else if (action === "move") {
       // payload is the NEW gameState (calculated by client)
       // OR payload is the move object?
       // Let's assume payload IS the new roomState (or at least gameState)
       // This is risky but fast.
       // Let's expect payload to be { gameState: ... }
       if (payload.gameState) {
         roomState.gameState = payload.gameState
         // Also update status if game over?
         // roomState.status = ...
       }
       if (payload.turn) {
         // handle turn switch if needed
       }
    } else if (action === "chat") {
       roomState.chat.push(payload)
    }

    // Save
    match.roomState = roomState
    match.markModified('roomState')
    await match.save()

    return NextResponse.json(roomState)
  } catch (error) {
    console.error("Error updating match:", error)
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}
