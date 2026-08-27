"use client";

import { AgentDraft } from "@/Types/Dashboard";
import axios from "axios";
import { Bot, Loader2, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AgentPanel({ onApplied }: { onApplied: () => void }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [cronLoading, setCronLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [draft, setDraft] = useState<AgentDraft | null>(null);

  const sendChat = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setReply("");
    setDraft(null);
    try {
      const res = await axios.post("/api/agent/chat", { message });
      setReply(res.data.reply || "");
      if (res.data.draft) setDraft(res.data.draft);
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || "Agent request failed"
        : "Agent request failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const applyDraft = async () => {
    if (!draft) return;
    try {
      await axios.post("/api/agent/apply-draft", { draft });
      toast.success("Plan applied — review your board");
      setDraft(null);
      setMessage("");
      onApplied();
    } catch {
      toast.error("Failed to apply plan");
    }
  };

  const runDailyAgent = async () => {
    setCronLoading(true);
    try {
      const res = await axios.post("/api/agent/cron", { mode: "daily" });
      toast.success("Daily agent finished");
      setReply(res.data.reflection?.text || res.data.message || "Done");
      onApplied();
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || "Cron agent failed"
        : "Cron agent failed";
      toast.error(msg);
    } finally {
      setCronLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-violet-200/60 bg-white/70 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-100 text-violet-700">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Planning agent</h3>
            <p className="text-xs text-slate-500">Natural-language weekly planner</p>
          </div>
        </div>
        <button
          onClick={runDailyAgent}
          disabled={cronLoading}
          className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {cronLoading ? "Running…" : "Run daily agent"}
        </button>
      </div>

      <div className="flex gap-2 mb-3">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && sendChat()}
          placeholder='e.g. "3 assignments due Fri, gym 3x, 2hr DBMS revision"'
          className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
        />
        <button
          onClick={sendChat}
          disabled={loading || !message.trim()}
          className="px-4 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>

      {reply && (
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-700 whitespace-pre-wrap mb-3">
          {reply}
        </div>
      )}

      {draft && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <div className="flex items-center gap-2 mb-2 text-emerald-800 font-semibold text-sm">
            <Sparkles size={16} /> Draft schedule (approve to apply)
          </div>
          <p className="text-sm text-slate-600 mb-3">{draft.summary}</p>
          <ul className="text-sm space-y-1 mb-4 max-h-40 overflow-y-auto">
            {draft.tasks.map((t, i) => (
              <li key={i} className="text-slate-700">
                · {t.title} — {t.estimatedMinutes}m → {t.boardLane || "later"}
                {t.deadline ? ` (due ${t.deadline})` : ""}
              </li>
            ))}
          </ul>
          <button
            onClick={applyDraft}
            className="text-sm font-semibold px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Approve plan
          </button>
        </div>
      )}
    </div>
  );
}
