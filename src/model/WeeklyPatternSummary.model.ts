import mongoose, { Schema, Types } from "mongoose";

export interface PeakWindow {
  startHour: number;
  endHour: number;
  score: number;
}

export interface WeeklyPatternSummaryI {
  userId: Types.ObjectId;
  weekStart: string;
  peakWindows: PeakWindow[];
  completionByType: Record<string, number>;
  streakTrend: number;
  averageSessionMinutes: number;
}

const WeeklyPatternSummarySchema = new Schema<WeeklyPatternSummaryI>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    weekStart: { type: String, required: true },
    peakWindows: [
      {
        startHour: Number,
        endHour: Number,
        score: Number,
      },
    ],
    completionByType: { type: Schema.Types.Mixed, default: {} },
    streakTrend: { type: Number, default: 0 },
    averageSessionMinutes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

WeeklyPatternSummarySchema.index({ userId: 1, weekStart: 1 }, { unique: true });

export default (
  mongoose.models.WeeklyPatternSummary as mongoose.Model<WeeklyPatternSummaryI>
) || mongoose.model("WeeklyPatternSummary", WeeklyPatternSummarySchema);
