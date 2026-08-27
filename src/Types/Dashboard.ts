import { ScoredGoal } from "@/lib/focusScore";

export type DashboardCalendarDay = {
  dateKey: string;
  earnedGreenTick: boolean;
  titles: string[];
  count: number;
};

export type DashboardPayload = {
  todayKey: string;
  goals: ScoredGoal[];
  calendar: DashboardCalendarDay[];
  timer: {
    today: {
      isSet: boolean;
      targetMinutes: number;
      totalFocusMinutes: number;
      dateKey: string;
    };
    week: {
      isSet: boolean;
      targetMinutes: number;
      totalFocusMinutes: number;
      dateKey: string;
    };
    freeMinutes: number;
  };
  currentStreak: number;
  tasksThisWeek: number;
  doThisNow: ScoredGoal | null;
  lastReflection: {
    dateKey: string;
    kind: string;
    text: string;
    adjustments: string;
  } | null;
  weeklyPattern: {
    weekStart: string;
    peakWindows: { startHour: number; endHour: number; score: number }[];
    completionByType: Record<string, number>;
    streakTrend: number;
    averageSessionMinutes: number;
  } | null;
};

export type AgentDraft = {
  tasks: {
    title: string;
    category: string;
    estimatedMinutes: number;
    deadline?: string;
    taskType?: string;
    boardLane?: "now" | "next" | "later";
    slotHint?: string;
  }[];
  summary: string;
};
