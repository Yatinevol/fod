"use client";

import { ScoredGoal } from "@/lib/focusScore";
import axios from "axios";
import { GripVertical, Pin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Lane = "now" | "next" | "later";

const LANES: { id: Lane; label: string; hint: string; max: number }[] = [
  { id: "now", label: "Now", hint: "Top 1–3 picks", max: 3 },
  { id: "next", label: "Next", hint: "Queue", max: 6 },
  { id: "later", label: "Later", hint: "Backlog", max: 999 },
];

export default function KanbanBoard({
  goals,
  onLaneChange,
}: {
  goals: ScoredGoal[];
  onLaneChange: () => void;
}) {
  const [dragId, setDragId] = useState<string | null>(null);

  const openGoals = goals.filter((g) => g.status === "open" && g.isActive);

  const moveToLane = async (goalId: string, lane: Lane) => {
    try {
      await axios.patch(`/api/goal/${goalId}`, { boardLane: lane, lanePinned: true });
      toast.success(`Pinned to ${lane}`);
      onLaneChange();
    } catch {
      toast.error("Failed to move task");
    }
  };

  const onDrop = (lane: Lane) => {
    if (dragId) {
      moveToLane(dragId, lane);
      setDragId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {LANES.map((lane) => {
        const cards = openGoals.filter((g) => g.boardLane === lane.id);
        return (
          <div
            key={lane.id}
            className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 min-h-64 flex flex-col"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(lane.id)}
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800">{lane.label}</h4>
                <p className="text-xs text-slate-500">{lane.hint}</p>
              </div>
              <span className="text-xs font-semibold text-slate-400">{cards.length}</span>
            </div>
            <div className="space-y-3 flex-1">
              {cards.length === 0 && (
                <p className="text-sm text-slate-400 italic text-center py-8">Drop tasks here</p>
              )}
              {cards.map((g) => (
                <div
                  key={g._id}
                  draggable
                  onDragStart={() => setDragId(g._id)}
                  className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
                >
                  <div className="flex items-start gap-2">
                    <GripVertical size={16} className="text-slate-300 mt-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{g.title}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {g.category} · {g.estimatedMinutes}m
                        {g.deadline ? ` · due ${g.deadline}` : ""}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-violet-100 text-violet-700 px-2 py-0.5 rounded-md">
                          Score {g.focusScore}
                        </span>
                        {g.lanePinned && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-600">
                            <Pin size={10} /> pinned
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
