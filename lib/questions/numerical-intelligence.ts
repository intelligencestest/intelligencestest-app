export interface NumericalQuestion {
  id: number;
  text: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export const NUMERICAL_QUESTIONS: NumericalQuestion[] = [
  { id: 1, text: "What is 18 + 27?", options: ["39", "45", "47", "54"], correct: 1 },
  { id: 2, text: "What is 15% of 240?", options: ["24", "30", "36", "42"], correct: 2 },
  { id: 3, text: "What comes next: 4, 8, 16, 32, ___?", options: ["48", "56", "64", "72"], correct: 2 },
  { id: 4, text: "If 5 notebooks cost $12.50, how much do 8 notebooks cost?", options: ["$18.00", "$20.00", "$22.50", "$25.00"], correct: 1 },
  { id: 5, text: "A ratio is 3:2 and the total is 40. What is the larger share?", options: ["16", "20", "24", "28"], correct: 2 },
  { id: 6, text: "The average of 12, 15, 18, and x is 16. What is x?", options: ["17", "18", "19", "20"], correct: 2 },
  { id: 7, text: "A price of $80 is reduced by 20%. What is the new price?", options: ["$60", "$64", "$66", "$70"], correct: 1 },
  { id: 8, text: "What is 7 x 9 - 6?", options: ["51", "54", "57", "63"], correct: 2 },
  { id: 9, text: "A train travels 60 km at 30 km/h. How long does the trip take?", options: ["1 hour", "1.5 hours", "2 hours", "2.5 hours"], correct: 2 },
  { id: 10, text: "What is 3/4 of 48?", options: ["32", "34", "36", "40"], correct: 2 },
  { id: 11, text: "What comes next: 2, 5, 11, 23, ___?", options: ["35", "41", "45", "47"], correct: 3 },
  { id: 12, text: "A product priced at $120 increases by 25%. What is the new price?", options: ["$135", "$145", "$150", "$160"], correct: 2 },
  { id: 13, text: "What is 9 squared?", options: ["72", "81", "90", "99"], correct: 1 },
  { id: 14, text: "45 minutes is what fraction of an hour?", options: ["0.25", "0.50", "0.75", "0.90"], correct: 2 },
  { id: 15, text: "6 workers finish a job in 12 days. At the same rate, 9 workers finish it in how many days?", options: ["6", "8", "10", "18"], correct: 1 },
  { id: 16, text: "A box has 4 red balls and 6 blue balls. What is the probability of drawing a blue ball?", options: ["2/5", "3/5", "4/5", "1/2"], correct: 1 },
  { id: 17, text: "Solve: 3x + 5 = 20.", options: ["3", "4", "5", "6"], correct: 2 },
  { id: 18, text: "What is 100 - 37?", options: ["53", "57", "63", "67"], correct: 2 },
  { id: 19, text: "A rectangle is 8 cm long and 6 cm wide. What is its area?", options: ["14 square cm", "28 square cm", "42 square cm", "48 square cm"], correct: 3 },
  { id: 20, text: "2.5 kg of apples cost $4 per kg. What is the total cost?", options: ["$8", "$9", "$10", "$12"], correct: 2 },
  { id: 21, text: "What comes next: 1, 4, 10, 19, 31, ___?", options: ["40", "43", "46", "50"], correct: 2 },
  { id: 22, text: "18 is what percentage of 60?", options: ["20%", "25%", "30%", "35%"], correct: 2 },
  { id: 23, text: "If 12 machines make 48 units in one hour, how many units do 5 machines make in one hour?", options: ["15", "18", "20", "24"], correct: 2 },
  { id: 24, text: "What is 7/10 as a decimal?", options: ["0.07", "0.17", "0.70", "7.10"], correct: 2 },
  { id: 25, text: "What comes next: 40, 36, 32, 28, ___?", options: ["20", "22", "24", "26"], correct: 2 },
  { id: 26, text: "What is 144 divided by 12?", options: ["10", "11", "12", "14"], correct: 2 },
  { id: 27, text: "What is the median of 3, 7, 8, 10, 12?", options: ["7", "8", "9", "10"], correct: 1 },
  { id: 28, text: "A cube has side length 3 cm. What is its volume?", options: ["9 cubic cm", "18 cubic cm", "27 cubic cm", "36 cubic cm"], correct: 2 },
  { id: 29, text: "A car travels 90 km in 1.5 hours. What is its average speed?", options: ["45 km/h", "60 km/h", "75 km/h", "90 km/h"], correct: 1 },
  { id: 30, text: "25% of a number is 30. What is the number?", options: ["75", "90", "120", "150"], correct: 2 },
  { id: 31, text: "What comes next: 6, 10, 16, 24, 34, ___?", options: ["42", "44", "46", "48"], correct: 2 },
  { id: 32, text: "A square has side length 9 cm. What is its perimeter?", options: ["18 cm", "27 cm", "36 cm", "81 cm"], correct: 2 },
  { id: 33, text: "Simplify the ratio 14:21.", options: ["1:2", "2:3", "3:4", "7:9"], correct: 1 },
  { id: 34, text: "Sales rose from 80 units to 100 units. What was the percentage increase?", options: ["20%", "25%", "30%", "40%"], correct: 1 },
  { id: 35, text: "What is 5 cubed minus 5?", options: ["100", "115", "120", "125"], correct: 2 },
];

export const NUMERICAL_DURATION_SECONDS = 20 * 60;

export function scoreNumerical(answers: (number | null)[]) {
  let correct = 0;
  const reviewed = NUMERICAL_QUESTIONS.map((question, index) => {
    const answer = answers[index];
    const isCorrect = answer === question.correct;
    if (isCorrect) correct += 1;
    return {
      question_id: question.id,
      answer,
      correct: question.correct,
      is_correct: isCorrect,
    };
  });

  const percentage = Math.round((correct / NUMERICAL_QUESTIONS.length) * 100);

  return {
    correct,
    total: NUMERICAL_QUESTIONS.length,
    percentage,
    reviewed,
  };
}
