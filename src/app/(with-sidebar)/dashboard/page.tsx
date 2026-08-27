"use client";

import AgentPanel from "@/components/dashboard/AgentPanel";
import KanbanBoard from "@/components/dashboard/KanbanBoard";
import { Calendar } from "@/components/ui/calendar";
import { DashboardPayload } from "@/Types/Dashboard";
import { dateKeyToLocalDate, localDateKey } from "@/lib/dateKey";
import axios from "axios";
import { format } from "date-fns";
import { enGB } from "date-fns/locale";
import {
  CheckCircle2,
  Flame,
  Loader2,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function heatmapLevel(count: number) {
  if (count >= 7) return 4;
  if (count >= 5) return 3;
  if (count >= 3) return 2;
  if (count >= 1) return 1;
  return 0;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [date, setDate] = useState<Date>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardPayload | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!session?.user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<{ success: boolean; data: DashboardPayload; message?: string }>(
        "/api/dashboard"
      );
      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to load dashboard");
      }
      setData(res.data.data);
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : "Failed to load dashboard";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

  useEffect(() => {
    if (status === "authenticated") {
      setDate(new Date());
      fetchDashboard();
    }
  }, [status, fetchDashboard]);

  useEffect(() => {
    const onFocus = () => fetchDashboard();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchDashboard]);

  const calendarModifiers = useMemo(() => {
    if (!data?.calendar) return { level1: [], level2: [], level3: [], level4: [] };
    const level1: Date[] = [];
    const level2: Date[] = [];
    const level3: Date[] = [];
    const level4: Date[] = [];
    for (const day of data.calendar) {
      if (!day.earnedGreenTick) continue;
      const d = dateKeyToLocalDate(day.dateKey);
      const lvl = heatmapLevel(day.count);
      if (lvl === 1) level1.push(d);
      else if (lvl === 2) level2.push(d);
      else if (lvl === 3) level3.push(d);
      else if (lvl === 4) level4.push(d);
    }
    return { level1, level2, level3, level4 };
  }, [data?.calendar]);

  const selectedDayTitles = useMemo(() => {
    if (!date || !data?.calendar) return [];
    const key = localDateKey(date);
    const row = data.calendar.find((c) => c.dateKey === key);
    return row?.titles || [];
  }, [date, data?.calendar]);

  const consistencyScore = useMemo(() => {
    if (!data) return 0;
    const activeDays = data.calendar.filter((c) => c.earnedGreenTick).length;
    if (!activeDays) return 0;
    return Math.min(100, Math.round((data.currentStreak / activeDays) * 100));
  }, [data]);

  if (status === "loading" || (loading && !data)) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="animate-spin text-violet-600" size={32} />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 font-semibold mb-2">{error}</p>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col space-y-10 p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col space-y-3 bg-white/60 backdrop-blur-xl border border-slate-200/60 p-8 rounded-3xl shadow-xl">
        <h1 className="text-4xl font-black text-slate-900">Dashboard</h1>
        <p className="text-slate-500 font-medium text-lg">
          Agent-powered Now / Next / Later — you can always override by dragging.
        </p>
      </div>

      {data.doThisNow && (
        <div className="rounded-3xl border-2 border-violet-300 bg-linear-to-br from-violet-50 to-fuchsia-50 p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-violet-600 text-white">
              <Zap size={24} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-violet-600 mb-1">
                Do this now
              </p>
              <h2 className="text-2xl font-black text-slate-900">{data.doThisNow.title}</h2>
              <p className="text-slate-600 mt-1">
                {data.doThisNow.estimatedMinutes} min · score {data.doThisNow.focusScore} ·{" "}
                {data.timer.freeMinutes} min free today
              </p>
            </div>
            <Sparkles className="text-violet-400 shrink-0" />
          </div>
        </div>
      )}

      {data.lastReflection && (
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Agent retrospective
          </p>
          <p className="text-slate-700 text-sm">{data.lastReflection.text}</p>
          {data.lastReflection.adjustments && (
            <p className="text-xs text-violet-700 mt-2">{data.lastReflection.adjustments}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard
          icon={<Flame size={32} className={data.currentStreak > 0 ? "animate-pulse" : ""} />}
          label="Current Streak"
          value={String(data.currentStreak)}
          suffix="days"
          accent="orange"
        />
        <StatCard
          icon={<CheckCircle2 size={32} />}
          label="Tasks This Week"
          value={String(data.tasksThisWeek)}
          suffix="completed"
          accent="teal"
        />
        <StatCard
          icon={<Trophy size={32} />}
          label="Consistency Score"
          value={`${consistencyScore}`}
          suffix="% success"
          accent="blue"
        />
      </div>

      <AgentPanel onApplied={fetchDashboard} />

      <div className="rounded-3xl border border-slate-200/60 bg-white/60 p-6 shadow-lg">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Now / Next / Later</h3>
        <KanbanBoard goals={data.goals} onLaneChange={fetchDashboard} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-slate-200/60 p-8 flex flex-col items-center">
          <h3 className="text-xl font-bold text-slate-800 flex items-center mb-6 w-full">
            <Target className="text-blue-600 mr-2" size={22} /> Consistency
          </h3>
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => d && setDate(d)}
            locale={enGB}
            modifiers={{
              ...calendarModifiers,
              today: [new Date()],
              selected: date ? [date] : [],
            }}
            modifiersClassNames={{
              level1: "!bg-sky-100 !text-sky-900",
              level2: "!bg-sky-300 !text-sky-950",
              level3: "!bg-blue-500 !text-white",
              level4: "!bg-blue-700 !text-white",
              today: "!border-2 !border-blue-400",
              selected: "ring-2 ring-slate-800",
            }}
          />
        </div>

        <div className="lg:col-span-2 rounded-3xl border border-slate-200/60 bg-white/60 p-8">
          <h3 className="text-2xl font-black text-slate-800 mb-2">
            {date ? format(date, "MMMM d, yyyy") : "Selected date"}
          </h3>
          <p className="text-slate-500 text-sm mb-6">Completed on this day</p>
          {selectedDayTitles.length === 0 ? (
            <p className="text-slate-400 italic">No completed tasks on this day.</p>
          ) : (
            <ul className="space-y-3">
              {selectedDayTitles.map((title, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-100"
                >
                  <CheckCircle2 className="text-emerald-500" size={20} />
                  <span className="font-semibold text-slate-700">{title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  suffix,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  suffix: string;
  accent: "orange" | "teal" | "blue";
}) {
  const colors = {
    orange: "from-orange-100 to-orange-50 text-orange-600 border-orange-200/50",
    teal: "from-teal-100 to-teal-50 text-teal-600 border-teal-200/50",
    blue: "from-blue-100 to-blue-50 text-blue-600 border-blue-200/50",
  };
  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-slate-200/60 flex items-center space-x-6">
      <div className={`p-4 bg-linear-to-br rounded-2xl border ${colors[accent]}`}>{icon}</div>
      <div>
        <p className="text-sm font-bold tracking-wider text-slate-500 uppercase mb-1">{label}</p>
        <div className="flex items-baseline space-x-2">
          <h2 className="text-4xl font-black text-slate-800">{value}</h2>
          <span className="text-base font-semibold text-slate-400">{suffix}</span>
        </div>
      </div>
    </div>
  );
}
