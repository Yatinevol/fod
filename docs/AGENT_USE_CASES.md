# What you can do with the FOD planning agent

The dashboard box is not a general chatbot. It is a **planner**: you describe work in English, it proposes structured tasks (title, duration, deadline, Now/Next/Later), you **Approve**, then they land on the board.

**Always:** review the draft. The agent does not create tasks until you click **Approve plan**. Drag a card to pin it so later replans will not move it.

**Buttons**

| Control | Use when |
|---------|----------|
| Chat + Send | You want a new weekly/daily plan from a sentence |
| Approve plan | You accept the draft |
| Run daily agent | No prompt — retrospective, peak-window memory, replan **unpinned** cards |
| Do this now (card) | You have a gap; pick one task by score + remaining focus minutes |
| Drag on the board | You override the agent (pin) |

Copy any prompt below into the planner. Replace subjects, hours, and days with yours.

---

## 1. How to talk to it (flexible use)

Good prompts include **what**, **how long or how many**, and **when**.

```
[quantity] [kind of work] due [day], [habit] Nx, [N]hr [subject]
```

Examples of flexibility:

- **Batch:** `3 assignments due Fri`
- **Repeats:** `gym 3x this week`
- **Blocks:** `2hr DBMS revision`
- **Mix:** `OS lecture notes 45m today, then 10 LeetCode mediums by Sunday`
- **Constraint:** `No work after 9pm. Deep work only 9–11am.`
- **Replan:** `Don't add tasks. Rebalance the board. Keep pinned cards.`

If Groq is not configured, chat returns an error. Set `GROQ_API_KEY`. If Groq fails mid-call, you may still get a labelled rule-based draft — read it before approving.

Dashboard chips (Exam week, DSA, System design, Interview, Rebalance) fill the input so you do not start from a blank box.

---

## 2. Coding & CS academics

### Revision (course / semester)

```
Revise DBMS this week: ER diagrams 40m, normalization 60m, transactions 90m, indexing 45m. Exam Friday. Put the longest block in Now.
```

```
OS revision: processes 1hr, scheduling 45m, deadlock 30m, memory 1hr. 2hr past paper Sunday.
```

```
CN: OSI vs TCP/IP 30m, routing 1hr, congestion control 45m. Quiz Wednesday.
```

```
OOSE: UML 40m, design patterns 2hr (singleton, factory, observer), testing 1hr. Assignment due Thu.
```

### Concept study (learn, don't just cram)

```
Learn binary search from scratch: 25m theory, 40m 5 easy problems, 50m 3 mediums. Due tonight.
```

```
This week concept track: REST vs GraphQL 45m, HTTP caching 40m, auth cookies vs JWT 50m. Later: draw one sequence diagram.
```

```
I don't understand recursion. 3 sessions: 30m tracing, 45m tree recursion, 45m backtracking intro. Spread Mon Wed Fri.
```

### DSA / LeetCode

```
DSA this week: 10 arrays, 8 graphs, 5 DP. Estimate durations from my history. 45–60m blocks. Sunday deadline. Now = today's 3 problems.
```

```
Contest Saturday 8pm. Until then: 2 timed 45m mocks, 1hr weak-topic (DP knapsack), 30m error log review.
```

```
Blind 75 remaining: 6 trees, 4 heaps. 1hr each cluster. Don't schedule gym against these.
```

```
Only easy/medium today. 5 problems, 15m each, 10m review. Put all in Now. Later: hard DP.
```

### System design / LLD

```
System design prep: 2hr URL shortener (requirements + API + data model), 90m rate limiter, 45m mock Fri. Later: CAP theorem flashcards 20m.
```

```
LLD week: parking lot 90m, bookmyshow 2hr, logger 40m. One class diagram per topic.
```

```
Read designing data-intensive apps ch.3, 70m notes + 20m Anki. Due tomorrow evening.
```

### Projects / internships / OSS

```
Ship the FOD viva demo: 1hr timer walkthrough notes, 45m agent demo script, 30m schema diagram. Deadline tomorrow 6pm. Now = demo script.
```

```
Internship app: 3 company research 20m each, 1hr resume tailoring, 40m cover letter. Due Friday.
```

```
Side project: auth bug 90m, deploy 45m, README 25m. Later: tests.
```

### Debugging / deep work

```
I have 3 hours free. Block: reproduce bug 40m, fix 80m, regression 30m. One Now card only.
```

---

## 3. Interview prep

```
Interview in 5 days: resume bullets 40m, 3 STAR stories 60m, 1 LLD 90m, 1 DSA mock 60m. One item per day in Now.
```

```
HR round tomorrow: 6 behavioral questions, 10m each, record answers. 20m company news.
```

```
Onsite next week: 2 system design, 2 coding, 1 culture. Alternate days. Gym 3x in Later so it doesn't steal Now.
```

```
Offer compare: 45m comp spreadsheet, 30m questions for recruiter. Due tonight.
```

---

## 4. Study week / exam season

```
3 assignments due Fri, gym 3x, 2hr DBMS revision. Slot hardest academic work into my peak focus window.
```

```
Midterms: Mon DBMS, Wed OS, Fri DSA. Each subject 2hr revision + 1hr questions the evening before.
```

```
Light day: only 90m flashcards and 30m inbox. Everything else Later.
```

---

## 5. Habits, health, life (still valid)

The agent does not care that a task is “code.” Habits work the same.

```
Gym 3x, 8k steps daily label, cook 4 dinners, 7hr sleep wind-down 20m.
```

```
Admin: taxes 1hr, laundry 30m, call dentist 10m. All Later except dentist Now.
```

---

## 6. Commands that don't add a pile of tasks

Use these when the board is already full.

```
Reprioritize my board for tomorrow. Keep anything I pinned. Move overdue to Now.
```

```
I have 35 minutes. Don't add tasks — tell me what should already be in Now given my timer remaining.
```

```
Split "DBMS revision" into 3 smaller cards under 50m. Keep the original in Later or drop it.
```

(If a split doesn't appear as separate cards, say so in a follow-up: `create three separate tasks named …`)

```
Estimate how long similar DSA sessions took me, then only propose durations. Don't invent new titles except the ones I listed.
```

**Run daily agent** (no text): writes a retrospective, updates weekly peak hours from timer sessions, moves **unpinned** work. Use after a few real pomodoros so peak windows aren't empty.

---

## 7. Pair with Timer, Tasks, board

| You want | Do this |
|----------|---------|
| Plan the week | Chat prompt from this doc → Approve |
| Execute | **Do this now** or start Timer on that task |
| Track focus | Timer page; skip/complete credit **minutes** |
| Daily close | **Run daily agent** |
| Protect a plan | Drag the card (pin) |
| Raw checklist | Tasks page, then let the agent rank on next prioritize |

Focus score ≈ deadline urgency × effort × your completion rate for that type. So tagging work as `DSA`, `revision`, `interview` in the prompt (task type / category) makes later scores more honest.

---

## 8. Viva / demo script (short)

1. Chip **Exam week** → Send → show draft → Approve → cards on Now/Next/Later.
2. Drag one card → pinned.
3. **Run daily agent** → that card stays; others may move; retrospective appears.
4. Timer: lock 2h, run a short session → progress in minutes.
5. **Do this now** uses remaining target minutes.

Full architecture notes: [AGENTIC_DASHBOARD.md](./AGENTIC_DASHBOARD.md).

---

## 9. What it will not do

- It will not open LeetCode or VS Code for you.
- It will not browse the web or your calendar.
- It will not write code or explain a concept in depth (wrong tool — use notes/ChatGPT for teaching; this tool **schedules** the study).
- It will not email you; notify = in-app retrospective.
- It will not move pinned cards.

If a prompt is vague (`help me study`), add a subject, a duration, and a day. That is the whole skill.
