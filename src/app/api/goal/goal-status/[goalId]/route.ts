import { auth } from "@/auth";
import { dbConnect } from "@/lib/dbConnect";
import GoalCompletionModel from "@/model/GoalCompletion.model";
import { localDateKey } from "@/lib/dateKey";
import { User } from "next-auth";
import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ goalId: string }> }
) {
  try {
    await dbConnect();
    const { goalId } = await context.params;
    const { isCompleted } = await request.json();
    const session = await auth();
    if (!session || !session.user) {
      return Response.json({ success: false, message: "Not Authenticated" }, { status: 401 });
    }
    const user: User = session.user;
    const existingDate = localDateKey();

    const goalCompleted = await GoalCompletionModel.findOne({
      userId: user._id,
      goalId,
      date: existingDate,
    });

    if (goalCompleted) {
      goalCompleted.isCompleted = isCompleted;
      await goalCompleted.save();
      return Response.json(
        { success: true, message: "Task status updated successfully", data: goalCompleted },
        { status: 200 }
      );
    }

    const goalCompleteCreated = await GoalCompletionModel.create({
      userId: user._id,
      goalId,
      isCompleted,
      date: existingDate,
    });

    return Response.json(
      { success: true, message: "Task status updated", data: goalCompleteCreated },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { success: false, message: "Server error", error: String(error) },
      { status: 500 }
    );
  }
}
