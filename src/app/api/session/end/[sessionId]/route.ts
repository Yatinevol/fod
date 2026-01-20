import { auth } from "@/auth";
import { dbConnect } from "@/lib/dbConnect";
import { Session } from "@/model/Session.model";
import { User } from "next-auth";
import { NextRequest } from "next/server";

export async function POST(request:NextRequest,context:{params:Promise<{sessionId:string}>}) {
    try {
        const {sessionId} = await context.params
        const session = await auth()
        if(!session || !session.user){
             return Response.json(
                { message: "Unauthorized",
                  success: false
                 },
                { status: 401 });
        }

        await dbConnect();
        const user:User = session.user
        const sessionFound = await Session.findOne({
            sessionId,
            isActive:true
        })

        if(!sessionFound){
            return Response.json(
                { message: "Session not found or already ended",
                  success:false
                 },
                { status: 404 });

        }

        if(sessionFound.createdBy.toString() !== user._id){
            return Response.json(
                { message: "Only session host can end the session",
                  success: false
                 },
                { status: 403 });

        }

        sessionFound.isActive = false;
        sessionFound.endTime = new Date(); // Set actual end time

        await sessionFound.save();

        return Response.json({
            success: true,
            isSessionActive: sessionFound.isActive,
            message: "Session ended successfully",
            finalSession: sessionFound
        });

    } catch {
        return Response.json({ error: "Failed to end session" }, { status: 500 });
    }
}