import FocusSessionModel from "@/model/FocusSession.model";
import GoalCompletionModel from "@/model/GoalCompletion.model";
import GoalModel from "@/model/Goal.model";
import WeeklyPatternSummaryModel, {
  PeakWindow,
} from "@/model/WeeklyPatternSummary.model";
import { addDaysKey, localDateKey } from "@/lib/dateKey";
import { completionRatesByType } from "@/lib/focusScore";

function weekStartKey(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return localDateKey(d);
}

export async function recomputeWeeklyPattern(userId: string) {
  const since = addDaysKey(localDateKey(), -14);
  const sessions = await FocusSessionModel.find({
    userId,
    startedAt: { $gte: new Date(since) },
  });

  const hourBuckets: Record<number, { completed: number; total: number; minutes: number }> =
    {};
  let totalMinutes = 0;
  let completedSessions = 0;

  for (const s of sessions) {
    const h = s.hourOfDay;
    if (!hourBuckets[h]) hourBuckets[h] = { completed: 0, total: 0, minutes: 0 };
    hourBuckets[h].total += 1;
    hourBuckets[h].minutes += s.durationMinutes || 0;
    totalMinutes += s.durationMinutes || 0;
    if (s.outcome === "completed") {
      hourBuckets[h].completed += 1;
      completedSessions += 1;
    }
  }

  const peakWindows: PeakWindow[] = Object.entries(hourBuckets)
    .map(([hour, b]) => ({
      startHour: Number(hour),
      endHour: Number(hour) + 1,
      score: b.total ? b.completed / b.total + b.minutes / (b.total * 60) : 0,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const completionByType = await completionRatesByType(userId);

  const ticks = await GoalCompletionModel.find({ userId });
  const streakTrend = ticks.filter((t) => t.isCompleted).length;

  const summary = await WeeklyPatternSummaryModel.findOneAndUpdate(
    { userId, weekStart: weekStartKey() },
    {
      $set: {
        peakWindows,
        completionByType,
        streakTrend,
        averageSessionMinutes: sessions.length ? totalMinutes / sessions.length : 0,
      },
    },
    { upsert: true, new: true }
  );

  return { summary, peakWindows, completedSessions, sessionCount: sessions.length };
}

export async function replanUnpinnedForTomorrow(userId: string) {
  const pattern = await WeeklyPatternSummaryModel.findOne({ userId }).sort({
    createdAt: -1,
  });
  const peak = pattern?.peakWindows?.[0];

  const openGoals = await GoalModel.find({
    userId,
    isActive: true,
    status: "open",
    lanePinned: { $ne: true },
  }).sort({ estimatedMinutes: -1 });

  if (!openGoals.length) return { moved: 0, peak };

  const hardest = openGoals[0];
  if (hardest) {
    hardest.boardLane = "now";
    if (peak) {
      hardest.taskType = hardest.taskType || hardest.category;
    }
    await hardest.save();
  }

  const rest = openGoals.slice(1);
  for (let i = 0; i < rest.length; i++) {
    rest[i].boardLane = i < 5 ? "next" : "later";
    await rest[i].save();
  }

  return { moved: openGoals.length, peak };
}
