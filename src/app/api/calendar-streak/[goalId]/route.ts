import { auth } from "@/auth";
import CalendarTickModel from "@/model/CalendarTick.model";
import GoalModel, { GoalI } from "@/model/Goal.model";
import { User } from "next-auth";
import { NextRequest } from "next/server";
export async function POST(request:NextRequest,context:{params: Promise<{goalId: string}>}) {

    // new way to use params:

    const {goalId} = await context.params
    try {
        const session = await auth()
        if(!session || !session.user){
            return Response.json({
                success: false,
                message: "Not Authenticated"
            },{status: 400})
        }

        const user:User = session.user
        const goalExists = await GoalModel.findOne({userId:user._id, _id: goalId})
        if(!goalExists){
            return Response.json({
                success:false,
                message: "Activity not found"
            },{status: 400})
        }
       const today = new Date()
       today.setHours(0,0,0,0)
       const calendarExist = await CalendarTickModel.findOne({userId: user._id, date: today})
        // reset logic
       if(!calendarExist){
            const newDayCalendar = new CalendarTickModel({
                userId: user._id,
                goals:[goalId],
                earnedGreenTick: true,
                date: today
            })

            await newDayCalendar.save()
            return Response.json({
                success: true,
                message: "Goal completed successfully",
                data : newDayCalendar
        
            },{status: 200})
       }
       if(calendarExist.goals.some(id=> id.toString() === goalId)){
        
        return Response.json({
            success: false,
            message: "Goal already marked green"
          }, { status: 400 });
        
       }
        calendarExist.goals.push(goalExists._id)
        calendarExist.earnedGreenTick = true;
        await calendarExist.save();

        return Response.json({
            success: true,
            message: "Goal completed successfully",
            data : calendarExist
        },{status: 200})
       
    } catch (error) {
        console.error("Error changing status of calendar")
        return Response.json({
            success:false,
                message: "Goal calendar status"
            },{status: 500})
    }
}