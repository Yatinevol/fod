import { NextRequest } from "next/server";
import { requireUser } from "@/lib/requireUser";
import GoalModel from "@/model/Goal.model";

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ goalId: string }> }
) {
  const { goalId } = await context.params;
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const goalFound = await GoalModel.findOneAndDelete({ _id: goalId, userId: auth.userId });
  if (!goalFound) {
    return Response.json(
      { success: false, message: "Goal not found or already deleted" },
      { status: 404 }
    );
  }
  return Response.json({ success: true, message: "Goal deleted" });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ goalId: string }> }
) {
  const { goalId } = await context.params;
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const update: Record<string, unknown> = {};

  if (body.isActive !== undefined) update.isActive = body.isActive;
  if (body.title !== undefined) update.title = body.title;
  if (body.deadline !== undefined) update.deadline = body.deadline;
  if (body.estimatedMinutes !== undefined) update.estimatedMinutes = body.estimatedMinutes;
  if (body.taskType !== undefined) update.taskType = body.taskType;
  if (body.status !== undefined) update.status = body.status;
  if (body.boardLane !== undefined) {
    update.boardLane = body.boardLane;
    update.lanePinned = body.lanePinned !== undefined ? body.lanePinned : true;
  }
  if (body.lanePinned !== undefined && body.boardLane === undefined) {
    update.lanePinned = body.lanePinned;
  }

  if (Object.keys(update).length === 0) {
    return Response.json(
      { success: false, message: "Nothing found to update" },
      { status: 400 }
    );
  }

  const updatedGoal = await GoalModel.findOneAndUpdate(
    { _id: goalId, userId: auth.userId },
    { $set: update },
    { new: true }
  );

  if (!updatedGoal) {
    return Response.json(
      { success: false, message: "Goal not found" },
      { status: 404 }
    );
  }

  return Response.json({
    success: true,
    message: "Goal updated",
    data: updatedGoal,
  });
}
