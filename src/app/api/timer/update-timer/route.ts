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
    const { goalTHr, goalWeekHr, isWeekly, focusedMinutes } = await request.json();
    const today = new Date();

    if (isWeekly) {
      const weekKey = weekEndDateKey(today);
      const updatedWeekGoal = await TimerModel.findOneAndUpdate(
        { userId: user._id, date: weekKey, isWeekly: true },
        {
          $set: {
            targetMinutes: goalWeekHr,
            totalFocusMinutes: focusedMinutes,
          },
          $setOnInsert: {
            userId: user._id,
            date: weekKey,
            isWeekly: true,
          },
        },
        { new: true, upsert: true }
      );

      return Response.json(
        {
          success: true,
          message: "Weekly goal updated successfully",
          weekGoal: updatedWeekGoal,
          goalWeekHr,
          goalEnd: weekKey,
          totalFocuMinutes: updatedWeekGoal.totalFocusMinutes,
        },
        { status: 200 }
      );
    }

    const dayKey = localDateKey(today);
    const updatedGoal = await TimerModel.findOneAndUpdate(
      { userId: user._id, date: dayKey, isWeekly: false },
      {
        $set: {
          targetMinutes: goalTHr,
          totalFocusMinutes: focusedMinutes,
        },
        $setOnInsert: {
          userId: user._id,
          date: dayKey,
          isWeekly: false,
        },
      },
      { new: true, upsert: true }
    );

    return Response.json(
      {
        success: true,
        message: "Today Goal updated successfully",
        todayGoal: updatedGoal,
        goalTHr: updatedGoal?.targetMinutes,
        focusedMinutes: updatedGoal?.totalFocusMinutes,
      },
      { status: 200 }
    );
  } catch {
    return Response.json({ success: false, message: "Failed to set goal" }, { status: 500 });
  }
}
