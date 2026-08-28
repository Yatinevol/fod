"use client";

import { hoursToMinutes, storedTargetToMinutes } from "@/lib/timerUnits";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export function useTimerGoals(enabled: boolean, isSessionActive: boolean) {
  const [todayTrue, setTodayTrue] = useState(true);
  const [goalTHr, setGoalTHr] = useState(0);
  const [goalWeekHr, setGoalWeekHr] = useState(0);
  const [isTodayGoalSet, setIsTodayGoalSet] = useState(false);
  const [isWeekGoalSet, setIsWeekGoalSet] = useState(false);
  const [lockedTodayHours, setLockedTodayHours] = useState(0);
  const [lockedWeekHours, setLockedWeekHours] = useState(0);
  const [todayFocusMinutes, setTodayFocusMinutes] = useState(0);
  const [weekFocusMinutes, setWeekFocusMinutes] = useState(0);

  const focusedMinutes = todayTrue ? todayFocusMinutes : weekFocusMinutes;
  const isSet = todayTrue ? isTodayGoalSet : isWeekGoalSet;
  const currentLockedGoal = todayTrue ? lockedTodayHours : lockedWeekHours;

  const fetchGoals = useCallback(async () => {
    if (!enabled) return;
    try {
      const response = await axios.get("/api/timer");
      const tGoalS = response.data;
      if (tGoalS.todayGoal?.isTodayGoalSet) {
        const mins = storedTargetToMinutes(tGoalS.todayGoal.targetMinutes);
        setIsTodayGoalSet(true);
        setLockedTodayHours(mins / 60);
        setGoalTHr(mins / 60);
        setTodayFocusMinutes(tGoalS.todayGoal.totalFocusMinutes || 0);
      }
      if (tGoalS.weekGoal?.isWeekGoalSet) {
        const mins = storedTargetToMinutes(tGoalS.weekGoal.targetMinutes);
        setIsWeekGoalSet(true);
        setLockedWeekHours(mins / 60);
        setGoalWeekHr(mins / 60);
        setWeekFocusMinutes(tGoalS.weekGoal.totalFocusMinutes || 0);
      }
    } catch {
      toast.error("Failed to fetch goals");
    }
  }, [enabled]);

  useEffect(() => {
    void fetchGoals();
  }, [fetchGoals]);

  const persistFocus = useCallback(
    async (nextMinutes: number, isWeekly: boolean) => {
      if (isWeekly) {
        setWeekFocusMinutes(nextMinutes);
      } else {
        setTodayFocusMinutes(nextMinutes);
      }
      if (isSessionActive) return;
      try {
        await axios.post("/api/timer/update-timer", {
          isWeekly,
          focusedMinutes: nextMinutes,
        });
      } catch {
        toast.error("Failed to update progress");
      }
    },
    [isSessionActive]
  );

  const addFocusMinutes = useCallback(
    (delta: number) => {
      if (delta <= 0) return;
      const isWeekly = !todayTrue;
      if (isWeekly) {
        setWeekFocusMinutes((prev) => {
          const next = prev + delta;
          void persistFocus(next, true);
          return next;
        });
      } else {
        setTodayFocusMinutes((prev) => {
          const next = prev + delta;
          void persistFocus(next, false);
          return next;
        });
      }
    },
    [persistFocus, todayTrue]
  );

  const handleSetGoal = useCallback(async () => {
    const hours = todayTrue ? goalTHr : goalWeekHr;
    if (hours <= 0) return;
    try {
      await axios.post("/api/timer/update-timer", {
        isWeekly: !todayTrue,
        targetMinutes: hoursToMinutes(hours),
        focusedMinutes: todayTrue ? todayFocusMinutes : weekFocusMinutes,
      });
      if (todayTrue) {
        setIsTodayGoalSet(true);
        setLockedTodayHours(hours);
      } else {
        setIsWeekGoalSet(true);
        setLockedWeekHours(hours);
      }
    } catch {
      toast.error("Failed to set goal");
    }
  }, [goalTHr, goalWeekHr, todayFocusMinutes, todayTrue, weekFocusMinutes]);

  const handleEditGoal = useCallback(() => {
    if (todayTrue && lockedTodayHours) {
      setIsTodayGoalSet(false);
      setGoalTHr(lockedTodayHours);
    } else if (!todayTrue && lockedWeekHours) {
      setIsWeekGoalSet(false);
      setGoalWeekHr(lockedWeekHours);
    }
  }, [lockedTodayHours, lockedWeekHours, todayTrue]);

  return {
    todayTrue,
    setTodayTrue,
    goalTHr,
    setGoalTHr,
    goalWeekHr,
    setGoalWeekHr,
    isTodayGoalSet,
    isWeekGoalSet,
    isSet,
    currentLockedGoal,
    focusedMinutes,
    setTodayFocusMinutes,
    setWeekFocusMinutes,
    setIsWeekGoalSet,
    setLockedWeekHours,
    addFocusMinutes,
    persistFocus,
    handleSetGoal,
    handleEditGoal,
    fetchGoals,
  };
}
