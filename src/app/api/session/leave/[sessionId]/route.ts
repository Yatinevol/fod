import { auth } from "@/auth";
import { Session } from "@/model/Session.model";

import { User } from "next-auth";
import { NextRequest } from "next/server";

export async function POST(request:NextRequest,context:{params:Promise<{sessionId:string}>}) {
    try {
        const {sessionId} = await context.params
        const session = await auth()
        if(!session || !session.user){
            return Response.json({
                   success: false
                 },
                { status: 401 }
            )
        }

        const user: User = session.user
        const sessionFound = await Session.findOne({
            sessionId,
            isActive:true
        })

       if(!sessionFound){
        return Response.json(
            { message: "Session not found or inactive", success: false },
            { status: 404 }
        );
       }
       if (sessionFound.createdBy.toString() === user.id) {
            return Response.json(
                { message: "Host cannot leave session. Please end the session instead.", success: false },
                { status: 403 }
            );
        }

        // Check if user is actually a participant
        const isParticipant = sessionFound.participants.some(
            p => p.userId.toString() === user._id
        );

        if (!isParticipant) {
            return Response.json(
                { message: "You are not a participant of this session", success: false },
                { status: 404 }
            );
        }

        // Remove user from participants
        const updatedSession = await Session.findOneAndUpdate(
            { sessionId },
            { $pull: { participants: { userId: user._id } } },
            { new: true }
        );

        return Response.json({
            success: true,
            message: "Left session successfully",
            isSessionActive:false,
            session: updatedSession
        });

    } catch {
        return Response.json({
            success: false,
            message: "Failed to leave session"
        }, { status: 500 });
}}