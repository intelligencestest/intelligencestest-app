export interface CTQuestion {
  id: number;
  text: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export const CT_QUESTIONS: CTQuestion[] = [
  { id: 1, text: "All mammals are warm-blooded. A dolphin is a mammal. What must be true?", options: ["All warm-blooded animals are mammals", "Dolphins are warm-blooded", "Dolphins cannot survive in cold water", "No cold-blooded animals live in water"], correct: 1 },
  { id: 2, text: "If all Blems are Trams, and no Trams are Spods, which statement must be true?", options: ["Some Blems are Spods", "No Blems are Spods", "All Trams are Blems", "Some Spods are Blems"], correct: 1 },
  { id: 3, text: "Alex runs faster than Ben. Carol runs slower than Anna. Ben runs faster than Carol. Who finished last in a race?", options: ["Alex", "Ben", "Carol", "Cannot be determined"], correct: 2 },
  { id: 4, text: "Statement: 'If you study hard, you will pass.' Jana did not pass. What must be true?", options: ["Jana did not study hard", "Jana studied but not hard enough", "Studying is unrelated to passing", "Jana was ill during the exam"], correct: 0 },
  { id: 5, text: "What comes next: 2, 6, 18, 54, ___?", options: ["108", "162", "216", "90"], correct: 1 },
  { id: 6, text: "Three boxes are labelled 'Apples', 'Oranges', and 'Mixed'. All three labels are wrong. You pick from the 'Mixed' box and get an apple. What does the 'Oranges' box contain?", options: ["Apples", "Mixed (both fruits)", "Oranges", "Cannot be determined"], correct: 1 },
  { id: 7, text: "A study finds people who own more books score higher on reading tests. A researcher concludes that owning books improves reading ability. What is the main flaw?", options: ["The sample size is unknown", "Correlation does not imply causation", "Reading tests are unreliable", "More data points are needed"], correct: 1 },
  { id: 8, text: "In a class, all students who passed submitted their assignments. Tom did not submit his assignment. What can we conclude?", options: ["Tom passed the class", "Tom did not pass", "Tom was absent", "Submitting guarantees passing"], correct: 1 },
  { id: 9, text: "What comes next: 1, 1, 2, 3, 5, 8, 13, ___?", options: ["18", "20", "21", "26"], correct: 2 },
  { id: 10, text: "Two cyclists start from the same point in opposite directions at 15 km/h and 20 km/h. After how many hours are they 105 km apart?", options: ["2 hours", "3 hours", "4 hours", "5 hours"], correct: 1 },
  { id: 11, text: "What comes next: 3, 8, 15, 24, 35, ___?", options: ["42", "46", "48", "50"], correct: 2 },
  { id: 12, text: "If 6 workers complete a task in 10 days, how many days would 4 workers take?", options: ["12 days", "15 days", "18 days", "20 days"], correct: 1 },
  { id: 13, text: "A price increases by 20% and then decreases by 20%. What is the net change from the original price?", options: ["0% (no change)", "4% decrease", "4% increase", "2% decrease"], correct: 1 },
  { id: 14, text: "What comes next: 1, 4, 9, 16, 25, ___?", options: ["30", "34", "36", "42"], correct: 2 },
  { id: 15, text: "A tank fills in 12 minutes with pipe A open. It drains in 20 minutes with pipe B open. How long does it take to fill from empty with both pipes open?", options: ["24 min", "28 min", "30 min", "32 min"], correct: 2 },
  { id: 16, text: "What is the missing number: 7, 14, ___, 56, 112?", options: ["21", "24", "28", "35"], correct: 2 },
  { id: 17, text: "A survey shows 75% of people prefer Brand A. The survey was conducted among Brand A's own employees. What is the main problem?", options: ["75% is not a majority", "The sample is heavily biased", "Brand B needs better marketing", "More respondents are needed"], correct: 1 },
  { id: 18, text: "What comes next: 5, 10, 20, 40, ___?", options: ["60", "70", "80", "100"], correct: 2 },
  { id: 19, text: "DOCTOR is to PATIENT as TEACHER is to ___?", options: ["School", "Student", "Classroom", "Lesson"], correct: 1 },
  { id: 20, text: "Which element does NOT belong with the others: Copper, Gold, Mercury, Iron?", options: ["Copper", "Gold", "Mercury", "Iron"], correct: 2 },
  { id: 21, text: "If all published research is peer-reviewed, and this paper was not peer-reviewed, what can we conclude?", options: ["The paper is not credible", "The paper was not published", "Peer review is unnecessary", "The paper may still be published"], correct: 1 },
  { id: 22, text: "What comes next in this prime number sequence: 2, 3, 5, 7, 11, 13, ___?", options: ["15", "17", "19", "21"], correct: 1 },
  { id: 23, text: "DARK is to LIGHT as COLD is to ___?", options: ["Ice", "Warm", "Hot", "Temperature"], correct: 2 },
  { id: 24, text: "Anna, Ben, and Carol each have one pet: cat, dog, or fish. Ben does not have a cat. Anna has a dog. Which pet does Carol have?", options: ["Cat", "Dog", "Fish", "Cannot be determined"], correct: 0 },
  { id: 25, text: "What is the angle between the clock hands at 9:00?", options: ["270°", "180°", "90°", "45°"], correct: 2 },
  { id: 26, text: "Which of the following is an example of circular reasoning?", options: ["'The Bible is true because it says so in the Bible.'", "'All swans are white because most swans I've seen are white.'", "'The ground is wet, so it must have rained.'", "'John is always late, so he'll be late today.'"], correct: 0 },
  { id: 27, text: "A snail climbs 3m up a wall each day but slides 2m back each night. The wall is 10m tall. On which day does the snail reach the top?", options: ["Day 7", "Day 8", "Day 9", "Day 10"], correct: 1 },
  { id: 28, text: "Which argument contains a false dilemma?", options: ["'You're either with us or against us.'", "'Studies show exercise reduces heart disease risk.'", "'Most experts agree that vaccines are safe.'", "'Evidence suggests the economy is improving.'"], correct: 0 },
  { id: 29, text: "CHEF is to KITCHEN as SURGEON is to ___?", options: ["Hospital", "Doctor", "Operating theatre", "Medicine"], correct: 2 },
  { id: 30, text: "You flip a fair coin three times and get heads each time. What is the probability the next flip is also heads?", options: ["Less than 50% — it's unlikely", "Exactly 50%", "More than 50% — it's overdue", "25%"], correct: 1 },
  { id: 31, text: "What comes next: ZA, YB, XC, WD, ___?", options: ["VE", "VF", "UE", "UF"], correct: 0 },
  { id: 32, text: "A shop sells items at a 25% profit margin. If the cost price is $80, what is the selling price?", options: ["$95", "$100", "$105", "$110"], correct: 1 },
  { id: 33, text: "You have a 3-litre jug and a 5-litre jug with unlimited water. How do you measure exactly 4 litres?", options: ["Fill 5L, pour into 3L until full (2L left). Empty 3L. Pour 2L into 3L. Refill 5L, pour 1L into 3L. 4L remains in 5L.", "Fill both and combine", "This is impossible with these two jugs", "Fill 3L twice, then remove 2L"], correct: 0 },
  { id: 34, text: "A company's revenue grew from $200,000 to $250,000. What was the percentage increase?", options: ["20%", "25%", "50%", "15%"], correct: 1 },
  { id: 35, text: "Which is an example of an ad hominem fallacy?", options: ["'Don't trust his diet advice — he is clearly overweight.'", "'Studies show exercise is beneficial for heart health.'", "'If unemployment falls, consumer confidence typically rises.'", "'Since most people believe X, X is probably true.'"], correct: 0 },
  { id: 36, text: "What is the next number: 0, 1, 3, 6, 10, 15, ___?", options: ["18", "20", "21", "24"], correct: 2 },
  { id: 37, text: "A researcher gives a new drug only to volunteers who specifically requested it and reports a 40% reduction in symptoms. What is the MAIN weakness of this study?", options: ["A 40% reduction is statistically insignificant", "Volunteers may not represent all patients", "Side effects are not mentioned", "The drug company may have funded the study"], correct: 1 },
  { id: 38, text: "GLOVES are to HANDS as SHOES are to ___?", options: ["Socks", "Feet", "Legs", "Walking"], correct: 1 },
  { id: 39, text: "If HAPPY encodes to IBQQZ (each letter +1), what does THINK encode to?", options: ["UIJOL", "THHNK", "UIIOL", "VJKOL"], correct: 0 },
  { id: 40, text: "A bag contains 5 red balls and 3 blue balls. Two balls are drawn without replacement. What is the probability both are red?", options: ["25/64", "5/14", "10/64", "1/2"], correct: 1 },
];

export const CT_DURATION_SECONDS = 25 * 60;

export function scoreResults(answers: (number | null)[]): { correct: number; total: number; percentage: number; interpretation: string; color: string } {
  let correct = 0;
  answers.forEach((answer, i) => {
    if (answer === CT_QUESTIONS[i].correct) correct++;
  });
  const percentage = Math.round((correct / CT_QUESTIONS.length) * 100);
  let interpretation = "";
  let color = "";
  if (percentage >= 90) { interpretation = "Exceptional Critical Thinker"; color = "text-emerald-400"; }
  else if (percentage >= 75) { interpretation = "Strong Critical Thinker"; color = "text-blue-400"; }
  else if (percentage >= 60) { interpretation = "Developing Critical Thinker"; color = "text-amber-400"; }
  else if (percentage >= 45) { interpretation = "Basic Critical Thinker"; color = "text-orange-400"; }
  else { interpretation = "Needs Development"; color = "text-red-400"; }
  return { correct, total: CT_QUESTIONS.length, percentage, interpretation, color };
}
