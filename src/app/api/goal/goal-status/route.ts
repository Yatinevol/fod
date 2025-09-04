import { auth } from "@/auth";
import { dbConnect } from "@/lib/dbConnect";
import GoalCompletionModel from "@/model/GoalCompletion.model";
import { User } from "next-auth";
import { NextRequest } from "next/server";

export async function GET(request:NextRequest) {
    try {
        await dbConnect();
        const session = await auth()
        const {searchParams} = new URL(request.url)
        const date = searchParams.get("date")
        const todaydate = date || new Date().toISOString().split("T")[0]
        if(!session || !session.user){
            return Response.json({
                success:false,
                message:"Not Authenticated"
                
            },{status:400})
        }
        const user:User = session?.user
        const getCompletedGoals = await GoalCompletionModel.find({userId:user._id, date: todaydate})
        console.log("getCompletedGoals",getCompletedGoals);
        return Response.json({
            success: true,
            message:"All todays tasks status fetced",
            data: getCompletedGoals
        },{status:200})
    } catch (error) {
        console.log("some error occured fetching the tasks",error);
        return Response.json({
            success: false,
            message:"some error occured fetching the tasks",
            
        },{status:500})
    }
}