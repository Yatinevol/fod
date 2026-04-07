import { auth } from "@/auth";
import { dbConnect } from "@/lib/dbConnect";
import CalendarTickModel from "@/model/CalendarTick.model";
import GoalModel from "@/model/Goal.model"; // Ensure GoalModel is registered before population
import UserModel from "@/model/User.model"; // Ensure UserModel is registered as well
import mongoose from "mongoose";
import { User } from "next-auth";

export const dynamic = "force-dynamic";

export async function GET(){
    try {
        await dbConnect();

        const session = await auth()
        if(!session || !session.user){
            return Response.json({
                success: true, // Should probably be false for 401
                message: "Not Authorized"
            },{status: 401})

        }
        const user:User =  session?.user

        if (!user._id) {
            return Response.json({
                success: false,
                message: "User ID is missing from session"
            },{status: 400})
        }

        const userId = new mongoose.Types.ObjectId(user._id)
        const todaysGreenTickTasks = await CalendarTickModel.find({
            userId
        }).populate('goals','title').exec();

        return Response.json({
            success: true,
            message: "Successfully fetched todays green tick tasks",
            data: todaysGreenTickTasks
        },{status: 200})
    } catch (error) {
        // console.error("Database or Calendar Streak Fetch Error:", error); // Enable logging
        return Response.json({
        success: false,
        message: "Failed to fetch today's tasks",
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined // Provide more debug details to browser network tab
        }, { status: 500 });
    }
}