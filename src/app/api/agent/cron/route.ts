import AgentReflectionModel from "@/model/AgentReflection.model";
import { loadDashboard } from "@/lib/loadDashboard";
import { completionSnapshot } from "@/lib/planning";
import { recomputeWeeklyPattern, replanUnpinnedForTomorrow } from "@/lib/patterns";
import { reflectionText } from "@/lib/planningAgent";
import { requireUser } from "@/lib/requireUser";
import { dbConnect } from "@/lib/dbConnect";
import { localDateKey } from "@/lib/dateKey";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json().catch(() => ({}));
    const cronSecret = request.headers.get("x-cron-secret");
    const isCron = cronSecret && cronSecret === process.env.CRON_SECRET;

    let userId: string | null = null;
    if (isCron && body.userId) {
      userId = String(body.userId);
    } else {
      const authResult = await requireUser();
      if (!authResult.ok) return authResult.response;
      userId = authResult.userId;
    }

    const mode = body.mode === "weekly" ? "weekly" : "daily";
    const dateKey = localDateKey();

    const [stats, dash, patternResult, replan] = await Promise.all([
      completionSnapshot(userId, dateKey),
      loadDashboard(userId),
      recomputeWeeklyPattern(userId),
      replanUnpinnedForTomorrow(userId),
    ]);

    const text = await reflectionText({
      streak: dash.currentStreak,
      done: stats.done,
      open: stats.open,
      missed: stats.missed,
      avgSession: patternResult.summary.averageSessionMinutes,
    });

    const adjustments = replan.peak
      ? `Moved ${replan.moved} unpinned tasks. Hardest work slotted near ${replan.peak.startHour}:00 peak window.`
      : `Rebalanced ${replan.moved} unpinned tasks for tomorrow.`;

    const reflection = await AgentReflectionModel.create({
      userId,
      dateKey,
      kind: mode,
      text,
      adjustments,
    });

    return Response.json({
      success: true,
      message: `${mode} agent run complete`,
      reflection: {
        dateKey: reflection.dateKey,
        kind: reflection.kind,
        text: reflection.text,
        adjustments: reflection.adjustments,
      },
      pattern: patternResult.summary,
      replan,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Cron agent failed",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const cronSecret = request.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || cronSecret !== process.env.CRON_SECRET) {
    return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  return Response.json({
    success: true,
    message: "POST with x-cron-secret header to run daily/weekly agent",
  });
}
