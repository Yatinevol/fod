import { auth } from "@/auth";
import { dbConnect } from "@/lib/dbConnect";
import CalendarTickModel from "@/model/CalendarTick.model";
import GoalModel, { GoalI } from "@/model/Goal.model";
import { format, toZonedTime } from "date-fns-tz";
import mongoose from "mongoose";
import { User } from "next-auth";
import { NextRequest } from "next/server";

export async function POST(request:NextRequest,context:{params: Promise<{goalId: string}>}) {

    // new way to use params:

    const {goalId} = await context.params
    // const {earnedGreenTick} = await request?.json()
    try {
        await dbConnect();
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
        const timeZone = 'UTC';
        const now = new Date();
        const zonedDate =  toZonedTime(now, timeZone);
        const dateString = format(zonedDate, 'yyyy-MM-dd',{timeZone})
       const calendarExist = await CalendarTickModel.findOne({userId: user._id, date: dateString})
        // reset logic
       if(!calendarExist){
            const newDayCalendar = new CalendarTickModel({
                userId: user._id,
                goals:[goalId],
                earnedGreenTick: true,
                date: dateString
            })

            await newDayCalendar.save()
            return Response.json({
                success: true,
                message: "Goal completed successfully",
                data : newDayCalendar
        
            },{status: 200})
       }
       if(calendarExist.goals.some(id=> id.toString() === goalId)){
        // calendarExist.earnedGreenTick = earnedGreenTick;
        // await calendarExist.save();
        return Response.json({
            success: true,
            message: "Goal status updated successfully",
            data: calendarExist
          }, { status: 200 });
        
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
        console.error("Error changing status of calendar:", error);
        return Response.json({
          success: false,
          message: "Goal calendar status",
          error: error instanceof Error ? error.message : String(error),
        }, { status: 500 });
    }
}

