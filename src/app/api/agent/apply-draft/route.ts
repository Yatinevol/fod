import { AgentDraft } from "@/Types/Dashboard";
import { requireUser } from "@/lib/requireUser";
import { createTasksFromDraft } from "@/lib/planning";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser();
    if (!auth.ok) return auth.response;
    const { draft } = (await request.json()) as { draft: AgentDraft };
    if (!draft?.tasks?.length) {
      return Response.json({ success: false, message: "draft.tasks required" }, { status: 400 });
    }
    const created = await createTasksFromDraft(auth.userId, draft.tasks);
    return Response.json({
      success: true,
      message: "Plan applied",
      created,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Apply failed",
      },
      { status: 500 }
    );
  }
}
