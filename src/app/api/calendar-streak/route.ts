import { auth } from "@/auth";
import { dbConnect } from "@/lib/dbConnect";
import CalendarTickModel from "@/model/CalendarTick.model";
import mongoose from "mongoose";
import { User } from "next-auth";

export async function GET(){
    try {
        await dbConnect();

        const session = await auth()
        if(!session || !session.user){
            return Response.json({
                success: true,
                message: "Not Authorized"
            },{status: 401})

        }
        const user:User =  session?.user

        // const timeZone = 'UTC';
        // const now = new Date();
        // const zonedDate =  toZonedTime(now, timeZone);
        // const dateString = format(zonedDate, 'yyyy-MM-dd',{timeZone})
        const userId = new mongoose.Types.ObjectId(user._id)
        const todaysGreenTickTasks = await CalendarTickModel.find({
            userId
        }).populate('goals','title').exec();

        return Response.json({
            success: true,
            message: "Successfully fetched todays green tick tasks",
            data: todaysGreenTickTasks
        },{status: 200})
    } catch {
        return Response.json({
        success: false,
        message: "Failed to fetch today's tasks",
        error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}