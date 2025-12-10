import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/models/User"

export async function POST(req: Request) {
  try {
    await dbConnect()
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    let user = await User.findOne({ email })

    if (!user) {
      // Create new user
      const username = email.split("@")[0] // Default username from email
      user = await User.create({
        email,
        username,
      })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Sign in error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 })
  }
}
