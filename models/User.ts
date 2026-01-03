import mongoose, { Schema, Model } from 'mongoose';

export interface IUser {
  username: string;
  email?: string;
  image?: string;
  hasSeenTutorial: boolean;
  wins: number;
  losses: number;
  draws: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, unique: true, sparse: true },
    image: { type: String },
    hasSeenTutorial: { type: Boolean, default: false },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Prevent overwrite of the model if it's already compiled
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
