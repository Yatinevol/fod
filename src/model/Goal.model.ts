import mongoose,{ Schema, Types } from "mongoose";
import { User } from "./User.model";


export interface GoalI{
    userId : Types.ObjectId | User;
    title: string;
    category: string;
    createdAt?: Date;
    isActive? : boolean
}

const GoalSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    title:{
        type: String,
        trim: true,
        required: true
    },

    category:{
        type:String,
        trim: true,
        required: true
    },

    isActive:{
        type: Boolean,
        default: true
    }

},{timestamps: true})

const GoalModel = (mongoose.models.Goal as mongoose.Model<GoalI>) || (mongoose.model("Goal",GoalSchema))

export default GoalModel


