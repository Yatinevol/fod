# FOD Agentic Dashboard — Interview Guide

**Project:** FOD (Focus on Dedication)  
**Repo path:** `dev/fod`  
**Stack:** Next.js 16 (App Router), NextAuth v5 (JWT + credentials), MongoDB + Mongoose, Groq Llama function-calling  
**What to remember:** This is not “a chatbot on a todo list.” It is a **planning agent** sitting between productivity data and a small set of **tools**, triggered **on demand** (chat) and **without a user prompt** (cron / Run daily agent). The human can always overrule the agent by dragging a card.

This document is written so you can walk into a viva and explain the system with confidence: problem, architecture, formulas, design choices, demo script, likely questions, and **every file that was built or changed**.

---

## 1. Thirty-second pitch (memorize this)

> FOD already had tasks, a Pomodoro timer, and a streak calendar. The dashboard looked empty because it only fetched completed “green ticks,” never open work, and date types were inconsistent so Mongo queries often missed rows. We rebuilt the dashboard as an **agentic Now / Next / Later board**. Each task gets a **focus score**: deadline urgency × estimated effort × your historical completion rate for similar tasks. A Groq agent parses natural language like “3 assignments due Fri, gym 3x, 2hr DBMS revision” into a **draft schedule you approve** before anything is saved. A **daily agent** can run on a cron trigger: it mines timer sessions for peak-focus hours, writes a short retrospective, and replans **unpinned** cards. If you drag a card, we set `lanePinned = true` so the next replan will not move it. That is the difference between autonomous and trustworthy.

---

## 2. Problem we actually fixed (technical, not marketing)

Before this work, the dashboard (`src/app/(with-sidebar)/dashboard/page.tsx`) only called `GET /api/calendar-streak` and listed **completed** task titles for a selected day.

That failed for several independent reasons:

1. **Wrong data source for “what should I do.”** Live tasks live in `Goal` + `GoalCompletion` (Tasks page → `/api/goal/category/...` and `/api/goal/goal-status`). The dashboard never hit those routes, so open work never appeared.

2. **Calendar date mismatch.** `CalendarTick.date` was a Mongoose `Date`, but POST wrote `'yyyy-MM-dd'` strings in UTC. The UI then did `isSameDay(selected, new Date(e.date))`. Timezones made “today” look empty even when ticks existed.

3. **Timer date mismatch.** `Timer.date` is a **String** in the schema, but GET/POST passed **JavaScript Date objects**. Focus minutes often failed to round-trip (looked like “timer not fetching”).

4. **Hard process kill.** `dbConnect` called `process.exit(1)` on Mongo failure, which can take down the Next.js server instead of returning HTTP 500.

5. **Poor error UX.** Axios 401/500 was toasted as “Failed to fetch calendar data” with no distinction between “you have no data” and “the API failed.”

**What we shipped instead:** one authenticated `GET /api/dashboard` that returns goals, completions, calendar heatmap, timer today/week, streak, Do-this-now, last agent reflection, and weekly pattern summary. All calendar days use **local `yyyy-MM-dd` strings**.

---

## 3. Architecture (draw this on the board)

```
┌─────────────────────────────────────────────────────────────────┐
│ Data signals                                                    │
│  Goals, GoalCompletion, Timer aggregates,                       │
│  FocusSession telemetry, CalendarTick heatmap                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Planning agent                                                  │
│  LLM (Groq Llama) + tool calls + structured memory              │
│  Memory: WeeklyPatternSummary in Mongo (NOT a vector DB)        │
│  Triggers: on-demand chat  |  cron / “Run daily agent”          │
└──────────┬─────────────────┬─────────────────┬──────────────────┘
           │                 │                 │
           ▼                 ▼                 ▼
     prioritize         reschedule          notify
     (focus score        (move lanes,       (persist
      → Now/Next/Later)   skip pinned)       AgentReflection)
           │                 │                 │
           └────────────┬────┴─────────────────┘
                        ▼
              Now / Next / Later board
              + Do this now card
              User can drag-override (pin)
```

### Why two triggers matter (say this to evaluators)

| Trigger | How it runs | What it proves |
|---------|-------------|----------------|
| **On-demand** | Chat box → `POST /api/agent/chat` → Groq tool loop | Reactive tool use (function calling) |
| **Autonomous** | `POST /api/agent/cron` or dashboard **Run daily agent** | Proactive behaviour with **no user prompt** |

Most student projects only show a chatbot. The cron path is what earns the word **agentic**.

### Why no vector database

The agent needs: peak hours, completion rate by task type, streak trend. That is a **structured weekly summary**, not semantic search. A vector DB is harder to defend in a viva and does not improve ranking here.

### Agent proposes, human overrides

Every goal has:

- `boardLane`: `"now"` | `"next"` | `"later"`
- `lanePinned`: boolean

**Drag** → `PATCH /api/goal/:id` with `boardLane` and `lanePinned: true`.  
**Agent / cron** only move documents where `lanePinned` is not true.

That single rule is the difference between “the AI took over my board” and “the AI suggests, I stay in control.”

---

## 4. Feature map (the five directions, as implemented)

### 4.1 Natural-language weekly planner

**User types:** `3 assignments due Fri, gym 3x, 2hr DBMS revision`

**Flow:**

1. `AgentPanel` POSTs `{ message }` to `/api/agent/chat`.
2. `runPlanningAgent` sends the message to Groq with **tools**. The model may call:
   - `estimate_durations` — average minutes from **your** completed goals of the same type
   - `list_open_slots` — next 7 days + peak-window hint from `WeeklyPatternSummary`
   - `propose_schedule` / `parse_and_create_tasks` — returns a **draft only** (`pendingApproval: true`). **No Mongo insert yet.**
   - `prioritize_board` / `reschedule` — real DB, but reschedule **skips pinned** cards
3. UI shows the draft. **Approve plan** → `POST /api/agent/apply-draft` → `createTasksFromDraft` then `prioritizeBoard`.

**Groq missing:** chat returns a **clear error** (`GROQ_API_KEY is not configured`). We do not fake a successful LLM plan.  
**Groq configured but API fails:** labelled **rule-based draft** (split on commas, parse `N hr`, map “Fri” to next Friday) so the demo still works. You must say it is a fallback.

### 4.2 Consistency-aware priority engine (Now / Next / Later)

**Formula (deterministic; no sklearn in this version):**

```
urgency        = 0.4 if no deadline
               = 1.0 if overdue
               = 0.95 if due today
               = 1 / (1 + daysUntil) otherwise

effortWeight   = clamp(estimatedMinutes / 45, 0.3, 2)   // default minutes = 25

completionRate = 0.6 prior if fewer than 3 samples for that type
               = (done + 1) / (total + 2)   // Laplace smoothing

focusScore     = round(urgency × effortWeight × completionRate × 1000) / 10
```

**Why Laplace `(done+1)/(total+2)`:** small-sample protection. A new user with one abandoned assignment should not get completionRate = 0.

**Lane assignment (`assignLanes`):**

- Pinned cards stay put and occupy Now (max 3) / Next (max 6) slots.
- Remaining **open, unpinned** tasks sorted by focus score: first 3 Now, next 6 Next, rest Later.

**Honest report sentence:** logistic regression on done vs abandoned is the **next research step**, once enough labels exist. Same features; still JavaScript; no Python microservice.

### 4.3 Autonomous daily / weekly retrospective

`POST /api/agent/cron`:

- Authenticated session user, **or** header `x-cron-secret: CRON_SECRET` plus `body.userId` for a real cron job.
- Loads today’s completion snapshot, dashboard streak, recomputes weekly pattern, replans unpinned tasks.
- Writes a 3-sentence reflection (Groq if key present, else a template).
- Saves `AgentReflection`. Dashboard shows **Agent retrospective**.

Dashboard button **Run daily agent** hits the same route with the user’s cookie so the viva works **without** deploying a scheduler.

### 4.4 Focus-pattern detection (timer telemetry)

The timer used to only upsert aggregate `totalFocusMinutes`. Now each work block also writes a `FocusSession`:

- start → `in_progress`, `hourOfDay`
- pause → `pauseCount++`
- complete / skip → `outcome: completed`
- reset → `outcome: abandoned`

`recomputeWeeklyPattern` looks at the last **14 days**, buckets by hour, scores:

```
hourScore = (completed / total) + (minutes / (total × 60))
```

Keeps the **top 3 hours** as `peakWindows`. Cron then puts the **hardest unpinned** task (largest `estimatedMinutes`) into **Now**, with a note about the peak hour.

### 4.5 “What should I do right now?”

`pickDoThisNow(goals, freeMinutes)`:

- `freeMinutes = max(5, targetMinutes − totalFocusMinutes)` (if no target, treat target as 25).
- Sort open active tasks by focus score.
- Prefer the highest-score task whose `estimatedMinutes ≤ freeMinutes × 1.25`.
- Else take the highest-score task anyway.

Shown as the large **Do this now** card. Small code, high demo impact.

---

## 5. Data model (what lives in Mongo)

| Collection | Role |
|------------|------|
| `User` | Auth |
| `Goal` | Task + board fields (`deadline`, `estimatedMinutes`, `taskType`, `boardLane`, `lanePinned`, `status`) |
| `GoalCompletion` | Per-day done/not-done (`date` = `yyyy-MM-dd`) |
| `CalendarTick` | Heatmap / streak (`date` string, populated goal titles) |
| `Timer` | Daily / weekly focus target vs actual minutes (`date` string) |
| `FocusSession` | Per-session telemetry for peak hours |
| `WeeklyPatternSummary` | Agent memory (unique `userId` + `weekStart`) |
| `AgentReflection` | Last daily/weekly write-up shown on dashboard |
| `Session` | Collaborative Pomodoro rooms (existing; unchanged conceptually) |

---

## 6. Request flow cheat sheet

**Load dashboard**

```
Browser (useSession) → GET /api/dashboard → requireUser
  → loadDashboard → Goal, GoalCompletion, CalendarTick, Timer,
    AgentReflection, WeeklyPatternSummary
  → focusScore + assignLanes + pickDoThisNow
  → JSON DashboardPayload
```

**Chat plan**

```
AgentPanel → POST /api/agent/chat → runPlanningAgent (Groq loop ≤ 6 steps)
  → tools in planning.ts (read/write except create-from-parse)
  → { reply, draft }  // draft not in DB yet
```

**Approve**

```
POST /api/agent/apply-draft → createTasksFromDraft → prioritizeBoard
```

**Daily agent**

```
POST /api/agent/cron → recomputeWeeklyPattern + replanUnpinnedForTomorrow
  + reflectionText → AgentReflection.create
```

**Drag card**

```
KanbanBoard drop → PATCH /api/goal/:id { boardLane, lanePinned: true }
```

**Timer telemetry**

```
play → POST /api/focus-session { action: start }
pause → { action: pause, sessionId }
done/skip → { action: finish, durationMinutes }
reset → { action: abandon, durationMinutes }
```

---

## 7. Environment (do not recite secrets in a viva)

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | Atlas / local Mongo |
| `AUTH_SECRET` | NextAuth JWT |
| `NEXTAUTH_URL` | Auth callbacks |
| `GROQ_API_KEY` | Required for real LLM planning |
| `GROQ_MODEL` | Default `llama-3.3-70b-versatile` |
| `CRON_SECRET` | Header for unattended cron |

---

## 8. Demo script (2–3 minutes)

1. Sign in. Open **Dashboard**. Confirm loading spinner then real data (or empty board, not a silent fail).
2. **Tasks:** add a few goals; complete some so heatmap has colour.
3. **Timer:** set a daily target, run a short session (creates `FocusSession`).
4. **Dashboard:** show **Do this now**, scores on cards, streak stats.
5. **Drag** a card to Later → badge **pinned**. Click **Run daily agent**. That card stays; others may move.
6. Chat: `3 assignments due Fri, gym 3x, 2hr DBMS revision` → show draft → **Approve plan** → new cards appear.
7. Point at **Agent retrospective** after cron.

If Groq key is unset, show the error on chat and still demo Kanban + Do this now + daily agent template text.

---

## 9. Likely interview questions (short answers)

**Q: Why is this agentic and not just ChatGPT in a box?**  
A: Tools execute against our DB with invariants (pins, approval). A **cron path runs with no chat message**. The LLM does not invent rows until the user approves a draft.

**Q: Why Groq in Next.js instead of FastAPI?**  
A: Same origin, same session cookie, one deploy. Groq is OpenAI-compatible (`/openai/v1/chat/completions` + `tools`). FastAPI would be a second service we did not need.

**Q: Why not Prisma/Postgres?**  
A: The app was already Mongoose/Mongo. Migrating storage would stall the demo without changing the agent design.

**Q: Is the focus score machine learning?**  
A: It is a **transparent multiplicative model** with a Bayesian-style prior. Logistic regression is the planned next step when we have enough done/abandoned labels. Do not claim a trained model unless you train one.

**Q: How do you stop the agent fighting the user?**  
A: `lanePinned`. `reschedule` and cron replan query `lanePinned: { $ne: true }`.

**Q: What if Groq is down?**  
A: No key → explicit error on chat. Key but API error → labelled rule-based draft. Cron → template reflection. Never silent fake success.

**Q: How did you fix “dashboard not fetching”?**  
A: Unified `/api/dashboard`; date keys as `yyyy-MM-dd`; timer queries use strings; `dbConnect` throws; UI gates on `useSession` and shows error vs empty.

**Q: Timezone?**  
A: We use **local calendar days**, not UTC `yyyy-MM-dd` from `date-fns-tz` with timezone `'UTC'`. That was a root cause of empty “today.”

**Q: Security of cron?**  
A: Unattended POST needs `x-cron-secret` matching `CRON_SECRET` plus `userId`. The dashboard button uses the logged-in session instead.

**Q: Limitations?**  
A: Peak detection is hour buckets, not a fitted 90-minute kernel. No Google Calendar OAuth. Approval is required before NL tasks are created. Production cron must be scheduled (Vercel cron, systemd, etc.).

---

## 10. Honest limitations (say these yourself — it builds trust)

- Focus score is **hand-designed**, not a fitted logistic regression (yet).
- Peak window is **hourly buckets**, not a publishable time-series paper by itself — but the pipeline (telemetry → summary table → replan) is the research-shaped story.
- `parse_and_create_tasks` does **not** write until Approve (intentional).
- Slots are pattern hints, not calendar free/busy.
- Collaborative timer sessions (`/api/session/*`) were not the focus of this agent layer.

---

## 11. Files — detailed explanation

Paths are relative to `dev/fod`.

### 11.1 Shared libraries (`src/lib/`)

#### `src/lib/dateKey.ts`

**Why it exists:** Every “day” in FOD must be the same type.

**What it does:**

- `localDateKey(date)` — local calendar day as `yyyy-MM-dd`
- `toDateKey(value)` — coerce string or Date (including ISO) to that key
- `dateKeyToLocalDate(key)` — parse at local noon (avoids DST midnight surprises)
- `addDaysKey`, `weekEndDateKey` (Sunday end of week, matching existing week-goal logic)
- `daysUntil` — integer day difference for urgency
- `localMidnight` — used when probing legacy Date documents

**Interview line:** “We stopped mixing Date objects and ISO strings.”

---

#### `src/lib/dbConnect.ts`

**Change:** On failure, **throw**. Do not `process.exit(1)`.

**Why:** Next.js API routes should return 500. Killing the process looks like “the app crashed” during a demo.

Caches `connection.isConnected` so we do not reconnect on every request.

---

#### `src/lib/requireUser.ts`

**What it does:** `await dbConnect()`, `auth()` from NextAuth.

**Return type (discriminated union):**

- `{ ok: true, userId: string }`
- `{ ok: false, response: Response }` with 401 JSON

**Why:** App Router route types reject `Promise<Response | null>`. This pattern keeps every handler type-safe.

---

#### `src/lib/timerQuery.ts`

**Problem:** Old timer rows may still have Date-like `date` values.

**What it does:** `findTimerDoc(userId, { isWeekly })` looks up by `localDateKey` / `weekEndDateKey` **or** local midnight Date.

**Interview line:** “Backward compatible with documents written before we standardized strings.”

---

#### `src/lib/focusScore.ts` — **priority engine**

**Exports:**

- `ScoredGoal` type (score + lane + pin + status)
- `urgencyFromDeadline`, `effortWeight`
- `completionRatesByType(userId)` — aggregates GoalCompletion + abandoned/done Goals
- `scoreGoal`, `loadScoredGoals`
- `assignLanes` — Now 3 / Next 6 / Later, respecting pins
- `pickDoThisNow`, `freeMinutesFromTimer`

**Interview:** Walk through the three factors and Laplace smoothing. Mention that `focusScore` is scaled to one decimal for the UI badge.

---

#### `src/lib/loadDashboard.ts` — **single read model**

**`loadDashboard(userId)`** parallel-fetches:

- scored goals
- today’s completions (mark those goals `done` in the payload)
- calendar ticks (`.populate('goals','title')`, normalize `date` via `toDateKey`)
- today + week timer via `findTimerDoc`
- latest `AgentReflection`
- latest `WeeklyPatternSummary`

Then: assign lanes for **open** tasks, compute streak from consecutive green-tick keys, `tasksThisWeek`, `pickDoThisNow`.

**`computeStreak`:** unique date keys descending; if latest is more than 1 day before today, streak is 0; else walk yesterday, day before, etc.

**`persistAssignedLanes`:** writes `boardLane` only for unpinned open goals (used after agent prioritize).

---

#### `src/lib/planning.ts` — **tool implementations (real DB)**

| Function | Behaviour |
|----------|-----------|
| `listOpenSlots` | Next 7 `dateKey`s + peak hint from latest pattern |
| `estimateDurations` | Mean `estimatedMinutes` of **done** goals by `taskType`/`category`; default 25 |
| `prioritizeBoard` | `loadScoredGoals` → `assignLanes` → `persistAssignedLanes` |
| `rescheduleTask` | If `lanePinned`, return `{ skipped: true, reason }` |
| `createTasksFromDraft` | Insert Goals then prioritize |
| `completionSnapshot` | Counts done / open / missed for a day |

This is what you mean by “the LLM does not hallucinate rows”: create happens here, on **approve**, or prioritize/reschedule with pin checks.

---

#### `src/lib/planningAgent.ts` — **Groq tool loop**

**Tools registered with Groq:**

1. `parse_and_create_tasks` — draft only  
2. `estimate_durations`  
3. `list_open_slots`  
4. `prioritize_board`  
5. `reschedule`  
6. `propose_schedule` — draft only  

**`groqChat`:** `POST https://api.groq.com/openai/v1/chat/completions`, model from `GROQ_MODEL`, `tool_choice: auto`, temperature 0.3.

**`runPlanningAgent`:** system prompt includes today’s `localDateKey` and “never claim tasks were saved until user approves.” Loop up to **6** steps: append assistant message, execute tools, append `role: tool` results.

**`fallbackDraft`:** comma-split heuristic if Groq fails **after** a key is present.

**`reflectionText`:** separate Groq call (no tools) for 3-sentence retrospective; template if no key or HTTP error.

---

#### `src/lib/patterns.ts` — **telemetry → memory → replan**

**`recomputeWeeklyPattern`:** last 14 days of `FocusSession`, hour buckets, top 3 `peakWindows`, `completionRatesByType`, upsert `WeeklyPatternSummary` for current week start (Sunday-based `weekStartKey`).

**`replanUnpinnedForTomorrow`:** open, active, **unpinned** goals sorted by `estimatedMinutes` descending. Hardest → `boardLane: now`; next five → `next`; rest → `later`.

---

### 11.2 Models (`src/model/`)

#### `src/model/Goal.model.ts`

**Kept:** `userId`, `title`, `category`, `isActive`, timestamps.

**Added:**

| Field | Type | Default | Meaning |
|-------|------|---------|---------|
| `deadline` | String | `""` | `yyyy-MM-dd` |
| `estimatedMinutes` | Number | 25 | Effort |
| `taskType` | String | `""` | Grouping for completion rate |
| `boardLane` | enum | `later` | Now / Next / Later |
| `lanePinned` | Boolean | false | Human override |
| `status` | enum | `open` | open / done / abandoned |

Mongoose `models.Goal || model(...)` avoids OverwriteModelError on hot reload.

---

#### `src/model/CalendarTick.model.ts`

`date` is **String**, required. `goals[]` ref Goal. `earnedGreenTick`, `activitiesCompleted`. Interface `PopulatedCalendarGoalI` still used conceptually for populated titles.

---

#### `src/model/Timer.model.ts`

`date: String`, `totalFocusMinutes`, `targetMinutes`, `isWeekly`. Comments leftover from unused per-task timer entries were dropped; behaviour is daily vs weekly goal documents.

---

#### `src/model/FocusSession.model.ts` (**new**)

`userId`, `startedAt`, `endedAt?`, `pauseCount`, `outcome` (`completed` | `abandoned` | `in_progress`), `hourOfDay`, `durationMinutes`.

---

#### `src/model/WeeklyPatternSummary.model.ts` (**new**)

Unique index `{ userId, weekStart }`. `peakWindows[{ startHour, endHour, score }]`, `completionByType` Mixed, `streakTrend`, `averageSessionMinutes`.

**Interview:** “This is our memory table. One document per user per week.”

---

#### `src/model/AgentReflection.model.ts` (**new**)

`dateKey`, `kind` (`daily` | `weekly`), `text`, `adjustments`. Dashboard reads the latest by `createdAt`.

---

#### Unchanged but still in the story

- `GoalCompletion.model.ts` — daily checkbox state  
- `User.model.ts` — credentials  
- `Session.model.ts` — multiplayer timer  

---

### 11.3 API routes (`src/app/api/`)

#### `src/app/api/dashboard/route.ts`

`export const dynamic = "force-dynamic"`. `GET` → `requireUser` → `loadDashboard` → `{ success, data }`. Catch returns 500 with message.

---

#### `src/app/api/agent/chat/route.ts`

`POST { message: string }`. 400 if missing. Returns `{ success, reply, draft }`. 500 with Groq/config errors.

---

#### `src/app/api/agent/apply-draft/route.ts`

`POST { draft: { tasks, summary } }`. 400 if no tasks. `createTasksFromDraft`. This is the **write** after human approval.

---

#### `src/app/api/agent/cron/route.ts`

`POST`: connect DB; parse body; if `x-cron-secret === CRON_SECRET` and `body.userId`, run as that user; else `requireUser`. Parallel: snapshot, dashboard, pattern, replan. Then `reflectionText`, `AgentReflection.create`. Returns reflection + pattern + replan.

`GET`: 401 unless cron secret; otherwise documents that POST is the runner.

---

#### `src/app/api/focus-session/route.ts`

`POST { action, sessionId?, durationMinutes? }`.

- `start` — create, return `sessionId`  
- `pause` — increment pauseCount  
- `finish` / `abandon` — set `endedAt`, duration, outcome  

---

#### `src/app/api/goal/route.ts`

`POST` create. Duplicate check is **`{ title, userId }`** (not global title). Optional `deadline`, `estimatedMinutes`, `taskType`, `boardLane`. Defaults: Later, open, unpinned.

---

#### `src/app/api/goal/[goalId]/route.ts`

`DELETE` — owner only.  
`PATCH` — title, isActive, deadline, minutes, taskType, status, `boardLane` (sets `lanePinned` true unless explicitly passed), `lanePinned` alone.

---

#### `src/app/api/goal/goal-status/route.ts`

`GET ?date=` default `localDateKey()`. Completions for that day. 401 if unauthenticated.

---

#### `src/app/api/goal/goal-status/[goalId]/route.ts`

`PATCH { isCompleted }` upserts today’s `GoalCompletion` using **local** date key (replaced UTC `toZonedTime`).

---

#### `src/app/api/calendar-streak/route.ts`

`GET` all ticks for user, populate titles, map `date` through `toDateKey`. 401 `success: false` (was incorrectly `success: true` before).

---

#### `src/app/api/calendar-streak/[goalId]/route.ts`

`POST` when a task is completed on the Tasks page. Uses `localDateKey()`. Finds existing tick by string **or** legacy Date. Pushes goal id, sets `earnedGreenTick`.

---

#### `src/app/api/timer/route.ts`

`GET` today + week via `findTimerDoc`. Shape unchanged for the Timer page: `todayGoal.isTodayGoalSet`, `targetMinutes`, `totalFocusMinutes`, same for week.

---

#### `src/app/api/timer/update-timer/route.ts`

`POST` upserts by **string** `localDateKey` or `weekEndDateKey`. `$set` target + focused minutes, `$setOnInsert` ids. This is the timer persistence fix.

---

### 11.4 UI (`src/app`, `src/components`, `src/Types`)

#### `src/app/(with-sidebar)/dashboard/page.tsx`

Client component. **`useSession`:** wait for authenticated, then fetch. Loading spinner vs **error + Retry** vs empty board.

**Refresh:** `window` `focus` event refetches (updates after completing tasks in another tab).

**Sections:**

1. Title + one-line product promise  
2. **Do this now** card (`data.doThisNow`)  
3. Last **Agent retrospective**  
4. Streak / tasks this week / consistency %  
5. `AgentPanel`  
6. `KanbanBoard`  
7. Heatmap `Calendar` + completed titles for selected day via **dateKey**, not `isSameDay(Date)`

Heatmap levels: 1–2, 3–4, 5–6, 7+ completions that day.

---

#### `src/components/dashboard/KanbanBoard.tsx`

Three columns Now / Next / Later. HTML5 `draggable` / `onDrop`. Drop calls PATCH pin. Shows category, minutes, deadline, **Score**, **pinned** badge. Empty column: “Drop tasks here.”

---

#### `src/components/dashboard/AgentPanel.tsx`

Input + send → `/api/agent/chat`. Renders `reply` and draft list. **Approve plan** → apply-draft. **Run daily agent** → `/api/agent/cron` `{ mode: "daily" }`. Toasts errors from API `message`.

---

#### `src/app/(with-sidebar)/timer/page.tsx`

Refs: `focusSessionIdRef`, `sessionStartedAtRef`.  
`startFocusSession` / `pauseFocusSession` / `endFocusSession("finish"|"abandon")` wrap `/api/focus-session`. Failures are **non-blocking** so a telemetry error does not break the timer.

Wired: play (start), pause (pause), interval complete (finish), skip (finish), reset (abandon).

---

#### `src/Types/Dashboard.ts`

Shared TypeScript contract: `DashboardPayload`, `DashboardCalendarDay`, `AgentDraft`. Keeps the dashboard page from inventing shapes.

---

## 12. One-page file map (print this)

| Concern | File |
|---------|------|
| Day keys | `src/lib/dateKey.ts` |
| Mongo connect | `src/lib/dbConnect.ts` |
| Auth helper | `src/lib/requireUser.ts` |
| Focus score + Do this now | `src/lib/focusScore.ts` |
| Dashboard aggregate | `src/lib/loadDashboard.ts` |
| Agent tools (DB) | `src/lib/planning.ts` |
| Groq loop | `src/lib/planningAgent.ts` |
| Peak hours + replan | `src/lib/patterns.ts` |
| Goal schema | `src/model/Goal.model.ts` |
| Telemetry | `src/model/FocusSession.model.ts` |
| Memory | `src/model/WeeklyPatternSummary.model.ts` |
| Notify | `src/model/AgentReflection.model.ts` |
| Dashboard API | `src/app/api/dashboard/route.ts` |
| Chat / apply / cron | `src/app/api/agent/*` |
| Focus POST | `src/app/api/focus-session/route.ts` |
| Board UI | `KanbanBoard.tsx` + dashboard page |
| Planner UI | `AgentPanel.tsx` |
| Timer hooks | `timer/page.tsx` |

---

## 13. Closing sentence for the viva

> We built a trustworthy agent: it scores tasks with a formula you can write on the board, it only writes plans after you approve, it can run overnight without a chat prompt, and if you drag a card it will never fight you on the next replan.
