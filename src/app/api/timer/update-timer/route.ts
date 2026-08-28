import { auth } from "@/auth";
import { dbConnect } from "@/lib/dbConnect";
import { localDateKey, weekEndDateKey } from "@/lib/dateKey";
import TimerModel from "@/model/Timer.model";
import { User } from "next-auth";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return Response.json({ message: "Unauthorized", success: false }, { status: 401 });
    }
    await dbConnect();
    const user: User = session.user;
    const body = await request.json();
    const isWeekly = Boolean(body.isWeekly);
    const focusedMinutes =
      typeof body.focusedMinutes === "number" ? body.focusedMinutes : undefined;
    const targetMinutes =
      typeof body.targetMinutes === "number" ? body.targetMinutes : undefined;

    if (focusedMinutes == null && targetMinutes == null) {
      return Response.json(
        { success: false, message: "Nothing to update" },
        { status: 400 }
      );
    }

    const $set: Record<string, number> = {};
    if (focusedMinutes != null) $set.totalFocusMinutes = Math.max(0, focusedMinutes);
    if (targetMinutes != null) $set.targetMinutes = Math.max(0, targetMinutes);

    const dateKey = isWeekly ? weekEndDateKey() : localDateKey();

    const updated = await TimerModel.findOneAndUpdate(
      { userId: user._id, date: dateKey, isWeekly },
      {
        $set,
        $setOnInsert: {
          userId: user._id,
          date: dateKey,
          isWeekly,
          ...(targetMinutes == null ? { targetMinutes: 0 } : {}),
          ...(focusedMinutes == null ? { totalFocusMinutes: 0 } : {}),
        },
      },
      { new: true, upsert: true }
    );

    return Response.json(
      {
        success: true,
        message: isWeekly
          ? "Weekly goal updated successfully"
          : "Today Goal updated successfully",
        todayGoal: isWeekly ? undefined : updated,
        weekGoal: isWeekly ? updated : undefined,
        focusedMinutes: updated.totalFocusMinutes,
        targetMinutes: updated.targetMinutes,
        totalFocuMinutes: updated.totalFocusMinutes,
      },
      { status: 200 }
    );
  } catch {
    return Response.json({ success: false, message: "Failed to set goal" }, { status: 500 });
  }
}
