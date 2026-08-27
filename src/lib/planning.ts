import GoalModel from "@/model/Goal.model";
import GoalCompletionModel from "@/model/GoalCompletion.model";
import { assignLanes, loadScoredGoals } from "@/lib/focusScore";
import { persistAssignedLanes } from "@/lib/loadDashboard";
import { addDaysKey, localDateKey } from "@/lib/dateKey";
import WeeklyPatternSummaryModel from "@/model/WeeklyPatternSummary.model";

export type DraftTask = {
  title: string;
  category: string;
  estimatedMinutes: number;
  deadline?: string;
  taskType?: string;
  boardLane?: "now" | "next" | "later";
  slotHint?: string;
};

export async function listOpenSlots(userId: string) {
  const pattern = await WeeklyPatternSummaryModel.findOne({ userId }).sort({
    createdAt: -1,
  });
  const peak = pattern?.peakWindows?.[0];
  const today = localDateKey();
  const slots = [];
  for (let i = 0; i < 7; i++) {
    const day = addDaysKey(today, i);
    slots.push({
      dateKey: day,
      hint: peak
        ? `Peak focus ~${peak.startHour}:00–${peak.endHour}:00`
        : "No peak window yet — default 90 min after 9:00",
    });
  }
  return { slots, peakWindow: peak || null };
}

export async function estimateDurations(
  userId: string,
  items: { title: string; category?: string; taskType?: string }[]
) {
  const goals = await GoalModel.find({ userId, status: "done" });
  const byType: Record<string, number[]> = {};
  for (const g of goals) {
    const key = g.taskType || g.category || "general";
    if (!byType[key]) byType[key] = [];
    byType[key].push(g.estimatedMinutes || 25);
  }
  return items.map((item) => {
    const key = item.taskType || item.category || "general";
    const hist = byType[key] || [];
    const avg = hist.length
      ? Math.round(hist.reduce((a, b) => a + b, 0) / hist.length)
      : 25;
    return { ...item, estimatedMinutes: avg };
  });
}

export async function prioritizeBoard(userId: string) {
  const scored = await loadScoredGoals(userId);
  const open = scored.filter((g) => g.status === "open");
  const laned = assignLanes(open);
  await persistAssignedLanes(userId, laned);
  return laned;
}

export async function rescheduleTask(
  userId: string,
  goalId: string,
  boardLane: "now" | "next" | "later",
  respectPin = true
) {
  const goal = await GoalModel.findOne({ _id: goalId, userId });
  if (!goal) throw new Error("Task not found");
  if (respectPin && goal.lanePinned) {
    return { skipped: true, reason: "User pinned this card; agent will not move it." };
  }
  goal.boardLane = boardLane;
  await goal.save();
  return { skipped: false, goalId, boardLane };
}

export async function createTasksFromDraft(userId: string, tasks: DraftTask[]) {
  const created = [];
  for (const t of tasks) {
    const goal = await GoalModel.create({
      userId,
      title: t.title,
      category: t.category || "Today",
      estimatedMinutes: t.estimatedMinutes || 25,
      deadline: t.deadline || "",
      taskType: t.taskType || t.category || "general",
      boardLane: t.boardLane || "later",
      lanePinned: false,
      status: "open",
      isActive: true,
    });
    created.push({
      _id: goal._id.toString(),
      title: goal.title,
      boardLane: goal.boardLane,
      estimatedMinutes: goal.estimatedMinutes,
      deadline: goal.deadline,
    });
  }
  await prioritizeBoard(userId);
  return created;
}

export async function completionSnapshot(userId: string, dateKey = localDateKey()) {
  const [done, open, missed] = await Promise.all([
    GoalCompletionModel.countDocuments({ userId, date: dateKey, isCompleted: true }),
    GoalModel.countDocuments({ userId, isActive: true, status: "open" }),
    GoalCompletionModel.countDocuments({ userId, date: dateKey, isCompleted: false }),
  ]);
  return { dateKey, done, open, missed };
}
