import mongoose, { Schema, Document, Model } from "mongoose"

export interface IMatchHistory {
  gameId: string
  result: "win" | "loss" | "draw"
  date: Date
}

export interface IUser extends Document {
  email: string
  username: string
  wins: number
  losses: number
  matchHistory: IMatchHistory[]
  hasSeenTutorial: boolean
  createdAt: Date
  updatedAt: Date
}

const MatchHistorySchema = new Schema<IMatchHistory>({
  gameId: { type: String, required: true },
  result: { type: String, enum: ["win", "loss", "draw"], required: true },
  date: { type: Date, default: Date.now },
})

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    matchHistory: [MatchHistorySchema],
    hasSeenTutorial: { type: Boolean, default: false },
  },
  { timestamps: true },
)

// Prevent overwriting model during hot reload
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default User
