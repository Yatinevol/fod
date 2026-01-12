import { auth } from "@/auth";
import { dbConnect } from "@/lib/dbConnect";
import { Session } from "@/model/Session.model";
import { User } from "next-auth";
import { NextRequest } from "next/server";


export async function GET(request:NextRequest,{params}:{params:{sessionId: string}}) {
    try {
        const session = await auth()
        if (!session?.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }


        await dbConnect()
    
        const {sessionId} = await params
        const user:User = session.user
        const sessionFound = await Session.findOne({
            sessionId
        })
    
        if(!sessionFound || !sessionFound.isActive){
             return Response.json(
                { message: "Session not found" },
                { status: 404 });
        }
    
        if(new Date() > sessionFound.endTime && sessionFound.isActive){
            sessionFound.isActive = false
            await sessionFound.save();
            return Response.json({
                message: "Session expired",
                },{status: 410})
        }
        // console.log("sessionFound on server side :",sessionFound)
        const isParticipant = sessionFound.participants.some(
            p=> p.userId?.toString() === user._id
        )
        if(!isParticipant){
             return Response.json(
            { message: "Access denied. You are not a participant of this session." },
            { status: 403 }
    );
        }
        return Response.json({
            success: true,
            session:sessionFound,
            participants:sessionFound.participants
        })
    } catch (error) {
        console.error('Failed to get session:', error);
        return Response.json({ error: "Failed to get session" }, { status: 500 });
    }
}