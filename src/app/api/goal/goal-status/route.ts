import { auth } from "@/auth";
import { dbConnect } from "@/lib/dbConnect";
import GoalCompletionModel from "@/model/GoalCompletion.model";
import { localDateKey } from "@/lib/dateKey";
import { User } from "next-auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || localDateKey();
    if (!session || !session.user) {
      return Response.json({ success: false, message: "Not Authenticated" }, { status: 401 });
    }
    const user: User = session.user;
    const getCompletedGoals = await GoalCompletionModel.find({ userId: user._id, date });
    return Response.json(
      { success: true, message: "All todays tasks status fetched", data: getCompletedGoals },
      { status: 200 }
    );
  } catch {
    return Response.json(
      { success: false, message: "some error occured fetching the tasks" },
      { status: 500 }
    );
  }
}
