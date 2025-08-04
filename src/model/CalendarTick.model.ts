import mongoose,{Schema, Types} from "mongoose";
import { User } from "./User.model";

export interface CalendarTick{
    userId: Types.ObjectId | User; 
    date: string;
    earnedGreenTick: boolean;
    createdAt?: Date;
}

const CalenderTickSchema = new Schema<CalendarTick>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    date:{
        type: String,
        required: true
    },
    earnedGreenTick: {
        type: Boolean,
        required:true,
        default: false

    }
},{timestamps:true})
export default (mongoose.models.CalendarTick as mongoose.Model<CalendarTick>) || (mongoose.model("CalendarTick",CalenderTickSchema))