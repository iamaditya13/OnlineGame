import mongoose, { Schema } from 'mongoose';

export interface IMatch {
  gameType: string;
  players: { userId: string; result: 'win' | 'loss' | 'draw' }[];
  durationSeconds: number;
  winnerId?: string;
  playedAt: Date;
}

const MatchSchema = new Schema<IMatch>(
  {
    gameType: { type: String, required: true },
    players: [{
      userId: { type: String, required: true },
      result: { type: String, enum: ['win', 'loss', 'draw'], required: true }
    }],
    durationSeconds: { type: Number, default: 0 },
    winnerId: { type: String },
    playedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const Match = mongoose.models.Match || mongoose.model('Match', MatchSchema);

export default Match;
