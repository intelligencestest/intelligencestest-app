export interface Candidate {
  id: string;
  name: string;
  email: string;
  project: string;
  projectId: string;
  status: "invited" | "started" | "completed";
  score?: number;
  invitedAt: string;
  completedAt?: string;
  avatar: string;
}

export interface Project {
  id: string;
  name: string;
  role: string;
  department: string;
  status: "active" | "draft" | "archived";
  candidateCount: number;
  completedCount: number;
  createdAt: string;
  deadline: string;
  description: string;
  assessments: string[];
}

export interface Assessment {
  id: string;
  name: string;
  category: "Cognitive" | "Personality" | "Technical" | "Leadership" | "Emotional Intelligence";
  description: string;
  duration: number;
  questionCount: number;
  usageCount: number;
}

export interface ActivityItem {
  id: string;
  type: "candidate_invited" | "candidate_completed" | "project_created" | "report_ready";
  message: string;
  time: string;
  actor?: string;
}

export const mockCandidates: Candidate[] = [
  { id: "c1", name: "Sarah Mitchell", email: "s.mitchell@email.com", project: "Senior Frontend Engineer", projectId: "p1", status: "completed", score: 87, invitedAt: "2025-06-10", completedAt: "2025-06-12", avatar: "SM" },
  { id: "c2", name: "James Okonkwo", email: "j.okonkwo@email.com", project: "Senior Frontend Engineer", projectId: "p1", status: "completed", score: 74, invitedAt: "2025-06-10", completedAt: "2025-06-14", avatar: "JO" },
  { id: "c3", name: "Priya Sharma", email: "p.sharma@email.com", project: "Product Manager – Growth", projectId: "p2", status: "started", invitedAt: "2025-06-15", avatar: "PS" },
  { id: "c4", name: "Carlos Rivera", email: "c.rivera@email.com", project: "Product Manager – Growth", projectId: "p2", status: "invited", invitedAt: "2025-06-18", avatar: "CR" },
  { id: "c5", name: "Emma Larsson", email: "e.larsson@email.com", project: "Data Analyst", projectId: "p3", status: "completed", score: 91, invitedAt: "2025-06-05", completedAt: "2025-06-07", avatar: "EL" },
  { id: "c6", name: "Michael Chen", email: "m.chen@email.com", project: "Senior Frontend Engineer", projectId: "p1", status: "invited", invitedAt: "2025-06-20", avatar: "MC" },
  { id: "c7", name: "Aisha Diallo", email: "a.diallo@email.com", project: "Data Analyst", projectId: "p3", status: "completed", score: 68, invitedAt: "2025-06-05", completedAt: "2025-06-09", avatar: "AD" },
  { id: "c8", name: "Tom Eriksen", email: "t.eriksen@email.com", project: "Marketing Lead", projectId: "p4", status: "started", invitedAt: "2025-06-22", avatar: "TE" },
  { id: "c9", name: "Fatima Al-Hassan", email: "f.alhassan@email.com", project: "Marketing Lead", projectId: "p4", status: "invited", invitedAt: "2025-06-22", avatar: "FA" },
  { id: "c10", name: "Liam O'Brien", email: "l.obrien@email.com", project: "Product Manager – Growth", projectId: "p2", status: "completed", score: 82, invitedAt: "2025-06-12", completedAt: "2025-06-16", avatar: "LO" },
];

export const mockProjects: Project[] = [
  { id: "p1", name: "Senior Frontend Engineer", role: "Frontend Engineer", department: "Engineering", status: "active", candidateCount: 3, completedCount: 2, createdAt: "2025-06-08", deadline: "2025-07-01", description: "Hiring a senior frontend engineer with React and TypeScript expertise for the core product team.", assessments: ["a1", "a3", "a4"] },
  { id: "p2", name: "Product Manager – Growth", role: "Product Manager", department: "Product", status: "active", candidateCount: 3, completedCount: 1, createdAt: "2025-06-12", deadline: "2025-07-10", description: "Looking for a growth-focused PM to lead our B2B expansion initiative.", assessments: ["a1", "a2", "a5"] },
  { id: "p3", name: "Data Analyst", role: "Data Analyst", department: "Analytics", status: "active", candidateCount: 2, completedCount: 2, createdAt: "2025-06-03", deadline: "2025-06-25", description: "Data analyst with strong SQL and Python skills for the business intelligence team.", assessments: ["a1", "a3"] },
  { id: "p4", name: "Marketing Lead", role: "Marketing Manager", department: "Marketing", status: "active", candidateCount: 2, completedCount: 0, createdAt: "2025-06-20", deadline: "2025-07-20", description: "Senior marketing lead to own brand strategy and demand generation.", assessments: ["a2", "a5", "a6"] },
  { id: "p5", name: "Backend Engineer (Node.js)", role: "Backend Engineer", department: "Engineering", status: "draft", candidateCount: 0, completedCount: 0, createdAt: "2025-06-24", deadline: "2025-07-31", description: "Node.js backend engineer to scale our API infrastructure.", assessments: ["a1", "a4"] },
  { id: "p6", name: "Head of Customer Success", role: "Customer Success Manager", department: "Customer Success", status: "archived", candidateCount: 5, completedCount: 5, createdAt: "2025-05-01", deadline: "2025-06-01", description: "Leadership role for the customer success org. Closed.", assessments: ["a2", "a5", "a6"] },
];

export const mockAssessments: Assessment[] = [
  { id: "a1", name: "Logical Reasoning", category: "Cognitive", description: "Evaluates abstract reasoning, pattern recognition, and problem-solving under time pressure.", duration: 25, questionCount: 30, usageCount: 14 },
  { id: "a2", name: "Big Five Personality Profile", category: "Personality", description: "Measures openness, conscientiousness, extraversion, agreeableness, and neuroticism (OCEAN).", duration: 20, questionCount: 50, usageCount: 11 },
  { id: "a3", name: "Numerical Aptitude", category: "Cognitive", description: "Tests numerical data interpretation, mental arithmetic, and statistical reasoning.", duration: 20, questionCount: 25, usageCount: 8 },
  { id: "a4", name: "Technical Problem Solving", category: "Technical", description: "Practical coding challenges and system design questions tailored for software roles.", duration: 60, questionCount: 10, usageCount: 6 },
  { id: "a5", name: "Leadership Styles Inventory", category: "Leadership", description: "Identifies dominant leadership styles, decision-making patterns, and motivational drivers.", duration: 15, questionCount: 40, usageCount: 9 },
  { id: "a6", name: "Emotional Quotient (EQ) Assessment", category: "Emotional Intelligence", description: "Measures self-awareness, empathy, regulation, and social skill for people-facing roles.", duration: 18, questionCount: 35, usageCount: 7 },
  { id: "a7", name: "Verbal Comprehension", category: "Cognitive", description: "Assesses reading comprehension, vocabulary range, and written communication clarity.", duration: 15, questionCount: 20, usageCount: 5 },
  { id: "a8", name: "Work Motivation Survey", category: "Personality", description: "Uncovers intrinsic and extrinsic motivation, role fit, and long-term retention risk.", duration: 12, questionCount: 28, usageCount: 4 },
  { id: "a9", name: "Situational Judgment Test", category: "Leadership", description: "Scenario-based test evaluating judgment in complex, ambiguous workplace situations.", duration: 30, questionCount: 20, usageCount: 3 },
];

export const mockActivity: ActivityItem[] = [
  { id: "act1", type: "candidate_completed", message: "Emma Larsson completed the Data Analyst assessment with a score of 91", time: "2 hours ago", actor: "Emma Larsson" },
  { id: "act2", type: "candidate_invited", message: "Michael Chen was invited to Senior Frontend Engineer assessment", time: "5 hours ago" },
  { id: "act3", type: "candidate_completed", message: "Liam O'Brien completed the PM – Growth assessment with a score of 82", time: "1 day ago", actor: "Liam O'Brien" },
  { id: "act4", type: "project_created", message: "New project 'Backend Engineer (Node.js)' was created", time: "2 days ago" },
  { id: "act5", type: "candidate_invited", message: "Fatima Al-Hassan was invited to Marketing Lead assessment", time: "2 days ago" },
  { id: "act6", type: "report_ready", message: "Final report for 'Data Analyst' project is ready for review", time: "3 days ago" },
  { id: "act7", type: "candidate_completed", message: "Sarah Mitchell completed Senior Frontend Engineer with a score of 87", time: "3 days ago", actor: "Sarah Mitchell" },
  { id: "act8", type: "candidate_completed", message: "Aisha Diallo completed Data Analyst assessment with a score of 68", time: "4 days ago", actor: "Aisha Diallo" },
];

export const stats = {
  totalCandidates: 10,
  activeProjects: 4,
  completedAssessments: 6,
  averageScore: 80,
};
