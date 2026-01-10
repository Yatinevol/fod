import { auth } from "@/auth";
import { dbConnect } from "@/lib/dbConnect";
import { Session } from "@/model/Session.model";
import { User } from "next-auth";
import { NextRequest } from "next/server";


export async function GET(request:NextRequest) {
    try {
        const session = await auth();
        if(!session || !session.user){
            return Response.json(
                { message: "Unauthorized",
                  success:false
                 },
                 { status: 401 });

        }
        await dbConnect();
        const user:User = session.user

        const sessionInfoFound = await Session.findOne({
            'participants.userId': user._id,
            isActive:true
        })

        if(!sessionInfoFound){
            return Response.json({ 
                success: true,
                hasActiveSession: false 
            });
        }

        const isHost = sessionInfoFound.createdBy.toString() === user._id

        return Response.json({
            success:true,
            hasActiveSession:true,
            sessionData:{
                sessionId: sessionInfoFound.sessionId,
                sessionLink: `${process.env.NEXT_PUBLIC_BASE_URL}` || `http://localhost:3000'/join/${sessionInfoFound.sessionId}`,
                isHost,
                participants: sessionInfoFound.participants,
                weeklyGoalHours: sessionInfoFound.weeklyGoalHours
            }
        })
    } catch (error) {
        console.error('Failed to get user active session:', error);
        return Response.json({ 
            success: false,
            error: "Failed to get user session" 
        }, { status: 500 });
    }
}