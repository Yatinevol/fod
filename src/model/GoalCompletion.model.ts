import mongoose,{Schema, Types} from "mongoose";
import { User } from "./User.model";
import { GoalI } from "./Goal.model";

// Goal completion model for :
export interface GoalCompletionI{
    userId: Types.ObjectId | User;
    goalId: Types.ObjectId | GoalI;
    date: string; // "YYYY-MM-DD"
    completed: boolean;
  }

const GoalCompletionSchema = new Schema<GoalCompletionI>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      goalId: {
        type: Schema.Types.ObjectId,
        ref: "Goal",
        required: true,
      },
      date: {
        type: String, // Use ISO date string like "2025-08-03"
        required: true,
      },
      completed: {
        type: Boolean,
        default: false,
      },
},{timestamps: true})

export default (mongoose.models.GoalCompletion as mongoose.Model<GoalCompletionI>) || (mongoose.model("GoalCompletion",GoalCompletionSchema))