export type SJTDimension =
  | "Decision Quality"
  | "Collaboration"
  | "Accountability"
  | "Adaptability"
  | "Communication";

export interface SJTOption {
  text: string;
  score: 0 | 1 | 2 | 3;
}

export interface SJTQuestion {
  id: number;
  text: string;
  dimension: SJTDimension;
  options: [SJTOption, SJTOption, SJTOption, SJTOption];
}

export const SJT_QUESTIONS: SJTQuestion[] = [
  {
    id: 1,
    dimension: "Decision Quality",
    text: "You discover two reasonable solutions to a time-sensitive problem, but neither is perfect. What do you do?",
    options: [
      { text: "Choose the option with the clearest evidence and explain the tradeoffs.", score: 3 },
      { text: "Delay the decision until a perfect option appears.", score: 1 },
      { text: "Ask the most senior person to decide without sharing your analysis.", score: 2 },
      { text: "Pick whichever option feels fastest and move on.", score: 0 },
    ],
  },
  {
    id: 2,
    dimension: "Collaboration",
    text: "A teammate is blocking progress because they disagree with the direction. What is your best first move?",
    options: [
      { text: "Listen to their concern, clarify the shared goal, and look for a workable path.", score: 3 },
      { text: "Work around them so the project can keep moving.", score: 1 },
      { text: "Tell them the decision is already made and they need to comply.", score: 0 },
      { text: "Ask the whole group to pause and revisit every earlier decision.", score: 2 },
    ],
  },
  {
    id: 3,
    dimension: "Accountability",
    text: "You realize your mistake caused a reporting error that others may rely on. What do you do?",
    options: [
      { text: "Correct it quietly and hope nobody noticed.", score: 1 },
      { text: "Notify the affected people, correct the data, and explain prevention steps.", score: 3 },
      { text: "Wait to see if the error creates a visible problem.", score: 0 },
      { text: "Tell your manager only, without contacting users of the report.", score: 2 },
    ],
  },
  {
    id: 4,
    dimension: "Adaptability",
    text: "Priorities change halfway through a project. What response shows the best judgment?",
    options: [
      { text: "Keep working on the original plan because changing now wastes effort.", score: 0 },
      { text: "Clarify the new objective, assess impact, and adjust the plan with the team.", score: 3 },
      { text: "Start over immediately before understanding the new priority.", score: 1 },
      { text: "Ask for written confirmation before doing any more work.", score: 2 },
    ],
  },
  {
    id: 5,
    dimension: "Communication",
    text: "A stakeholder misunderstands your update and becomes frustrated. What do you do?",
    options: [
      { text: "Restate your message more firmly so they understand.", score: 1 },
      { text: "Acknowledge the confusion, clarify the key point, and confirm next steps.", score: 3 },
      { text: "Avoid more discussion until they calm down.", score: 0 },
      { text: "Send a longer explanation with every detail included.", score: 2 },
    ],
  },
  {
    id: 6,
    dimension: "Decision Quality",
    text: "You are missing one data point before a deadline. What should you do?",
    options: [
      { text: "Make an assumption and present it as fact.", score: 0 },
      { text: "State the assumption clearly, use available evidence, and flag the risk.", score: 3 },
      { text: "Refuse to submit anything until the data is complete.", score: 1 },
      { text: "Ask someone else to make the call.", score: 2 },
    ],
  },
  {
    id: 7,
    dimension: "Collaboration",
    text: "A quieter colleague has expertise but is being interrupted in a meeting. What do you do?",
    options: [
      { text: "Let the meeting continue because interruption is normal.", score: 0 },
      { text: "Privately ask them later what they would have said.", score: 2 },
      { text: "Create space in the meeting for them to finish their point.", score: 3 },
      { text: "Interrupt the interrupter aggressively.", score: 1 },
    ],
  },
  {
    id: 8,
    dimension: "Accountability",
    text: "A project is slipping because your estimate was too optimistic. What do you do?",
    options: [
      { text: "Share the updated estimate, own the miss, and propose recovery options.", score: 3 },
      { text: "Reduce quality to hit the original date without telling anyone.", score: 0 },
      { text: "Blame external dependencies first.", score: 1 },
      { text: "Ask for more time without explaining why.", score: 2 },
    ],
  },
  {
    id: 9,
    dimension: "Adaptability",
    text: "A tool you rely on stops working before a deliverable is due. What is the strongest response?",
    options: [
      { text: "Wait until the tool is fixed.", score: 0 },
      { text: "Find a workable alternative, communicate impact, and continue.", score: 3 },
      { text: "Switch tools permanently without checking consequences.", score: 1 },
      { text: "Tell the requester the deadline is impossible.", score: 2 },
    ],
  },
  {
    id: 10,
    dimension: "Communication",
    text: "You need to push back on an unrealistic request. What do you say?",
    options: [
      { text: "That cannot be done.", score: 1 },
      { text: "Yes, then privately hope the scope changes.", score: 0 },
      { text: "Here is what is possible by then, and here are the tradeoffs for the rest.", score: 3 },
      { text: "Ask them to send the request to your manager instead.", score: 2 },
    ],
  },
  {
    id: 11,
    dimension: "Decision Quality",
    text: "Two metrics tell different stories about performance. What do you do?",
    options: [
      { text: "Use the metric that supports your preferred conclusion.", score: 0 },
      { text: "Investigate why they differ and explain the limitations of each.", score: 3 },
      { text: "Ignore both metrics and rely on experience.", score: 1 },
      { text: "Average them together without checking whether that is meaningful.", score: 2 },
    ],
  },
  {
    id: 12,
    dimension: "Collaboration",
    text: "Another team asks for help when your own workload is heavy. What is the best response?",
    options: [
      { text: "Ignore the request until your own work is finished.", score: 0 },
      { text: "Say yes immediately even if it risks your commitments.", score: 1 },
      { text: "Clarify urgency, negotiate capacity, and align priorities transparently.", score: 3 },
      { text: "Forward the request to someone else without context.", score: 2 },
    ],
  },
  {
    id: 13,
    dimension: "Accountability",
    text: "You receive critical feedback that feels unfair. What should you do first?",
    options: [
      { text: "Defend your intent immediately.", score: 1 },
      { text: "Ask clarifying questions and look for the useful part of the feedback.", score: 3 },
      { text: "Dismiss it because the person lacks full context.", score: 0 },
      { text: "Accept everything without discussion.", score: 2 },
    ],
  },
  {
    id: 14,
    dimension: "Adaptability",
    text: "A new requirement conflicts with work already completed. What do you do?",
    options: [
      { text: "Assess what can be reused, what must change, and the impact on scope.", score: 3 },
      { text: "Reject the requirement because it arrived late.", score: 0 },
      { text: "Start changing the work immediately without confirming priority.", score: 1 },
      { text: "Ask for a meeting but pause all related work until then.", score: 2 },
    ],
  },
  {
    id: 15,
    dimension: "Communication",
    text: "A message you sent could be read as harsh. What is the best next step?",
    options: [
      { text: "Assume people will understand your intent.", score: 1 },
      { text: "Delete the message if possible.", score: 0 },
      { text: "Follow up with clearer tone, context, and the intended next action.", score: 3 },
      { text: "Send a long apology before knowing whether it caused an issue.", score: 2 },
    ],
  },
  {
    id: 16,
    dimension: "Decision Quality",
    text: "A senior person recommends an approach you believe has risk. What do you do?",
    options: [
      { text: "Stay silent because they are senior.", score: 0 },
      { text: "Raise the risk respectfully with evidence and alternatives.", score: 3 },
      { text: "Reject the approach in front of everyone.", score: 1 },
      { text: "Follow the approach but document that it was not your idea.", score: 2 },
    ],
  },
  {
    id: 17,
    dimension: "Collaboration",
    text: "A team decision is made, but it was not your preferred option. What do you do?",
    options: [
      { text: "Support the decision and help make it successful.", score: 3 },
      { text: "Continue arguing for your option in side conversations.", score: 0 },
      { text: "Do only your assigned part without helping others.", score: 1 },
      { text: "Ask to revisit it at every status meeting.", score: 2 },
    ],
  },
  {
    id: 18,
    dimension: "Accountability",
    text: "You notice a recurring issue in your area. What is the best action?",
    options: [
      { text: "Fix each instance as it appears.", score: 2 },
      { text: "Escalate it without suggesting a solution.", score: 1 },
      { text: "Analyze the pattern and propose a preventive improvement.", score: 3 },
      { text: "Accept it as part of how things work.", score: 0 },
    ],
  },
  {
    id: 19,
    dimension: "Adaptability",
    text: "You are assigned work in an unfamiliar domain. What do you do?",
    options: [
      { text: "Wait for detailed instructions before starting.", score: 1 },
      { text: "Identify what you need to learn, ask targeted questions, and start with a small plan.", score: 3 },
      { text: "Pretend you know enough to avoid looking unprepared.", score: 0 },
      { text: "Ask for the work to be reassigned.", score: 2 },
    ],
  },
  {
    id: 20,
    dimension: "Communication",
    text: "Your update contains bad news. What is the best structure?",
    options: [
      { text: "Start with the issue, explain impact, and provide next steps.", score: 3 },
      { text: "Hide the bad news at the end.", score: 0 },
      { text: "Only share it verbally so there is no written record.", score: 1 },
      { text: "Send a brief message that says there is a problem.", score: 2 },
    ],
  },
  {
    id: 21,
    dimension: "Decision Quality",
    text: "A customer asks for something outside policy. What do you do?",
    options: [
      { text: "Apply the policy blindly without explanation.", score: 1 },
      { text: "Break the policy to keep the customer happy.", score: 0 },
      { text: "Understand the need, explain boundaries, and offer compliant alternatives.", score: 3 },
      { text: "Send them to another department.", score: 2 },
    ],
  },
  {
    id: 22,
    dimension: "Collaboration",
    text: "A teammate takes credit for work you contributed to. What is your best first response?",
    options: [
      { text: "Publicly correct them in a way that embarrasses them.", score: 1 },
      { text: "Let resentment build and stop helping them.", score: 0 },
      { text: "Discuss it privately and clarify shared credit going forward.", score: 3 },
      { text: "Tell your manager immediately without speaking to them.", score: 2 },
    ],
  },
  {
    id: 23,
    dimension: "Accountability",
    text: "You committed to a task, but a blocker appears. What do you do?",
    options: [
      { text: "Wait until the deadline to explain the blocker.", score: 0 },
      { text: "Communicate early, share what you tried, and request the specific help needed.", score: 3 },
      { text: "Assume someone else will notice.", score: 1 },
      { text: "Drop other commitments without telling anyone.", score: 2 },
    ],
  },
  {
    id: 24,
    dimension: "Adaptability",
    text: "A familiar process is replaced with a new one. What is your strongest response?",
    options: [
      { text: "Compare the old and new process, learn the changes, and suggest improvements after use.", score: 3 },
      { text: "Keep using the old process until someone stops you.", score: 0 },
      { text: "Complain that the change was unnecessary.", score: 1 },
      { text: "Use the new process but avoid giving feedback.", score: 2 },
    ],
  },
  {
    id: 25,
    dimension: "Communication",
    text: "You need information from someone who has not responded. What do you do?",
    options: [
      { text: "Send a clear follow-up with context, deadline, and why it matters.", score: 3 },
      { text: "Keep sending the same message repeatedly.", score: 1 },
      { text: "Assume they are ignoring you and escalate immediately.", score: 0 },
      { text: "Wait and hope they reply.", score: 2 },
    ],
  },
  {
    id: 26,
    dimension: "Decision Quality",
    text: "Your team is excited about an idea, but you see a major implementation risk. What do you do?",
    options: [
      { text: "Let enthusiasm continue because morale matters most.", score: 1 },
      { text: "Name the risk, quantify it if possible, and suggest a test or mitigation.", score: 3 },
      { text: "Shut the idea down immediately.", score: 0 },
      { text: "Wait for the risk to become obvious.", score: 2 },
    ],
  },
  {
    id: 27,
    dimension: "Collaboration",
    text: "A project has too many owners and decisions are slow. What is best?",
    options: [
      { text: "Clarify decision rights, roles, and the path for unresolved issues.", score: 3 },
      { text: "Make decisions yourself to save time.", score: 1 },
      { text: "Ask everyone to be more collaborative.", score: 2 },
      { text: "Step back until ownership becomes clear.", score: 0 },
    ],
  },
  {
    id: 28,
    dimension: "Accountability",
    text: "You find a shortcut that would save time but create later maintenance risk. What do you do?",
    options: [
      { text: "Use the shortcut and document it only if someone asks.", score: 1 },
      { text: "Present the shortcut, risk, and safer alternatives before deciding.", score: 3 },
      { text: "Use it because speed is the only priority.", score: 0 },
      { text: "Avoid the shortcut without explaining the tradeoff.", score: 2 },
    ],
  },
  {
    id: 29,
    dimension: "Adaptability",
    text: "A colleague proposes a better way to do something you built. What is your response?",
    options: [
      { text: "Defend your original approach.", score: 0 },
      { text: "Evaluate the idea objectively and adopt it if it improves the outcome.", score: 3 },
      { text: "Agree publicly but keep your approach unchanged.", score: 1 },
      { text: "Ask them to prove it works before you engage.", score: 2 },
    ],
  },
  {
    id: 30,
    dimension: "Communication",
    text: "A cross-functional handoff failed because expectations were unclear. What should happen next?",
    options: [
      { text: "Create clearer acceptance criteria and confirm ownership before the next handoff.", score: 3 },
      { text: "Ask the receiving team to pay closer attention next time.", score: 0 },
      { text: "Add more people to future handoff meetings.", score: 1 },
      { text: "Write a longer summary after each handoff.", score: 2 },
    ],
  },
];

export const SJT_DURATION_SECONDS = 20 * 60;

export const SJT_DIMENSIONS: Array<{ label: SJTDimension; description: string; className: string }> = [
  { label: "Decision Quality", description: "Uses evidence, tradeoffs, and risk awareness.", className: "bg-blue-500/10 text-blue-300" },
  { label: "Collaboration", description: "Works constructively with others toward shared outcomes.", className: "bg-emerald-500/10 text-emerald-300" },
  { label: "Accountability", description: "Owns outcomes, mistakes, and follow-through.", className: "bg-amber-500/10 text-amber-300" },
  { label: "Adaptability", description: "Adjusts effectively when conditions change.", className: "bg-purple-500/10 text-purple-300" },
  { label: "Communication", description: "Clarifies context, impact, and next steps.", className: "bg-cyan-500/10 text-cyan-300" },
];

export function scoreSJT(answers: (number | null)[]) {
  const dimensions: Record<SJTDimension, { score: number; max: number }> = {
    "Decision Quality": { score: 0, max: 0 },
    Collaboration: { score: 0, max: 0 },
    Accountability: { score: 0, max: 0 },
    Adaptability: { score: 0, max: 0 },
    Communication: { score: 0, max: 0 },
  };

  const reviewed = SJT_QUESTIONS.map((question, index) => {
    const answer = answers[index];
    const selected = answer === null ? null : question.options[answer] ?? null;
    const score = selected?.score ?? 0;
    dimensions[question.dimension].score += score;
    dimensions[question.dimension].max += 3;
    return {
      question_id: question.id,
      answer,
      score,
      dimension: question.dimension,
    };
  });

  const total = Object.values(dimensions).reduce((sum, dimension) => sum + dimension.score, 0);
  const max = SJT_QUESTIONS.length * 3;
  const percentage = Math.round((total / max) * 100);

  return {
    total,
    max,
    percentage,
    dimensions,
    reviewed,
  };
}
