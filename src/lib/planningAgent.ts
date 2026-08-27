import { AgentDraft } from "@/Types/Dashboard";
import {
  createTasksFromDraft,
  estimateDurations,
  listOpenSlots,
  prioritizeBoard,
  rescheduleTask,
} from "@/lib/planning";
import { addDaysKey, localDateKey } from "@/lib/dateKey";

type GroqMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
  name?: string;
};

type GroqToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

const TOOLS = [
  {
    type: "function",
    function: {
      name: "parse_and_create_tasks",
      description: "Create structured tasks from parsed user intent (returns draft only unless apply=true).",
      parameters: {
        type: "object",
        properties: {
          tasks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                category: { type: "string" },
                estimatedMinutes: { type: "number" },
                deadline: { type: "string" },
                taskType: { type: "string" },
                boardLane: { type: "string", enum: ["now", "next", "later"] },
              },
              required: ["title"],
            },
          },
          summary: { type: "string" },
        },
        required: ["tasks", "summary"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "estimate_durations",
      description: "Estimate minutes from user history by task type/category.",
      parameters: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                category: { type: "string" },
                taskType: { type: "string" },
              },
            },
          },
        },
        required: ["items"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_open_slots",
      description: "List open scheduling slots for the next week.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "prioritize_board",
      description: "Recompute Now/Next/Later lanes from focus scores (respects pins).",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "reschedule",
      description: "Move a task to a lane unless user pinned it.",
      parameters: {
        type: "object",
        properties: {
          goalId: { type: "string" },
          boardLane: { type: "string", enum: ["now", "next", "later"] },
        },
        required: ["goalId", "boardLane"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "propose_schedule",
      description: "Return a draft weekly plan for user approval (does not write DB).",
      parameters: {
        type: "object",
        properties: {
          tasks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                category: { type: "string" },
                estimatedMinutes: { type: "number" },
                deadline: { type: "string" },
                taskType: { type: "string" },
                boardLane: { type: "string" },
                slotHint: { type: "string" },
              },
            },
          },
          summary: { type: "string" },
        },
        required: ["tasks", "summary"],
      },
    },
  },
];

async function groqChat(messages: GroqMessage[], tools = TOOLS) {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error("GROQ_API_KEY is not configured. Add it to .env to use the planning agent.");
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error: ${err.slice(0, 300)}`);
  }

  return res.json();
}

function fallbackDraft(message: string): AgentDraft {
  const today = localDateKey();
  const fri = addDaysKey(today, (5 - new Date().getDay() + 7) % 7 || 7);
  const parts = message.split(/[,;]+/).map((p) => p.trim()).filter(Boolean);
  const tasks = parts.map((p, i) => ({
    title: p,
    category: "Today",
    estimatedMinutes: /(\d+)\s*hr/i.test(p)
      ? parseInt(p.match(/(\d+)\s*hr/i)![1], 10) * 60
      : 45,
    deadline: /fri/i.test(p) ? fri : "",
    taskType: "general",
    boardLane: (i < 2 ? "now" : i < 5 ? "next" : "later") as "now" | "next" | "later",
    slotHint: addDaysKey(today, i % 7),
  }));
  return {
    tasks,
    summary: "Rule-based draft (Groq unavailable or parse fallback). Review before approving.",
  };
}

async function runTool(userId: string, name: string, args: Record<string, unknown>) {
  switch (name) {
    case "estimate_durations":
      return estimateDurations(
        userId,
        (args.items as { title: string; category?: string; taskType?: string }[]) || []
      );
    case "list_open_slots":
      return listOpenSlots(userId);
    case "prioritize_board":
      return prioritizeBoard(userId);
    case "reschedule":
      return rescheduleTask(
        userId,
        String(args.goalId),
        args.boardLane as "now" | "next" | "later"
      );
    case "propose_schedule":
      return { draft: args as AgentDraft, pendingApproval: true };
    case "parse_and_create_tasks":
      return { draft: args as AgentDraft, pendingApproval: true };
    default:
      return { error: `Unknown tool ${name}` };
  }
}

export async function runPlanningAgent(userId: string, message: string) {
  const system = `You are FOD's planning agent. Parse natural-language weekly plans into structured tasks.
Use tools to estimate durations, list slots, and propose_schedule for approval (never claim tasks were saved until user approves).
Respect pinned board lanes. Today is ${localDateKey()}. Keep summaries concise.`;

  let draft: AgentDraft | null = null;
  let lastReply = "";

  try {
    let messages: GroqMessage[] = [
      { role: "system", content: system },
      { role: "user", content: message },
    ];

    for (let step = 0; step < 6; step++) {
      const data = await groqChat(messages);
      const choice = data.choices?.[0]?.message;
      if (!choice) break;

      if (choice.content) lastReply = choice.content;

      const toolCalls: GroqToolCall[] = choice.tool_calls || [];
      if (!toolCalls.length) break;

      messages.push({
        role: "assistant",
        content: choice.content || "",
      });

      for (const tc of toolCalls) {
        const fn = tc.function.name;
        let parsed: Record<string, unknown> = {};
        try {
          parsed = JSON.parse(tc.function.arguments || "{}");
        } catch {
          parsed = {};
        }
        const result = await runTool(userId, fn, parsed);
        if (result && typeof result === "object" && "draft" in result) {
          draft = result.draft as AgentDraft;
        }
        messages.push({
          role: "tool",
          tool_call_id: tc.id,
          name: fn,
          content: JSON.stringify(result),
        });
      }
    }
  } catch (error) {
    if (!process.env.GROQ_API_KEY) throw error;
    draft = fallbackDraft(message);
    lastReply =
      "Groq call failed — showing a rule-based draft you can edit after approving.\n" +
      (error instanceof Error ? error.message : "");
  }

  if (!draft) {
    draft = fallbackDraft(message);
    if (!lastReply) {
      lastReply = "Here is a draft plan based on your message. Approve to create tasks on your board.";
    }
  }

  return { reply: lastReply, draft };
}

export async function reflectionText(stats: {
  streak: number;
  done: number;
  open: number;
  missed: number;
  avgSession: number;
}) {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return `Streak ${stats.streak} days. Completed ${stats.done} today, ${stats.open} still open. Average focus session ${Math.round(stats.avgSession)} min. Tomorrow: tackle the highest-score unpinned task in your peak window.`;
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Write a 3-sentence daily retrospective and one concrete adjustment for tomorrow.",
        },
        { role: "user", content: JSON.stringify(stats) },
      ],
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    return `Completed ${stats.done} tasks today with a ${stats.streak}-day streak. ${stats.open} tasks remain — pick one high-focus item for tomorrow.`;
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "Daily review complete.";
}
