import { auth } from "@/auth";
import { dbConnect } from "@/lib/dbConnect";
import { Session } from "@/model/Session.model";
import { User } from "next-auth";
import { NextRequest } from "next/server";
import { success } from "zod";


export async function POST(request: NextRequest, { params }: { params: { sessionId: string } }) {
    try {
        const session = await auth()
        if(!session || !session.user ){
             return Response.json(
                { error: "Unauthorized" }, 
                { status: 401 });
            }
        
        await dbConnect()
        const user:User = session.user
        const {sessionId} = await params
        console.log("session Id value check in server side",sessionId);
        const sessionExist = await Session.findOne({
            sessionId,
            isActive: true
        })
        if(!sessionExist){
            return Response.json(
                { error: "Session not found or expired" },
                { status: 404 });
        }
        if(new Date() > sessionExist.endTime){
            sessionExist.isActive = false;
            await sessionExist.save();
            return Response.json(
                { error: "Session has expired" },
                { status: 400 });
        }
        const userId = session.user._id
        if(!userId){
            return Response.json({
                message:"User not found",
                success: false
            },{status:400})
        }
        const existingParticipant = sessionExist.participants.find(
            p => p.userId.toString() === userId
        )

        if(!existingParticipant){
            sessionExist.participants.push({
                userId,
                username: user.username,
                totalFocusMinutes:0,
                targetHour : sessionExist.weeklyGoalHours
            });
            await sessionExist.save();
        }

         return Response.json({
            success: true,
            session: sessionExist,
            host: sessionExist.createdBy.toString(),
            message: existingParticipant ? "Already in session" : "Joined successfully"
        });

    } catch (error) {
        console.error('Failed to join session:', error);
        return Response.json({ error: "Failed to join session" }, { status: 500 });
    }
}