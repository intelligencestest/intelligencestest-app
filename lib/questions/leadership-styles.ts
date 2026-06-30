export type LeadershipStyle =
  | "Visionary"
  | "Coaching"
  | "Affiliative"
  | "Democratic"
  | "Pacesetting"
  | "Commanding";

export interface LeadershipOption {
  text: string;
  style: LeadershipStyle;
}

export interface LeadershipQuestion {
  id: number;
  text: string;
  options: [LeadershipOption, LeadershipOption, LeadershipOption, LeadershipOption, LeadershipOption, LeadershipOption];
}

const options = (
  visionary: string,
  coaching: string,
  affiliative: string,
  democratic: string,
  pacesetting: string,
  commanding: string
): LeadershipQuestion["options"] => [
  { text: visionary, style: "Visionary" },
  { text: coaching, style: "Coaching" },
  { text: affiliative, style: "Affiliative" },
  { text: democratic, style: "Democratic" },
  { text: pacesetting, style: "Pacesetting" },
  { text: commanding, style: "Commanding" },
];

export const LEADERSHIP_QUESTIONS: LeadershipQuestion[] = [
  {
    id: 1,
    text: "A team is uncertain about the direction of a new initiative. What do you do first?",
    options: options("Explain a clear future direction and why it matters.", "Meet individuals to understand their growth needs.", "Create reassurance and reduce tension across the group.", "Invite the team to shape the plan together.", "Set an ambitious benchmark and model the pace.", "Define roles, deadlines, and required actions immediately."),
  },
  {
    id: 2,
    text: "A capable team member is underperforming. Your first response is to:",
    options: options("Reconnect their work to the broader mission.", "Coach them through goals, obstacles, and skills.", "Check whether personal or team friction is affecting them.", "Ask for their view and agree on next steps together.", "Show what strong execution looks like and raise the bar.", "Give direct expectations and a firm timeline for improvement."),
  },
  {
    id: 3,
    text: "Two departments disagree on priorities. You are most likely to:",
    options: options("Clarify the shared destination both groups must support.", "Help key people understand what they can learn from the conflict.", "Repair trust before pushing for a decision.", "Facilitate a decision-making conversation with both sides.", "Focus everyone on measurable output and speed.", "Make the call and require alignment."),
  },
  {
    id: 4,
    text: "When launching a difficult project, you prefer to:",
    options: options("Describe the destination and let people find paths.", "Assign stretch roles that help people develop.", "Build confidence and connection before pressure rises.", "Co-create the operating rhythm with the team.", "Set demanding standards and work at the front.", "Create a tight plan with clear non-negotiables."),
  },
  {
    id: 5,
    text: "A deadline is at risk. What style feels most natural?",
    options: options("Refocus the team on the important outcome.", "Help blockers learn how to solve similar problems faster.", "Keep morale steady so people do not shut down.", "Ask the team for the fastest realistic recovery plan.", "Increase tempo and personally demonstrate urgency.", "Make quick decisions and direct execution."),
  },
  {
    id: 6,
    text: "A new employee joins your team. You would most likely:",
    options: options("Show how their role fits the organization's future.", "Build a development plan with them.", "Help them feel welcomed and connected.", "Invite them into team discussions early.", "Give examples of excellent work to match.", "Provide precise expectations and rules."),
  },
  {
    id: 7,
    text: "Your team needs to improve quality. You start by:",
    options: options("Explaining the quality standard as part of a larger ambition.", "Developing the skills that quality depends on.", "Creating safety to discuss mistakes openly.", "Asking the team to diagnose root causes.", "Raising the standard and reviewing work closely.", "Mandating a stricter quality process."),
  },
  {
    id: 8,
    text: "In meetings, your strongest contribution is usually:",
    options: options("Helping people see the bigger picture.", "Drawing out learning and development opportunities.", "Keeping the tone constructive and respectful.", "Making sure every relevant voice is heard.", "Pushing for clear output and high standards.", "Driving decisions and assigning action items."),
  },
  {
    id: 9,
    text: "A team has become too comfortable. You respond by:",
    options: options("Painting a compelling next chapter.", "Helping people identify growth goals.", "Strengthening relationships so change feels safer.", "Asking the group what improvement should look like.", "Setting a more demanding pace.", "Changing expectations and requiring compliance."),
  },
  {
    id: 10,
    text: "A crisis happens with little warning. Your first instinct is to:",
    options: options("Remind people of the main objective.", "Coach key people through unfamiliar demands.", "Keep the group calm and connected.", "Gather fast input from those closest to the issue.", "Move quickly and model intense focus.", "Take command and issue clear instructions."),
  },
  {
    id: 11,
    text: "You receive a bold idea from a junior teammate. You would:",
    options: options("Connect it to the strategic direction.", "Help them refine and present it.", "Encourage them and protect psychological safety.", "Invite the team to evaluate it openly.", "Test it against a high performance standard.", "Decide quickly whether it should proceed."),
  },
  {
    id: 12,
    text: "When giving feedback, you tend to emphasize:",
    options: options("How the work supports the future direction.", "How the person can grow from it.", "How to preserve trust and confidence.", "How feedback can become a two-way conversation.", "How the work compares to excellence.", "What must change immediately."),
  },
  {
    id: 13,
    text: "A senior stakeholder asks for a plan you do not fully support. You:",
    options: options("Reframe around the long-term direction.", "Use it as a coaching moment for the team.", "Manage relationships carefully to reduce friction.", "Bring key people into the decision process.", "Focus on executing the strongest version possible.", "Align the team and move fast."),
  },
  {
    id: 14,
    text: "Your team is divided after a difficult change. You:",
    options: options("Explain where the change is taking the organization.", "Help individuals process and adapt.", "Prioritize rebuilding trust and belonging.", "Create forums for people to participate in solutions.", "Set new performance expectations quickly.", "Make the new rules clear and enforce them."),
  },
  {
    id: 15,
    text: "When delegating, you are most likely to:",
    options: options("Describe the outcome and strategic purpose.", "Match the task to someone's development needs.", "Consider relationships and workload balance.", "Let the group decide ownership where possible.", "Give it to the strongest performer for speed.", "Assign it directly with exact requirements."),
  },
  {
    id: 16,
    text: "The team misses an important target. You focus on:",
    options: options("Reconnecting everyone to the larger goal.", "Turning the miss into a learning plan.", "Keeping morale intact before the next push.", "Reviewing causes and solutions as a group.", "Raising discipline and performance intensity.", "Corrective action and accountability."),
  },
  {
    id: 17,
    text: "A teammate wants more responsibility. You respond by:",
    options: options("Showing how bigger ownership supports the mission.", "Creating a step-by-step growth path.", "Encouraging them and checking support needs.", "Discussing options with the team if it affects them.", "Giving a tough stretch assignment.", "Assigning responsibility with clear rules."),
  },
  {
    id: 18,
    text: "You need innovation from the group. You:",
    options: options("Set a bold vision that opens new possibilities.", "Coach people to build confidence in new skills.", "Make the environment safe for experimentation.", "Run collaborative ideation and voting.", "Push for rapid prototypes and high standards.", "Define the problem and require fast proposals."),
  },
  {
    id: 19,
    text: "When performance is strong, you usually:",
    options: options("Point to the next strategic horizon.", "Ask what people want to learn next.", "Celebrate the team and strengthen bonds.", "Invite reflection on what worked.", "Raise the bar again.", "Lock in the process that produced results."),
  },
  {
    id: 20,
    text: "If people resist your decision, you tend to:",
    options: options("Explain the purpose and future value.", "Explore what the resistance reveals about development needs.", "Listen for concerns and protect relationships.", "Reopen discussion if participation would improve buy-in.", "Refocus on results and expectations.", "Hold the line and require commitment."),
  },
  {
    id: 21,
    text: "A complex decision has no obvious answer. You:",
    options: options("Choose the path most aligned with the future direction.", "Use the decision to grow the team's judgment.", "Reduce anxiety and help people stay connected.", "Facilitate input from the right people.", "Use performance data and best-practice benchmarks.", "Make the decision and communicate it clearly."),
  },
  {
    id: 22,
    text: "Your team has low confidence. You would:",
    options: options("Show a compelling path forward.", "Coach people through achievable progress steps.", "Focus on encouragement and emotional support.", "Ask the group what would rebuild confidence.", "Set a visible standard and demonstrate success.", "Create structure so people know exactly what to do."),
  },
  {
    id: 23,
    text: "A process is inefficient. You:",
    options: options("Tie improvements to a stronger future state.", "Develop people who can improve the process.", "Make sure changes do not damage trust.", "Ask users of the process to redesign it.", "Replace weak steps with a high-output standard.", "Mandate the new process."),
  },
  {
    id: 24,
    text: "During one-on-ones, you usually spend most time on:",
    options: options("Purpose, direction, and priorities.", "Goals, feedback, and development.", "Well-being, trust, and relationships.", "Ideas, concerns, and shared decisions.", "Output, standards, and pace.", "Expectations, accountability, and blockers."),
  },
  {
    id: 25,
    text: "When a teammate makes a visible mistake, you:",
    options: options("Reconnect them to what success looks like.", "Coach the lesson and next behavior.", "Protect dignity and reduce shame.", "Invite the team to improve the system.", "Expect a quick correction and higher standard.", "Address it directly and set consequences if needed."),
  },
  {
    id: 26,
    text: "You prefer teams to experience you as:",
    options: options("Clear about direction and meaning.", "Invested in their growth.", "Supportive and relationship-centered.", "Collaborative and inclusive.", "Demanding and excellence-driven.", "Decisive and directive."),
  },
  {
    id: 27,
    text: "When priorities compete, you:",
    options: options("Choose based on the long-term vision.", "Consider which choice grows capability.", "Consider impact on team cohesion.", "Bring stakeholders together to weigh tradeoffs.", "Choose the path with the highest measurable output.", "Set the priority and stop debate."),
  },
  {
    id: 28,
    text: "A team member is ready for promotion. You:",
    options: options("Connect the promotion to future organizational needs.", "Prepare them through coaching and stretch feedback.", "Build broad support around their transition.", "Gather input from people who work with them.", "Evaluate against a very high performance bar.", "Clarify exact expectations for the next level."),
  },
  {
    id: 29,
    text: "Your default way to create accountability is to:",
    options: options("Align everyone to a meaningful destination.", "Help people own development goals.", "Build trust so people do not hide issues.", "Make commitments visible to the group.", "Track performance tightly against standards.", "Set explicit rules and consequences."),
  },
  {
    id: 30,
    text: "When leading change, you are most comfortable:",
    options: options("Creating a compelling story about where the change leads.", "Helping people build the capabilities change requires.", "Maintaining belonging and emotional stability.", "Letting people help shape the change.", "Moving quickly and proving what excellence looks like.", "Directing the change with clarity and authority."),
  },
];

export const LEADERSHIP_DURATION_SECONDS = 15 * 60;

export const LEADERSHIP_STYLES: Array<{ label: LeadershipStyle; description: string; className: string }> = [
  { label: "Visionary", description: "Sets direction and connects work to a larger future.", className: "bg-blue-500/10 text-blue-300" },
  { label: "Coaching", description: "Develops people through feedback, goals, and growth.", className: "bg-purple-500/10 text-purple-300" },
  { label: "Affiliative", description: "Builds harmony, trust, and emotional connection.", className: "bg-pink-500/10 text-pink-300" },
  { label: "Democratic", description: "Creates commitment through participation and input.", className: "bg-emerald-500/10 text-emerald-300" },
  { label: "Pacesetting", description: "Raises standards through speed and personal example.", className: "bg-cyan-500/10 text-cyan-300" },
  { label: "Commanding", description: "Provides firm direction in urgent or high-risk moments.", className: "bg-amber-500/10 text-amber-300" },
];

export function scoreLeadership(answers: (number | null)[]) {
  const counts: Record<LeadershipStyle, number> = {
    Visionary: 0,
    Coaching: 0,
    Affiliative: 0,
    Democratic: 0,
    Pacesetting: 0,
    Commanding: 0,
  };

  const selections = LEADERSHIP_QUESTIONS.map((question, index) => {
    const answer = answers[index];
    const selected = answer === null ? null : question.options[answer]?.style ?? null;
    if (selected) counts[selected] += 1;
    return {
      question_id: question.id,
      answer,
      style: selected,
    };
  });

  const dominantStyle = (Object.keys(counts) as LeadershipStyle[]).sort((a, b) => counts[b] - counts[a])[0];
  const topCount = counts[dominantStyle];
  const score = Math.round((topCount / LEADERSHIP_QUESTIONS.length) * 100);

  return {
    score,
    dominantStyle,
    counts,
    selections,
  };
}
