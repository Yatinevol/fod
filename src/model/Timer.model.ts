import mongoose, { Schema, Types } from "mongoose";
import { User } from "./User.model";

export interface TimerI {
  userId: Types.ObjectId | User;
  date: string;
  totalFocusMinutes: number;
  targetMinutes: number;
  isWeekly: boolean;
}

const timerSchema = new Schema<TimerI>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    totalFocusMinutes: {
      type: Number,
      required: true,
    },
    targetMinutes: {
      type: Number,
      required: true,
    },
    isWeekly: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const TimerModel =
  (mongoose.models.Timer as mongoose.Model<TimerI>) ||
  mongoose.model("Timer", timerSchema);

export default TimerModel;
