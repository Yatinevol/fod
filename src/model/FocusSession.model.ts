import mongoose, { Schema, Types } from "mongoose";

export type FocusOutcome = "completed" | "abandoned" | "in_progress";

export interface FocusSessionI {
  userId: Types.ObjectId;
  startedAt: Date;
  endedAt?: Date;
  pauseCount: number;
  outcome: FocusOutcome;
  hourOfDay: number;
  durationMinutes: number;
}

const FocusSessionSchema = new Schema<FocusSessionI>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date },
    pauseCount: { type: Number, default: 0 },
    outcome: {
      type: String,
      enum: ["completed", "abandoned", "in_progress"],
      default: "in_progress",
    },
    hourOfDay: { type: Number, required: true },
    durationMinutes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default (mongoose.models.FocusSession as mongoose.Model<FocusSessionI>) ||
  mongoose.model("FocusSession", FocusSessionSchema);
