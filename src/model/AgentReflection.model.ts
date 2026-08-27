import mongoose, { Schema, Types } from "mongoose";

export interface AgentReflectionI {
  userId: Types.ObjectId;
  dateKey: string;
  kind: "daily" | "weekly";
  text: string;
  adjustments: string;
}

const AgentReflectionSchema = new Schema<AgentReflectionI>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dateKey: { type: String, required: true },
    kind: { type: String, enum: ["daily", "weekly"], default: "daily" },
    text: { type: String, required: true },
    adjustments: { type: String, default: "" },
  },
  { timestamps: true }
);

export default (
  mongoose.models.AgentReflection as mongoose.Model<AgentReflectionI>
) || mongoose.model("AgentReflection", AgentReflectionSchema);
