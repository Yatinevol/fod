import { auth } from "@/auth";
import { dbConnect } from "@/lib/dbConnect";
import { Session } from "@/model/Session.model";
import { User } from "next-auth";
import { NextRequest } from "next/server";
import {nanoid} from "nanoid"
export async function POST(request:NextRequest) {
    try {
        const session = await auth()
        if(!session || !session.user){
            return Response.json({
                success: false,
                message: "Not Authenticated"
            },{status: 401})
        }

        await dbConnect();


        const user:User = session.user
        const { goalWeekHr} = await request.json()

        if(!goalWeekHr || goalWeekHr <=0){
            return Response.json({ error: "Valid weekly goal is required" }, { status: 400 })
        }

        const sessionId = nanoid(8);
        let now = new Date()
        let endOfWeek = new Date(now)
        let daysUntilSunday = (7 - now.getDay()) % 7 
        endOfWeek.setDate(now.getDate() + daysUntilSunday)
        endOfWeek.setHours(23,59,59,999)
        const newSession = await Session.create({
            sessionId,
            createdBy: user._id,
            startTime: new Date(),
            endTime:endOfWeek,
            participants:[{
                userId : session.user._id,
                username: session.user.username,
                totalFocusMinutes : 0,
                targetMinutes : goalWeekHr * 60

            }],
            weeklyGoalHours: goalWeekHr,
            isActive:true
        })
        return Response.json({
            success: true,
            sessionId,
            sessionLink: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/join/${sessionId}`,
            session: newSession
        })
    } catch (error) {
        console.error('Failed to create session:', error);
        return Response.json({ 
            success: false,
            error: "Failed to create session" 
        }, { status: 500 });
    }
}