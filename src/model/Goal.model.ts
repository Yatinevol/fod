import mongoose, { Schema, Types } from "mongoose";
import { User } from "./User.model";

export type BoardLane = "now" | "next" | "later";
export type GoalStatus = "open" | "done" | "abandoned";

export interface GoalI {
  userId: Types.ObjectId | User;
  title: string;
  category: string;
  createdAt?: Date;
  isActive?: boolean;
  deadline?: string;
  estimatedMinutes?: number;
  taskType?: string;
  boardLane?: BoardLane;
  lanePinned?: boolean;
  status?: GoalStatus;
}

const GoalSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      trim: true,
      required: true,
    },
    category: {
      type: String,
      trim: true,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deadline: {
      type: String,
      default: "",
    },
    estimatedMinutes: {
      type: Number,
      default: 25,
    },
    taskType: {
      type: String,
      trim: true,
      default: "",
    },
    boardLane: {
      type: String,
      enum: ["now", "next", "later"],
      default: "later",
    },
    lanePinned: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["open", "done", "abandoned"],
      default: "open",
    },
  },
  { timestamps: true }
);

const GoalModel =
  (mongoose.models.Goal as mongoose.Model<GoalI>) ||
  mongoose.model("Goal", GoalSchema);

export default GoalModel;
