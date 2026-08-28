"use client";

import { elapsedMinutesFromSeconds, hmsToSeconds, secondsToHms } from "@/lib/timerUnits";
import { useCallback, useEffect, useRef, useState } from "react";

const COUNTDOWN_KEY = "fod_countdown";
const SETTINGS_KEY = "fod_timer_settings";

type CountdownPersist = {
  remaining: number;
  initial: number;
  endAt: number | null;
};

type SettingsPersist = {
  workHr: number;
  workMin: number;
  workSec: number;
  breakTime: number;
};

function loadSettings(): SettingsPersist {
  const fallback = { workHr: 0, workMin: 25, workSec: 0, breakTime: 5 };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as SettingsPersist;
    return {
      workHr: parsed.workHr ?? 0,
      workMin: parsed.workMin ?? 25,
      workSec: parsed.workSec ?? 0,
      breakTime: parsed.breakTime ?? 5,
    };
  } catch {
    return fallback;
  }
}

export function useCountdownTimer(onComplete: (elapsedMinutes: number) => void) {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const settings = useRef(loadSettings());
  const [breakTime, setBreakTime] = useState(settings.current.breakTime);
  const [savedHr, setSavedHr] = useState(settings.current.workHr);
  const [savedMin, setSavedMin] = useState(settings.current.workMin);
  const [savedSec, setSavedSec] = useState(settings.current.workSec);

  const [draftHr, setDraftHr] = useState(settings.current.workHr);
  const [draftMin, setDraftMin] = useState(settings.current.workMin);
  const [draftSec, setDraftSec] = useState(settings.current.workSec);
  const [isEditingTimer, setIsEditingTimer] = useState(false);

  const initialRef = useRef(hmsToSeconds(settings.current.workHr, settings.current.workMin, settings.current.workSec));
  const endAtRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    hmsToSeconds(settings.current.workHr, settings.current.workMin, settings.current.workSec)
  );
  const [isPlaying, setIsPlaying] = useState(false);

  const persist = useCallback((remaining: number, initial: number, endAt: number | null) => {
    const payload: CountdownPersist = { remaining, initial, endAt };
    localStorage.setItem(COUNTDOWN_KEY, JSON.stringify(payload));
  }, []);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const finish = useCallback(
    (remaining: number) => {
      stopInterval();
      endAtRef.current = null;
      const elapsed = elapsedMinutesFromSeconds(initialRef.current - remaining);
      localStorage.removeItem(COUNTDOWN_KEY);
      setIsPlaying(false);
      setRemainingSeconds(0);
      onCompleteRef.current(elapsed);
    },
    [stopInterval]
  );

  const tick = useCallback(() => {
    const endAt = endAtRef.current;
    if (!endAt) return;
    const remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    setRemainingSeconds(remaining);
    persist(remaining, initialRef.current, endAt);
    if (remaining <= 0) {
      finish(0);
    }
  }, [finish, persist]);

  const startInterval = useCallback(() => {
    stopInterval();
    intervalRef.current = setInterval(tick, 250);
  }, [stopInterval, tick]);

  useEffect(() => {
    const saved = localStorage.getItem(COUNTDOWN_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as CountdownPersist;
        initialRef.current = parsed.initial || initialRef.current;
        if (parsed.endAt && parsed.endAt > Date.now()) {
          endAtRef.current = parsed.endAt;
          const remaining = Math.max(0, Math.ceil((parsed.endAt - Date.now()) / 1000));
          setRemainingSeconds(remaining);
          setIsPlaying(true);
          intervalRef.current = setInterval(() => {
            const endAt = endAtRef.current;
            if (!endAt) return;
            const next = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
            setRemainingSeconds(next);
            persist(next, initialRef.current, endAt);
            if (next <= 0) {
              finish(0);
            }
          }, 250);
        } else if (parsed.remaining > 0) {
          endAtRef.current = null;
          setRemainingSeconds(parsed.remaining);
          setIsPlaying(false);
        }
      } catch {
        localStorage.removeItem(COUNTDOWN_KEY);
      }
    }
    return () => stopInterval();
    // Restore once on mount; tick uses refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const play = useCallback(() => {
    if (remainingSeconds <= 0) return false;
    const endAt = Date.now() + remainingSeconds * 1000;
    if (initialRef.current < remainingSeconds) {
      initialRef.current = remainingSeconds;
    }
    endAtRef.current = endAt;
    persist(remainingSeconds, initialRef.current, endAt);
    setIsPlaying(true);
    startInterval();
    return true;
  }, [persist, remainingSeconds, startInterval]);

  const pause = useCallback(() => {
    stopInterval();
    const endAt = endAtRef.current;
    const remaining = endAt
      ? Math.max(0, Math.ceil((endAt - Date.now()) / 1000))
      : remainingSeconds;
    endAtRef.current = null;
    setRemainingSeconds(remaining);
    setIsPlaying(false);
    persist(remaining, initialRef.current, null);
    return remaining;
  }, [persist, remainingSeconds, stopInterval]);

  const skipToBreak = useCallback(() => {
    const endAt = endAtRef.current;
    const remaining = endAt
      ? Math.max(0, Math.ceil((endAt - Date.now()) / 1000))
      : remainingSeconds;
    const elapsed = elapsedMinutesFromSeconds(initialRef.current - remaining);
    stopInterval();
    endAtRef.current = null;
    setIsPlaying(false);
    const breakSecs = Math.max(60, breakTime * 60);
    initialRef.current = breakSecs;
    setRemainingSeconds(breakSecs);
    persist(breakSecs, breakSecs, null);
    return elapsed;
  }, [breakTime, persist, remainingSeconds, stopInterval]);

  const resetToSaved = useCallback(() => {
    const endAt = endAtRef.current;
    const remaining = endAt
      ? Math.max(0, Math.ceil((endAt - Date.now()) / 1000))
      : remainingSeconds;
    const elapsed = elapsedMinutesFromSeconds(initialRef.current - remaining);
    stopInterval();
    endAtRef.current = null;
    setIsPlaying(false);
    const restored = hmsToSeconds(savedHr, savedMin, savedSec);
    initialRef.current = restored;
    setRemainingSeconds(restored);
    persist(restored, restored, null);
    return elapsed;
  }, [persist, remainingSeconds, savedHr, savedMin, savedSec, stopInterval]);

  const saveSettings = useCallback(() => {
    const next: SettingsPersist = {
      workHr: draftHr,
      workMin: draftMin,
      workSec: draftSec,
      breakTime,
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    setSavedHr(draftHr);
    setSavedMin(draftMin);
    setSavedSec(draftSec);
    if (!isPlaying) {
      const secs = hmsToSeconds(draftHr, draftMin, draftSec);
      initialRef.current = secs;
      setRemainingSeconds(secs);
      persist(secs, secs, null);
    }
    setIsEditingTimer(false);
  }, [breakTime, draftHr, draftMin, draftSec, isPlaying, persist]);

  const hms = secondsToHms(remainingSeconds);
  const progressPercentage =
    isPlaying && initialRef.current > 0
      ? ((initialRef.current - remainingSeconds) / initialRef.current) * 100
      : 0;

  return {
    remainingSeconds,
    isPlaying,
    workHr: hms.hours,
    workMin: hms.minutes,
    workSec: hms.seconds,
    breakTime,
    setBreakTime,
    savedHr,
    savedMin,
    savedSec,
    draftHr,
    draftMin,
    draftSec,
    setDraftHr,
    setDraftMin,
    setDraftSec,
    isEditingTimer,
    setIsEditingTimer,
    progressPercentage,
    play,
    pause,
    skipToBreak,
    resetToSaved,
    saveSettings,
    canPlay: remainingSeconds > 0,
  };
}
