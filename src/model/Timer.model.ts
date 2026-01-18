import mongoose,{ Schema, Types} from "mongoose";
import { GoalI } from "./Goal.model";
import { User } from "./User.model";

// export interface TaskEntry {
//     taskId: Types.ObjectId | GoalI;
//     title: string;
//     totalFocusMinutes: number;
// }
// const TaskEntrySchema = new Schema({
//     goalId: { type: Schema.Types.ObjectId, ref: 'Goal', required: true },
//     title: { type: String, required: true },
//     totalFocusMinutes: { type: Number, required: true }
// });

export interface TimerI{
    userId: Types.ObjectId | User ;
    date : string;
    totalFocusMinutes: number;
    targetMinutes: number;
    isWeekly: boolean
    // tasks: TaskEntry[]
}

const timerSchema  = new Schema<TimerI>({
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', required: true 
    },

    date: { 
        type: String, 
        required: true 
    },
    totalFocusMinutes: { 
        type: Number, 
        required: true 
    },
    targetMinutes: { 
        type: Number, 
        required: true 
    },
    isWeekly:{
        type:Boolean,
        default:false,
        
    }
    // ,
    // tasks: { 
    //     type: [TaskEntrySchema], 
    //     default: [] 
    // }
},{timestamps:true})

const TimerModel = (mongoose.models.Timer as mongoose.Model<TimerI>) ||
    (mongoose.model("Timer",timerSchema))

export default TimerModel