import FocusSessionModel from "@/model/FocusSession.model";
import { requireUser } from "@/lib/requireUser";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser();
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const action = body.action as "start" | "pause" | "finish" | "abandon";

    if (action === "start") {
      const session = await FocusSessionModel.create({
        userId: auth.userId,
        startedAt: new Date(),
        pauseCount: 0,
        outcome: "in_progress",
        hourOfDay: new Date().getHours(),
        durationMinutes: 0,
      });
      return Response.json({ success: true, sessionId: session._id.toString() });
    }

    const sessionId = body.sessionId as string;
    if (!sessionId) {
      return Response.json({ success: false, message: "sessionId required" }, { status: 400 });
    }

    const session = await FocusSessionModel.findOne({ _id: sessionId, userId: auth.userId });
    if (!session) {
      return Response.json({ success: false, message: "Session not found" }, { status: 404 });
    }

    if (action === "pause") {
      session.pauseCount = (session.pauseCount || 0) + 1;
      await session.save();
      return Response.json({ success: true, pauseCount: session.pauseCount });
    }

    const durationMinutes = Number(body.durationMinutes) || 0;
    session.endedAt = new Date();
    session.durationMinutes = durationMinutes;
    session.outcome = action === "finish" ? "completed" : "abandoned";
    await session.save();

    return Response.json({ success: true, outcome: session.outcome });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Focus session error",
      },
      { status: 500 }
    );
  }
}
