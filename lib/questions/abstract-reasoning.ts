export interface ARQuestion {
  id: number;
  text: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export const AR_QUESTIONS: ARQuestion[] = [
  { id: 1,  text: "What comes next in the sequence? 2, 6, 18, 54, ___", options: ["108", "162", "216", "324"], correct: 1 },
  { id: 2,  text: "What comes next in the letter sequence? A, C, F, J, O, ___", options: ["T", "U", "V", "W"], correct: 1 },
  { id: 3,  text: "A repeating sequence: Triangle, Circle, Square, Triangle, Circle, ___", options: ["Triangle", "Circle", "Square", "Pentagon"], correct: 2 },
  { id: 4,  text: "In a 3×3 grid, each row contains ●, ■, and ▲ exactly once. Row 1: ●, ■, ▲. Row 2: ■, ▲, ●. Row 3: ▲, ●, ___.", options: ["●", "■", "▲", "None of these"], correct: 1 },
  { id: 5,  text: "What comes next? 1, 1, 2, 3, 5, 8, ___", options: ["11", "12", "13", "14"], correct: 2 },
  { id: 6,  text: "What number completes the sequence? 4, 9, 16, 25, 36, ___", options: ["42", "46", "49", "54"], correct: 2 },
  { id: 7,  text: "Which is the odd one out? Square · Rectangle · Triangle · Circle · Pentagon", options: ["Square", "Rectangle", "Circle", "Pentagon"], correct: 2 },
  { id: 8,  text: "A pattern of dots grows: 1, 4, 9, 16, ___", options: ["20", "25", "24", "30"], correct: 1 },
  { id: 9,  text: "What comes next? Z, X, V, T, R, ___", options: ["O", "P", "Q", "N"], correct: 1 },
  { id: 10, text: "Shapes alternate filled/empty: filled square, empty square, filled circle, empty circle, filled triangle. What comes next?", options: ["Filled square", "Filled triangle", "Empty triangle", "Empty circle"], correct: 2 },
  { id: 11, text: "What comes next? 3, 7, 15, 31, 63, ___", options: ["95", "111", "127", "120"], correct: 2 },
  { id: 12, text: "Which number does NOT belong? 16, 25, 36, 42, 49, 64", options: ["25", "36", "42", "49"], correct: 2 },
  { id: 13, text: "Each row sums to 15. Row 1: 8, 4, 3. Row 2: 9, 2, 4. Row 3: 6, 5, ___.", options: ["3", "4", "5", "6"], correct: 1 },
  { id: 14, text: "What comes next in this prime number sequence? 2, 3, 5, 7, 11, 13, ___", options: ["15", "17", "19", "14"], correct: 1 },
  { id: 15, text: "An arrow pointing up rotates 90° clockwise with each step. At step 5 (after 4 rotations), the arrow points:", options: ["Up", "Right", "Down", "Left"], correct: 0 },
  { id: 16, text: "What comes next? AB, DE, GH, JK, ___", options: ["MN", "LM", "NO", "NP"], correct: 0 },
  { id: 17, text: "A grid: Column 1 = circles, Column 2 = squares, Column 3 = triangles. Rows 1/2/3 = large/medium/small. What is at row 3, column 2?", options: ["Large circle", "Small triangle", "Small square", "Medium square"], correct: 2 },
  { id: 18, text: "What comes next? 100, 50, 25, 12.5, ___", options: ["5", "6.25", "10", "6"], correct: 1 },
  { id: 19, text: "Which shape is the odd one out if all others have exactly 4 sides? Square · Rectangle · Rhombus · Trapezoid · Pentagon", options: ["Square", "Rectangle", "Rhombus", "Pentagon"], correct: 3 },
  { id: 20, text: "What comes next? 1, 4, 13, 40, ___", options: ["100", "121", "80", "130"], correct: 1 },
  { id: 21, text: "A 3×3 grid contains the digits 1, 2, and 3 once per row and column. Row 1: 1,2,3. Row 2: 3,1,2. Row 3: 2,_,1.", options: ["1", "2", "3", "4"], correct: 2 },
  { id: 22, text: "What comes next? A1, B4, C9, D16, ___", options: ["E20", "E25", "F25", "E24"], correct: 1 },
  { id: 23, text: "Colour pattern: Red, Blue, Green, Red, Blue, Green, Red, Blue, ___", options: ["Red", "Blue", "Green", "Yellow"], correct: 2 },
  { id: 24, text: "A number grid rule: each number doubles across the row. Row 1: 2, 4, 8. Row 2: 3, 6, 12. Row 3: 5, 10, ___.", options: ["15", "18", "20", "25"], correct: 2 },
  { id: 25, text: "What comes next? 1, 2, 4, 7, 11, 16, ___", options: ["20", "21", "22", "23"], correct: 2 },
];

export const AR_DURATION_SECONDS = 20 * 60;

export function scoreAR(answers: (number | null)[]) {
  let correct = 0;
  answers.forEach((answer, i) => {
    if (answer !== null && i < AR_QUESTIONS.length && answer === AR_QUESTIONS[i].correct) correct++;
  });
  const percentage = Math.round((correct / AR_QUESTIONS.length) * 100);
  let interpretation = "";
  let color = "";
  if (percentage >= 90)      { interpretation = "Exceptional Abstract Reasoning"; color = "text-emerald-400"; }
  else if (percentage >= 75) { interpretation = "Strong Abstract Reasoning"; color = "text-indigo-400"; }
  else if (percentage >= 60) { interpretation = "Good Abstract Reasoning"; color = "text-blue-400"; }
  else if (percentage >= 45) { interpretation = "Developing Abstract Reasoning"; color = "text-amber-400"; }
  else                       { interpretation = "Needs Development"; color = "text-red-400"; }
  return { correct, total: AR_QUESTIONS.length, percentage, interpretation, color };
}
