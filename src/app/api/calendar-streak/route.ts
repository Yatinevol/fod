import { auth } from "@/auth";
import { dbConnect } from "@/lib/dbConnect";
import CalendarTickModel from "@/model/CalendarTick.model";
import { localDateKey, toDateKey } from "@/lib/dateKey";
import mongoose from "mongoose";
import { User } from "next-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    const session = await auth();
    if (!session || !session.user) {
      return Response.json({ success: false, message: "Not Authorized" }, { status: 401 });
    }
    const user: User = session.user;
    if (!user._id) {
      return Response.json(
        { success: false, message: "User ID is missing from session" },
        { status: 400 }
      );
    }

    const userId = new mongoose.Types.ObjectId(user._id);
    const ticks = await CalendarTickModel.find({ userId }).populate("goals", "title").exec();

    const data = ticks.map((t) => ({
      ...t.toObject(),
      date: toDateKey(t.date),
    }));

    return Response.json(
      {
        success: true,
        message: "Successfully fetched calendar streak data",
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Failed to fetch calendar data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
