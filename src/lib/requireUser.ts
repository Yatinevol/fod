import { auth } from "@/auth";
import { dbConnect } from "@/lib/dbConnect";
import { NextResponse } from "next/server";

type AuthOk = { ok: true; userId: string };
type AuthFail = { ok: false; response: Response };

export async function requireUser(): Promise<AuthOk | AuthFail> {
  await dbConnect();
  const session = await auth();
  const userId = session?.user?._id;
  if (!session?.user || !userId) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      ),
    };
  }
  return { ok: true, userId };
}
