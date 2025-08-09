import mongoose,{Schema, Types} from "mongoose";
import { User } from "./User.model";
import  { GoalI } from "./Goal.model";

export interface CalendarTick{
    userId: Types.ObjectId | User; 
    date: Date;
    goals: Types.ObjectId[] 
    earnedGreenTick: boolean;
    createdAt?: Date;
    activitiesCompleted?: number
}

const CalenderTickSchema = new Schema<CalendarTick>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    goals:[{
        type: Schema.Types.ObjectId,
        ref: "Goal"
    }],
    date:{
        type: Date,
        required: true
    },
    earnedGreenTick: {
        type: Boolean,
        required:true,
        default: false

    },
    activitiesCompleted:{
        type:Number,
        default: 0
    }
},{timestamps:true})
export default (mongoose.models.CalendarTick as mongoose.Model<CalendarTick>) || (mongoose.model("CalendarTick",CalenderTickSchema))