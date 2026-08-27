import CalendarTickModel from "@/model/CalendarTick.model";
import GoalCompletionModel from "@/model/GoalCompletion.model";
import GoalModel from "@/model/Goal.model";
import AgentReflectionModel from "@/model/AgentReflection.model";
import WeeklyPatternSummaryModel from "@/model/WeeklyPatternSummary.model";
import {
  assignLanes,
  freeMinutesFromTimer,
  loadScoredGoals,
  pickDoThisNow,
  ScoredGoal,
} from "@/lib/focusScore";
import { dateKeyToLocalDate, localDateKey, toDateKey } from "@/lib/dateKey";
import { findTimerDoc } from "@/lib/timerQuery";

function computeStreak(dateKeys: string[]) {
  const unique = [...new Set(dateKeys)].sort().reverse();
  if (!unique.length) return 0;
  const today = localDateKey();
  const latest = unique[0];
  const latestDate = dateKeyToLocalDate(latest);
  const todayDate = dateKeyToLocalDate(today);
  const diff = Math.round(
    (todayDate.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff > 1) return 0;
  let streak = 0;
  let expected = diff === 0 ? today : latest;
  for (const key of unique) {
    if (key === expected) {
      streak += 1;
      const d = dateKeyToLocalDate(expected);
      d.setDate(d.getDate() - 1);
      expected = localDateKey(d);
    } else if (key < expected) {
      break;
    }
  }
  return streak;
}

export async function loadDashboard(userId: string) {
  const todayKey = localDateKey();
  const [scored, completions, ticks, todayTimer, weekTimer, reflection, pattern] =
    await Promise.all([
      loadScoredGoals(userId),
      GoalCompletionModel.find({ userId, date: todayKey }),
      CalendarTickModel.find({ userId }).populate("goals", "title").lean(),
      findTimerDoc(userId, { isWeekly: false }),
      findTimerDoc(userId, { isWeekly: true }),
      AgentReflectionModel.findOne({ userId }).sort({ createdAt: -1 }),
      WeeklyPatternSummaryModel.findOne({ userId }).sort({ createdAt: -1 }),
    ]);

  const doneIds = new Set(
    completions.filter((c) => c.isCompleted).map((c) => String(c.goalId))
  );

  const goals: ScoredGoal[] = scored.map((g) =>
    doneIds.has(g._id) ? { ...g, status: "done" } : g
  );

  const open = goals.filter((g) => g.status === "open");
  const laned = assignLanes(open);
  const laneById = new Map(laned.map((g) => [g._id, g.boardLane]));
  const withLanes = goals.map((g) =>
    g.status === "open" ? { ...g, boardLane: laneById.get(g._id) || g.boardLane } : g
  );

  const tickRows = ticks.map((t) => {
    const dateKey = toDateKey(t.date as string | Date);
    const goalTitles = (t.goals || []).map((g: unknown) => {
      if (g && typeof g === "object" && "title" in g) {
        return String((g as { title: string }).title);
      }
      return "";
    }).filter(Boolean);
    return {
      dateKey,
      earnedGreenTick: Boolean(t.earnedGreenTick),
      titles: goalTitles,
      count: goalTitles.length || t.activitiesCompleted || 0,
    };
  });

  const completeKeys = tickRows.filter((t) => t.earnedGreenTick).map((t) => t.dateKey);
  const sevenAgo = new Date();
  sevenAgo.setDate(sevenAgo.getDate() - 7);
  const sevenKey = localDateKey(sevenAgo);
  const tasksThisWeek = tickRows
    .filter((t) => t.dateKey >= sevenKey)
    .reduce((sum, t) => sum + t.count, 0);

  const target = todayTimer.doc?.targetMinutes;
  const focused = todayTimer.doc?.totalFocusMinutes;
  const freeMinutes = freeMinutesFromTimer(target, focused);
  const doThisNow = pickDoThisNow(withLanes, freeMinutes);

  return {
    todayKey,
    goals: withLanes,
    completions,
    calendar: tickRows,
    timer: {
      today: {
        isSet: Boolean(todayTimer.doc),
        targetMinutes: todayTimer.doc?.targetMinutes ?? 0,
        totalFocusMinutes: todayTimer.doc?.totalFocusMinutes ?? 0,
        dateKey: todayTimer.key,
      },
      week: {
        isSet: Boolean(weekTimer.doc),
        targetMinutes: weekTimer.doc?.targetMinutes ?? 0,
        totalFocusMinutes: weekTimer.doc?.totalFocusMinutes ?? 0,
        dateKey: weekTimer.key,
      },
      freeMinutes,
    },
    currentStreak: computeStreak(completeKeys),
    tasksThisWeek,
    doThisNow,
    lastReflection: reflection
      ? {
          dateKey: reflection.dateKey,
          kind: reflection.kind,
          text: reflection.text,
          adjustments: reflection.adjustments,
        }
      : null,
    weeklyPattern: pattern
      ? {
          weekStart: pattern.weekStart,
          peakWindows: pattern.peakWindows,
          completionByType: pattern.completionByType,
          streakTrend: pattern.streakTrend,
          averageSessionMinutes: pattern.averageSessionMinutes,
        }
      : null,
  };
}

export async function persistAssignedLanes(userId: string, goals: ScoredGoal[]) {
  await Promise.all(
    goals
      .filter((g) => !g.lanePinned && g.status === "open")
      .map((g) =>
        GoalModel.updateOne(
          { _id: g._id, userId, lanePinned: { $ne: true } },
          { $set: { boardLane: g.boardLane } }
        )
      )
  );
}
