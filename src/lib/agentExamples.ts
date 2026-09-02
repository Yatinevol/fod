export type AgentExample = {
  label: string;
  prompt: string;
};

/** Short chips shown on the dashboard. Full catalog lives in docs/AGENT_USE_CASES.md */
export const AGENT_EXAMPLE_CHIPS: AgentExample[] = [
  {
    label: "Exam week",
    prompt:
      "Exam week: DBMS revision 2hr, OS notes 90m, 20 DSA problems due Fri, gym 3x. Put hardest deep work in my peak focus window.",
  },
  {
    label: "DSA grind",
    prompt:
      "DSA this week: 10 arrays, 8 graphs, 5 DP. Estimate from my history, 45–60m blocks, due Sunday. Now = today's set.",
  },
  {
    label: "System design",
    prompt:
      "Prepare system design: 2hr URL shortener notes, 90m rate limiter, mock interview 45m Fri. Later: CAP theorem flashcards.",
  },
  {
    label: "Interview",
    prompt:
      "Interview prep 5 days: resume bullets 40m, 3 behavioral stories, 1 LLD session, 1 DSA mock. Deadlines daily.",
  },
  {
    label: "Rebalance",
    prompt:
      "Reprioritize my board for tomorrow. Keep pinned cards. Move overdue work to Now. Leave gym in Later.",
  },
];
