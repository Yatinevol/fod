import GoalCompletionModel from "@/model/GoalCompletion.model";
import GoalModel, { GoalI } from "@/model/Goal.model";
import { daysUntil, localDateKey } from "@/lib/dateKey";

export type ScoredGoal = {
  _id: string;
  title: string;
  category: string;
  deadline: string;
  estimatedMinutes: number;
  taskType: string;
  boardLane: "now" | "next" | "later";
  lanePinned: boolean;
  status: "open" | "done" | "abandoned";
  isActive: boolean;
  focusScore: number;
  urgency: number;
  effortWeight: number;
  completionRate: number;
};

export function urgencyFromDeadline(deadline?: string): number {
  if (!deadline) return 0.4;
  const days = daysUntil(deadline);
  if (days < 0) return 1;
  if (days === 0) return 0.95;
  return 1 / (1 + days);
}

export function effortWeight(minutes?: number): number {
  const m = minutes && minutes > 0 ? minutes : 25;
  return Math.min(2, Math.max(0.3, m / 45));
}

export async function completionRatesByType(userId: string) {
  const [completions, abandoned] = await Promise.all([
    GoalCompletionModel.find({ userId }),
    GoalModel.find({ userId, status: "abandoned" }).select("category taskType"),
  ]);

  const stats: Record<string, { done: number; total: number }> = {};
  const bump = (key: string, done: boolean) => {
    const k = key || "general";
    if (!stats[k]) stats[k] = { done: 0, total: 0 };
    stats[k].total += 1;
    if (done) stats[k].done += 1;
  };

  for (const c of completions) {
    bump("all", c.isCompleted);
  }
  for (const g of abandoned) {
    bump(g.taskType || g.category || "general", false);
    bump("all", false);
  }

  const goals = await GoalModel.find({ userId }).select("category taskType status");
  for (const g of goals) {
    if (g.status === "done") bump(g.taskType || g.category || "general", true);
  }

  const rates: Record<string, number> = {};
  for (const [key, s] of Object.entries(stats)) {
    rates[key] = s.total < 3 ? 0.6 : (s.done + 1) / (s.total + 2);
  }
  if (!rates.all) rates.all = 0.6;
  return rates;
}

export function scoreGoal(
  goal: GoalI & { _id: { toString(): string } },
  rates: Record<string, number>
): ScoredGoal {
  const typeKey = goal.taskType || goal.category || "general";
  const completionRate = rates[typeKey] ?? rates.all ?? 0.6;
  const urgency = urgencyFromDeadline(goal.deadline);
  const effort = effortWeight(goal.estimatedMinutes);
  const focusScore = Math.round(urgency * effort * completionRate * 1000) / 10;
  return {
    _id: goal._id.toString(),
    title: goal.title,
    category: goal.category,
    deadline: goal.deadline || "",
    estimatedMinutes: goal.estimatedMinutes || 25,
    taskType: typeKey,
    boardLane: goal.boardLane || "later",
    lanePinned: Boolean(goal.lanePinned),
    status: goal.status || "open",
    isActive: goal.isActive !== false,
    focusScore,
    urgency,
    effortWeight: effort,
    completionRate,
  };
}

export function pickDoThisNow(
  goals: ScoredGoal[],
  freeMinutes: number
): ScoredGoal | null {
  const open = goals
    .filter((g) => g.status === "open" && g.isActive)
    .sort((a, b) => b.focusScore - a.focusScore);
  if (!open.length) return null;
  const fit = open.find((g) => g.estimatedMinutes <= Math.max(freeMinutes, 15) * 1.25);
  return fit || open[0];
}

export async function loadScoredGoals(userId: string) {
  const [goals, rates] = await Promise.all([
    GoalModel.find({ userId, isActive: true }),
    completionRatesByType(userId),
  ]);
  return goals.map((g) => scoreGoal(g, rates));
}

export function assignLanes(goals: ScoredGoal[]): ScoredGoal[] {
  const pinned = goals.filter((g) => g.lanePinned);
  const movable = goals
    .filter((g) => !g.lanePinned && g.status === "open")
    .sort((a, b) => b.focusScore - a.focusScore);

  const nowCount = pinned.filter((g) => g.boardLane === "now").length;
  const nextCount = pinned.filter((g) => g.boardLane === "next").length;

  let nowSlots = Math.max(0, 3 - nowCount);
  let nextSlots = Math.max(0, 6 - nextCount);

  return goals.map((g) => {
    if (g.lanePinned || g.status !== "open") return g;
    const idx = movable.findIndex((m) => m._id === g._id);
    if (idx < 0) return g;
    if (idx < nowSlots) return { ...g, boardLane: "now" };
    if (idx < nowSlots + nextSlots) return { ...g, boardLane: "next" };
    return { ...g, boardLane: "later" };
  });
}

export function freeMinutesFromTimer(target?: number, focused?: number) {
  const t = target && target > 0 ? target : 25;
  const f = focused || 0;
  return Math.max(5, t - f);
}

export { localDateKey };
