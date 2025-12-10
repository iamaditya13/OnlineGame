import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/models/User"

export async function POST(req: Request) {
  try {
    await dbConnect()
    const { userId, gameId, result } = await req.json()

    if (!userId || !gameId || !result) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const update: any = {
      $push: {
        matchHistory: {
          gameId,
          result,
          date: new Date(),
        },
      },
    }

    if (result === "win") {
      update.$inc = { wins: 1 }
    } else if (result === "loss") {
      update.$inc = { losses: 1 }
    }

    const user = await User.findByIdAndUpdate(userId, update, { new: true })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Record match error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
