import { requireUser } from "@/lib/requireUser";
import { loadDashboard } from "@/lib/loadDashboard";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireUser();
    if (!auth.ok) return auth.response;
    const data = await loadDashboard(auth.userId);
    return Response.json({ success: true, data }, { status: 200 });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Failed to load dashboard",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
