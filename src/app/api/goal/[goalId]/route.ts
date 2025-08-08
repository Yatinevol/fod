// this route is for patch/update the goal or delete the goal.

import { auth } from "@/auth";
import { dbConnect } from "@/lib/dbConnect";
import GoalModel from "@/model/Goal.model";
import { User } from "next-auth";
import { NextRequest } from "next/server";

export async function DELETE(request:NextRequest,{params}:{params: {goalId:string}}) {
    const goalId = params.goalId
    await dbConnect()

    try {
        const session = await auth()
        if(!session || !session.user){
            return Response.json({
                success: false,
                message: "Not Authenticated"
            },{status: 400})
        }

        const user:User = session.user

        const goalFound = await GoalModel.findOneAndDelete({_id: goalId, userId: user._id})

        if(!goalFound){
            return Response.json({
                success: false,
                message: "Goal not found or already deleted"
            },{status: 404})
        }

        return Response.json({
            success: true,
            message: "Goal deleted"
        },{status: 200})
    } catch (error) {
        console.error("error deleting goal:",error)
        return Response.json({
            success: false,
            message: "Error deleting message"
        },{status: 500})
    }
}