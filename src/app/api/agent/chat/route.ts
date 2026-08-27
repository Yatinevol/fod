import { requireUser } from "@/lib/requireUser";
import { runPlanningAgent } from "@/lib/planningAgent";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser();
    if (!auth.ok) return auth.response;
    const { message } = await request.json();
    if (!message || typeof message !== "string") {
      return Response.json({ success: false, message: "message is required" }, { status: 400 });
    }
    const result = await runPlanningAgent(auth.userId, message);
    return Response.json({ success: true, ...result });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Agent failed",
      },
      { status: 500 }
    );
  }
}
