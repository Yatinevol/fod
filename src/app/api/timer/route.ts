import { auth } from "@/auth";
import { dbConnect } from "@/lib/dbConnect";
import { findTimerDoc } from "@/lib/timerQuery";
import { User } from "next-auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return Response.json({ message: "Unauthorized", success: false }, { status: 401 });
    }
    await dbConnect();
    const user: User = session.user;
    const [todayResult, weekResult] = await Promise.all([
      findTimerDoc(String(user._id), { isWeekly: false }),
      findTimerDoc(String(user._id), { isWeekly: true }),
    ]);

    return Response.json(
      {
        message: "week state successfully retreived",
        success: true,
        todayGoal: {
          isTodayGoalSet: Boolean(todayResult.doc),
          targetMinutes: todayResult.doc?.targetMinutes,
          totalFocusMinutes: todayResult.doc?.totalFocusMinutes,
        },
        weekGoal: {
          isWeekGoalSet: Boolean(weekResult.doc),
          targetMinutes: weekResult.doc?.targetMinutes,
          totalFocusMinutes: weekResult.doc?.totalFocusMinutes,
        },
      },
      { status: 200 }
    );
  } catch {
    return Response.json({ error: "Failed to get user goals", success: false }, { status: 500 });
  }
}
