import { auth } from "@/auth";
import { dbConnect } from "@/lib/dbConnect";
import { Session } from "@/model/Session.model";
import { User } from "next-auth";
import { NextRequest } from "next/server";


export async function POST(request:NextRequest,context:{params:Promise<{sessionId: string}>}) {
    try {
        const {sessionId} = await context.params
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
        const {focusedMinutes} = await request.json()
        if(focusedMinutes < 0){
            return Response.json({
                success:false,
                message:"Focused time should not be zero"
            },{status:400})
        }

        const sessionFound = await Session.findOne({
            sessionId,
            isActive:true,
        })

        if(!sessionFound){
            return Response.json(
                { message: "Session not found or inactive",
                success:false
                 }, { status: 404 });

        }

         if (new Date() > sessionFound.endTime) {
            sessionFound.isActive = false;
            await sessionFound.save();
            return Response.json(
                { message: "Session has expired",
                  success: false
                 },
                 { status: 400 });
        }

        const isParticipant = sessionFound.participants.some(
            p => p.userId?.toString() === user._id
        );

        if(!isParticipant){
            return Response.json({
                success: false,
                message: "You are not a participant of this session"
            }, { status: 403 });
        }

        const updateSession = await Session.findOneAndUpdate({
            sessionId,
            "participants.userId": user._id
        },{
            $set:{
                "participants.$.totalFocusMinutes":focusedMinutes
            }
        },{
            new:true
        })

        return Response.json({
            success: true,
            message: "Progress updated successfully",
            session: updateSession
        });
    } catch {
        return Response.json({ 
            success: false,
            message: "Failed to update progress" 
        }, { status: 500 });
    }
}