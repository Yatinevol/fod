import { auth } from "@/auth";
import { dbConnect } from "@/lib/dbConnect";
import TimerModel from "@/model/Timer.model";
import { User } from "next-auth";
import { NextRequest } from "next/server";
const helper = (today:Date)=>{
    
    const endOfWeek = new Date(today)
    const daysUntilSunday =( 7 - today.getDay()) % 7;
    endOfWeek.setDate(today.getDate()+daysUntilSunday)
    endOfWeek.setHours(23,59,59,999)
    return endOfWeek;
}
export async function POST(request:NextRequest) {
    try {
        const session = await auth()
        if(!session || !session.user){
            return Response.json(
                { message: "Unauthorized",
                  success:false
                 },
                { status: 401 });
        }
        await dbConnect()
        const user:User = session.user
        const {goalTHr, goalWeekHr, isWeekly, focusedMinutes} = await request.json()
        const today = new Date()
        if(isWeekly){
            const endOfWeek = helper(today)
            const updatedWeekGoal = await TimerModel.findOneAndUpdate({
                userId: user._id,
                date: endOfWeek,
                isWeekly:true
            },{
                $set:{
                    targetMinutes:goalWeekHr,
                    totalFocusMinutes: focusedMinutes
                },
                $setOnInsert:{
                    userId:user._id,
                    date: endOfWeek,
                    isWeekly:true
                }
            },{
                new:true,
                upsert:true
            })

            return Response.json({
                success: true,
                message: "Weekly goal updated successfully",
                weekGoal: updatedWeekGoal,
                goalWeekHr: goalWeekHr,
                goalEnd: endOfWeek,
                totalFocuMinutes: updatedWeekGoal.totalFocusMinutes
            }, {
                status: 200
            });
        }
        
        else{
            const updatedGoal = await TimerModel.findOneAndUpdate({
                userId: user._id,
                date: new Date(today.getFullYear(),today.getMonth(),today.getDate())
            },
            {
                $set:{
                    targetMinutes: goalTHr,
                    totalFocusMinutes:focusedMinutes
                },
                $setOnInsert:{
                    userId: user._id,
                    date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                }
            },{
                new: true,
                upsert:true
            })
            
            return Response.json({ 
                success: true, 
                message: "Today Goal updated successfully",
                todayGoal: updatedGoal,
                goalTHr: updatedGoal?.targetMinutes,
                focusedMinutes: updatedGoal?.totalFocusMinutes
            },{
                status: 200
            });
        }
        
        
    } catch (error) {
        console.error('Failed to set goal:', error);
        return Response.json({ 
            success: false, 
            message: "Failed to set goal" 
        }, { status: 500 });
    }
}