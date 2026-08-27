import { auth } from "@/auth";
import { dbConnect } from "@/lib/dbConnect";
import CalendarTickModel from "@/model/CalendarTick.model";
import GoalModel from "@/model/Goal.model";
import { localDateKey, toDateKey } from "@/lib/dateKey";
import { User } from "next-auth";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ goalId: string }> }
) {
  const { goalId } = await context.params;
  try {
    await dbConnect();
    const session = await auth();
    if (!session || !session.user) {
      return Response.json({ success: false, message: "Not Authenticated" }, { status: 401 });
    }

    const user: User = session.user;
    const goalExists = await GoalModel.findOne({ userId: user._id, _id: goalId });
    if (!goalExists) {
      return Response.json({ success: false, message: "Activity not found" }, { status: 400 });
    }

    const dateString = localDateKey();
    const calendarExist = await CalendarTickModel.findOne({
      userId: user._id,
      $or: [{ date: dateString }, { date: new Date(dateString) as unknown as string }],
    });

    if (!calendarExist) {
      const newDayCalendar = new CalendarTickModel({
        userId: user._id,
        goals: [goalId],
        earnedGreenTick: true,
        date: dateString,
        activitiesCompleted: 1,
      });
      await newDayCalendar.save();
      return Response.json(
        { success: true, message: "Goal completed successfully", data: newDayCalendar },
        { status: 200 }
      );
    }

    const existingKey = toDateKey(calendarExist.date);
    if (existingKey !== dateString) {
      calendarExist.date = dateString;
    }

    if (calendarExist.goals.some((id) => id.toString() === goalId)) {
      return Response.json(
        { success: true, message: "Goal status updated successfully", data: calendarExist },
        { status: 200 }
      );
    }

    calendarExist.goals.push(goalExists._id);
    calendarExist.earnedGreenTick = true;
    calendarExist.activitiesCompleted = (calendarExist.activitiesCompleted || 0) + 1;
    await calendarExist.save();

    return Response.json(
      { success: true, message: "Goal completed successfully", data: calendarExist },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Goal calendar status",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
