// this route is for patch/update the goal or delete the goal.

import { auth } from "@/auth";
import { dbConnect } from "@/lib/dbConnect";
import GoalModel from "@/model/Goal.model";
import { User } from "next-auth";
import { NextRequest } from "next/server";


export async function DELETE(request:NextRequest,context:{params: Promise<{goalId:string}>}) {
    const {goalId} = await context.params
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
    } catch {
        return Response.json({
            success: false,
            message: "Error deleting message"
        },{status: 500})
    }
}

export async function PATCH(request:NextRequest,context:{params:Promise<{goalId:string}>}) {
    const {goalId} = await context.params
    const {isActive, title} = await request.json()

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

        const update: Record<string, unknown> = {}
        // an array to return values if they are defined:
        const updatedFields = []

        if(isActive !== undefined) {
            update.isActive = isActive 
            updatedFields.push("status")
        }
        if(title !== undefined) {
            update.title = title
            updatedFields.push("Title")
            
        }

        if(!title && !isActive){
            return Response.json({
                success: false,
                message: "Nothing found to update"
            },{status: 400})
        }
        const updatedGoal = await GoalModel.findOneAndUpdate({
            _id: goalId,
            userId : user._id
        },{
            $set: update
        },
        {
            new: true
        })

        if(!updatedGoal){
            return Response.json({
            success: false,
            message: "Nothing found to update"
            },{status: 400})
        }

        return Response.json({
            success: true,
            message: `Updated ${updatedFields.join(" and ")} successfully`
        },{status: 200})
    } catch {
        return Response.json({
            success: false,
            message: "Nothing found to update"
            },{status: 500})
    }
}