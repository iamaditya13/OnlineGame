import mongoose, { Schema } from 'mongoose';

// Flexible Schema to store the entire RoomState JSON object
const MatchSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    roomState: { type: Schema.Types.Mixed, required: true }, // Store the full Redux-like state
    lastUpdated: { type: Date, default: Date.now, expires: 86400 } // Auto-delete after 24 hours
  },
  { timestamps: true }
);

// Prevent compiling model multiple times in development
const Match = mongoose.models.Match || mongoose.model('Match', MatchSchema);

export default Match;
