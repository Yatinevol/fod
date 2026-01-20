import { auth } from "@/auth";
import { helper } from "@/helper/endofWeek";
import { dbConnect } from "@/lib/dbConnect";
import TimerModel from "@/model/Timer.model";
import { User } from "next-auth";


export async function GET() {
    try {
        const session = await auth()
        if(!session || !session.user){
            return Response.json({ message: "Unauthorized" }, { status: 401 });

        }
        await dbConnect()
        const user:User = session.user
        const date = new Date()
        const today = new Date(date.getFullYear(),date.getMonth(), date.getDate())
        

        const goalsFound = await TimerModel.findOne({
            userId:user._id,
            date:today,
            isWeekly:false
        })
        let isTodayGoalSet=true;
        let isWeekGoalSet=true;
        if(!goalsFound){
            isTodayGoalSet = false
        }
        const endOfWeek = helper(date)
        const weekGoal = await TimerModel.findOne({
            userId: user._id,
            date: endOfWeek,
            isWeekly:true
        })
        if(!weekGoal){
            isWeekGoalSet = false
        }
        return Response.json({
            message: "week state successfully retreived",
            success:true,
            todayGoal:{
                isTodayGoalSet:(isTodayGoalSet)? true:false,
                targetMinutes:goalsFound?.targetMinutes,
                totalFocusMinutes:goalsFound?.totalFocusMinutes
            },
            weekGoal:{
                isWeekGoalSet:(isWeekGoalSet)?true: false,
                targetMinutes: weekGoal?.targetMinutes,
                totalFocusMinutes:weekGoal?.totalFocusMinutes
            }
        },{status:200})
      

    } catch {
        return Response.json({ 
            error: "Failed to get user goals" 
        }, { status: 500 });
    }
}