export interface VRQuestion {
  id: number;
  text: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export const VR_QUESTIONS: VRQuestion[] = [
  { id: 1,  text: "DOCTOR is to PATIENT as LAWYER is to:", options: ["Court", "Justice", "Client", "Law"], correct: 2 },
  { id: 2,  text: "HEAT is to TEMPERATURE as DISTANCE is to:", options: ["Speed", "Length", "Weight", "Time"], correct: 1 },
  { id: 3,  text: "BRUSH is to PAINTER as SCALPEL is to:", options: ["Hospital", "Medicine", "Surgeon", "Nurse"], correct: 2 },
  { id: 4,  text: "Which word does NOT belong? Observe · Notice · Ignore · Perceive · Detect", options: ["Observe", "Notice", "Ignore", "Perceive"], correct: 2 },
  { id: 5,  text: "Which word does NOT belong? Piano · Guitar · Violin · Trumpet · Sculpture", options: ["Piano", "Guitar", "Trumpet", "Sculpture"], correct: 3 },
  { id: 6,  text: "COURAGE is the opposite of:", options: ["Bravery", "Cowardice", "Strength", "Boldness"], correct: 1 },
  { id: 7,  text: "TRANSPARENT is to OPAQUE as FLEXIBLE is to:", options: ["Elastic", "Bendable", "Rigid", "Fragile"], correct: 2 },
  { id: 8,  text: "Choose the word that best completes the sentence: 'Despite the complexity of the task, she completed it with remarkable _____.'", options: ["Difficulty", "Speed", "Efficiency", "Hesitation"], correct: 2 },
  { id: 9,  text: "A synonym for CONCISE is:", options: ["Wordy", "Brief", "Detailed", "Complex"], correct: 1 },
  { id: 10, text: "An antonym for ABUNDANT is:", options: ["Plentiful", "Generous", "Scarce", "Wealthy"], correct: 2 },
  { id: 11, text: "FIRE is to SMOKE as CAUSE is to:", options: ["Reason", "Effect", "Source", "Trigger"], correct: 1 },
  { id: 12, text: "Choose the word that best fits: 'The manager's decision was _____, as it satisfied both teams.'", options: ["Controversial", "Ambiguous", "Equitable", "Arbitrary"], correct: 2 },
  { id: 13, text: "LIBRARY is to BOOKS as GALLERY is to:", options: ["Visitors", "Paintings", "Sculptures", "Artists"], correct: 1 },
  { id: 14, text: "Which word does NOT belong? Anxious · Nervous · Apprehensive · Confident · Worried", options: ["Anxious", "Nervous", "Confident", "Worried"], correct: 2 },
  { id: 15, text: "DILUTE is to CONCENTRATE as DIVIDE is to:", options: ["Share", "Separate", "Multiply", "Calculate"], correct: 2 },
  { id: 16, text: "A synonym for AMBIGUOUS is:", options: ["Clear", "Certain", "Unclear", "Decisive"], correct: 2 },
  { id: 17, text: "'She spoke with great _____, making every word count.' Which word best completes this sentence?", options: ["Brevity", "Volume", "Enthusiasm", "Clarity"], correct: 0 },
  { id: 18, text: "ARCHITECT is to BLUEPRINT as COMPOSER is to:", options: ["Orchestra", "Performance", "Score", "Instrument"], correct: 2 },
  { id: 19, text: "Which word is closest in meaning to CORROBORATE?", options: ["Contradict", "Confirm", "Create", "Conceal"], correct: 1 },
  { id: 20, text: "LOUD is to DEAFENING as COLD is to:", options: ["Freezing", "Chilly", "Cool", "Tepid"], correct: 0 },
  { id: 21, text: "If all managers attend the weekly briefing, and Sarah is a manager, which must be true?", options: ["Sarah sometimes attends", "Sarah always attends the briefing", "Sarah may skip the briefing", "Sarah chairs the briefing"], correct: 1 },
  { id: 22, text: "No member of the finance team works weekends. Daniel works weekends. Which conclusion follows?", options: ["Daniel may be in finance", "Daniel is not in finance", "Daniel works too much", "The finance team never works"], correct: 1 },
  { id: 23, text: "Some analysts are also project managers. All project managers attend the Monday meeting. Which must be true?", options: ["All analysts attend the Monday meeting", "No analysts attend the Monday meeting", "Some analysts attend the Monday meeting", "None of the above"], correct: 2 },
  { id: 24, text: "Every report submitted this quarter was reviewed by a senior editor. This report was NOT reviewed. Therefore:", options: ["This report was submitted this quarter", "This report may have been submitted this quarter", "This report was not submitted this quarter", "No conclusion can be drawn"], correct: 2 },
  { id: 25, text: "BOOK is to CHAPTER as FILM is to:", options: ["Reel", "Scene", "Director", "Screen"], correct: 1 },
  { id: 26, text: "Which word does NOT belong? Annual · Monthly · Quarterly · Biannual · Weekly · Instant", options: ["Annual", "Quarterly", "Biannual", "Instant"], correct: 3 },
  { id: 27, text: "A synonym for METICULOUS is:", options: ["Careless", "Thorough", "Quick", "Vague"], correct: 1 },
  { id: 28, text: "Choose the best word: 'The witness gave a _____ account, recalling every detail precisely.'", options: ["Vague", "Comprehensive", "Verbatim", "Summarised"], correct: 2 },
  { id: 29, text: "WARM is to HOT as INTERESTED is to:", options: ["Curious", "Fascinated", "Aware", "Engaged"], correct: 1 },
  { id: 30, text: "Which sentence is clearest and most precise?", options: ["The project is going well and we are kind of on track.", "The project is progressing as planned and will be complete by Friday.", "Things are okay with the project mostly.", "The project seems fine to most people involved."], correct: 1 },
];

export const VR_DURATION_SECONDS = 20 * 60;

export function scoreVR(answers: (number | null)[]) {
  let correct = 0;
  answers.forEach((answer, i) => {
    if (answer !== null && i < VR_QUESTIONS.length && answer === VR_QUESTIONS[i].correct) correct++;
  });
  const percentage = Math.round((correct / VR_QUESTIONS.length) * 100);
  let interpretation = "";
  let color = "";
  if (percentage >= 90)      { interpretation = "Exceptional Verbal Reasoning"; color = "text-emerald-400"; }
  else if (percentage >= 75) { interpretation = "Strong Verbal Reasoning"; color = "text-violet-400"; }
  else if (percentage >= 60) { interpretation = "Good Verbal Reasoning"; color = "text-blue-400"; }
  else if (percentage >= 45) { interpretation = "Developing Verbal Reasoning"; color = "text-amber-400"; }
  else                       { interpretation = "Needs Development"; color = "text-red-400"; }
  return { correct, total: VR_QUESTIONS.length, percentage, interpretation, color };
}
