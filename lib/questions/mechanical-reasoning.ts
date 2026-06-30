export interface MRQuestion {
  id: number;
  text: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export const MR_QUESTIONS: MRQuestion[] = [
  { id: 1,  text: "Gear A has 20 teeth and meshes with Gear B which has 60 teeth. If Gear A turns at 180 RPM, how fast does Gear B turn?", options: ["60 RPM", "90 RPM", "120 RPM", "540 RPM"], correct: 0 },
  { id: 2,  text: "A lever has its fulcrum 1 m from a 300 N load. The effort arm is 3 m long. What effort is required to balance the lever?", options: ["50 N", "75 N", "100 N", "150 N"], correct: 2 },
  { id: 3,  text: "A fixed pulley is used to lift a 200 N load. What force must be applied to the rope?", options: ["100 N", "200 N", "400 N", "50 N"], correct: 1 },
  { id: 4,  text: "A moveable pulley is used to lift a 200 N load. Approximately what effort force is required?", options: ["200 N", "100 N", "50 N", "400 N"], correct: 1 },
  { id: 5,  text: "Water flows through a pipe with radius 4 cm that narrows to radius 2 cm. Speed in the wide section is 1 m/s. What is the speed in the narrow section?", options: ["2 m/s", "4 m/s", "8 m/s", "0.5 m/s"], correct: 1 },
  { id: 6,  text: "A beam is supported at both ends. A 600 N weight hangs from the centre. What is the reaction force at each support?", options: ["600 N", "300 N", "200 N", "150 N"], correct: 1 },
  { id: 7,  text: "You double the pressure on a fixed volume of gas at constant temperature. The volume:", options: ["Doubles", "Stays the same", "Halves", "Quadruples"], correct: 2 },
  { id: 8,  text: "Gear A has 15 teeth and meshes with Gear B which has 45 teeth. If Gear A turns clockwise, Gear B turns:", options: ["Clockwise", "Counter-clockwise", "Either direction", "It does not turn"], correct: 1 },
  { id: 9,  text: "A 50 kg block on a frictionless surface has a horizontal force of 150 N applied. What is its acceleration?", options: ["2 m/s²", "3 m/s²", "6 m/s²", "7,500 m/s²"], correct: 1 },
  { id: 10, text: "A ramp is 5 m long and rises 1 m. What effort is needed to slide a 200 N load up the ramp (ignore friction)?", options: ["20 N", "40 N", "100 N", "200 N"], correct: 1 },
  { id: 11, text: "An electric circuit has a 12 V battery and a 4 Ω resistor. What current flows?", options: ["48 A", "3 A", "0.33 A", "8 A"], correct: 1 },
  { id: 12, text: "Two resistors of 6 Ω each are connected in parallel. What is the total resistance?", options: ["12 Ω", "6 Ω", "3 Ω", "1 Ω"], correct: 2 },
  { id: 13, text: "A spring is compressed 0.1 m by a force of 50 N. What is the spring constant?", options: ["5 N/m", "50 N/m", "500 N/m", "5,000 N/m"], correct: 2 },
  { id: 14, text: "Which class of lever has the fulcrum placed between the effort and the load?", options: ["Class 1", "Class 2", "Class 3", "Class 4"], correct: 0 },
  { id: 15, text: "A metal rod 2 m long expands by 0.02 m when heated. What is the percentage increase in length?", options: ["0.1%", "1%", "2%", "10%"], correct: 1 },
  { id: 16, text: "A pulley system has a mechanical advantage of 4. A 400 N load must be lifted. What force must be applied?", options: ["400 N", "100 N", "200 N", "1,600 N"], correct: 1 },
  { id: 17, text: "Which material is the best thermal conductor?", options: ["Wood", "Rubber", "Plastic", "Copper"], correct: 3 },
  { id: 18, text: "A pressure of 500 Pa acts on an area of 2 m². What is the total force?", options: ["250 N", "500 N", "1,000 N", "2,000 N"], correct: 2 },
  { id: 19, text: "Gear A (10 teeth) drives Gear B (30 teeth), which drives Gear C (15 teeth). Gear A spins at 90 RPM. How fast does Gear C spin?", options: ["30 RPM", "60 RPM", "90 RPM", "180 RPM"], correct: 1 },
  { id: 20, text: "In a hydraulic system, a piston of area 5 cm² is pushed with 100 N. What force is produced by a piston of area 50 cm²?", options: ["10 N", "100 N", "1,000 N", "500 N"], correct: 2 },
  { id: 21, text: "A 10 kg object falls from a height of 5 m. What is its speed just before impact? (g = 10 m/s²)", options: ["5 m/s", "10 m/s", "50 m/s", "100 m/s"], correct: 1 },
  { id: 22, text: "A bolt requires 60 Nm of torque. The wrench is 0.3 m long. What force must be applied?", options: ["18 N", "180 N", "200 N", "20 N"], correct: 2 },
  { id: 23, text: "If voltage stays constant and resistance doubles, the current will:", options: ["Double", "Stay the same", "Halve", "Quadruple"], correct: 2 },
  { id: 24, text: "A wheel of radius 0.5 m has a torque of 30 Nm applied. What tangential force produces this torque?", options: ["15 N", "30 N", "60 N", "90 N"], correct: 2 },
  { id: 25, text: "Three resistors of 2 Ω, 3 Ω, and 5 Ω are connected in series. What is the total resistance?", options: ["0.97 Ω", "10 Ω", "5 Ω", "3 Ω"], correct: 1 },
  { id: 26, text: "A 10 kg box moves at 2 m/s on a conveyor belt. What is the kinetic energy of the box?", options: ["10 J", "20 J", "40 J", "100 J"], correct: 1 },
  { id: 27, text: "A sealed container holds air at 200 kPa and 300 K. Temperature rises to 600 K at constant volume. What is the new pressure?", options: ["100 kPa", "200 kPa", "400 kPa", "800 kPa"], correct: 2 },
  { id: 28, text: "A screw has a pitch of 2 mm. How many full turns are needed to drive it 10 mm into a surface?", options: ["2", "5", "10", "20"], correct: 1 },
  { id: 29, text: "An object floats in water. This means the object's average density is:", options: ["Greater than water's density", "Equal to water's density", "Less than water's density", "Unrelated to floating"], correct: 2 },
  { id: 30, text: "A 200 W electric motor runs for 30 seconds. How much energy does it consume?", options: ["200 J", "6,000 J", "666 J", "230 J"], correct: 1 },
];

export const MR_DURATION_SECONDS = 25 * 60;

export function scoreMR(answers: (number | null)[]) {
  let correct = 0;
  answers.forEach((answer, i) => {
    if (answer !== null && i < MR_QUESTIONS.length && answer === MR_QUESTIONS[i].correct) correct++;
  });
  const percentage = Math.round((correct / MR_QUESTIONS.length) * 100);
  let interpretation = "";
  let color = "";
  if (percentage >= 90)      { interpretation = "Exceptional Mechanical Reasoning"; color = "text-emerald-400"; }
  else if (percentage >= 75) { interpretation = "Strong Mechanical Reasoning"; color = "text-orange-400"; }
  else if (percentage >= 60) { interpretation = "Good Mechanical Reasoning"; color = "text-amber-400"; }
  else if (percentage >= 45) { interpretation = "Developing Mechanical Reasoning"; color = "text-yellow-400"; }
  else                       { interpretation = "Needs Development"; color = "text-red-400"; }
  return { correct, total: MR_QUESTIONS.length, percentage, interpretation, color };
}
