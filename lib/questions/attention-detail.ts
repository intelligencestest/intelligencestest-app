export interface ADQuestion {
  id: number;
  text: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export const AD_QUESTIONS: ADQuestion[] = [
  { id: 1,  text: "A document reads: 'The meeting is schedled for Wendsday the 14th.' How many spelling errors does it contain?", options: ["0", "1", "2", "3"], correct: 2 },
  { id: 2,  text: "Which two entries are identical? (A) EMP-4421-B  (B) EMP-4412-B  (C) EMP-4421-B  (D) EMP-4421-C", options: ["A and B", "A and C", "B and D", "A and D"], correct: 1 },
  { id: 3,  text: "Spreadsheet totals: Item 1 £24.50 + Item 2 £17.75 + Item 3 £8.25 = Total £51.00. Is the total correct?", options: ["Yes, it is correct", "No, it should be £50.50", "No, it should be £51.50", "No, it should be £49.50"], correct: 1 },
  { id: 4,  text: "Which word is spelled correctly?", options: ["Acommodate", "Accomodate", "Accommodate", "Acommodaate"], correct: 2 },
  { id: 5,  text: "A report references: Project started 1 Mar 2023 · Mid-review 1 Sep 2023 · Project ended 1 Sep 2022. Which date is likely an error?", options: ["Project started", "Mid-review", "Project ended", "No error — all dates are plausible"], correct: 2 },
  { id: 6,  text: "Which pair of phone numbers is identical? (A) 07700 900 123  (B) 07700 900 132  (C) 07700 900 123  (D) 07700 900 213", options: ["A and B", "A and C", "B and C", "C and D"], correct: 1 },
  { id: 7,  text: "SKU codes: XP-0012, XP-0021, XP-0012, XP-0120. Which two are duplicates?", options: ["First and second", "First and third", "Second and fourth", "Third and fourth"], correct: 1 },
  { id: 8,  text: "A letter reads: 'We are please to inform you that your application has been successful.' What is the error?", options: ["No error", "'please' should be 'pleased'", "'inform' should be 'informing'", "A comma is missing after 'you'"], correct: 1 },
  { id: 9,  text: "Sales: Jan £12,400 + Feb £13,200 + Mar £11,800 = Q1 Total £37,600. Is the total correct?", options: ["Yes, it is correct", "No, it should be £36,400", "No, it should be £37,400", "No, it should be £38,200"], correct: 2 },
  { id: 10, text: "A registration list shows: James Hargreaves, Jane Hargreaves, James Hargreaves, Jacob Hargreaves. Which entry appears twice?", options: ["Jane Hargreaves", "James Hargreaves", "Jacob Hargreaves", "All are unique"], correct: 1 },
  { id: 11, text: "Original address: 'Flat 4B, 28 Victoria Street, London, SW1V 3AB'. Which copy contains an error?", options: ["Flat 4B, 28 Victoria Street, London, SW1V 3AB", "Flat 4B, 28 Victoria Street, London, SW1V 3BA", "Flat 4B, 28 Victoria Street, London, SW1V 3AB", "All copies are correct"], correct: 1 },
  { id: 12, text: "A statement says: 'There were 248 atendees, of whom 142 where from overseas.' How many errors?", options: ["0", "1", "2", "3"], correct: 2 },
  { id: 13, text: "Which calculation is incorrect? (A) 16×4=64  (B) 84÷7=12  (C) 9²=81  (D) 15% of 80=13", options: ["A", "B", "C", "D"], correct: 3 },
  { id: 14, text: "Which email address differs from the others? (A) j.smith@company.co.uk  (B) j.smith@company.co.uk  (C) j.smith@company.co.uk  (D) j.smith@compamy.co.uk", options: ["A", "B", "C", "D"], correct: 3 },
  { id: 15, text: "Timesheet: Mon 8.5h + Tue 7.75h + Wed 8.0h + Thu 8.25h + Fri 7.5h = Total 40.5h. Is the total correct?", options: ["Yes", "No, it should be 40.0h", "No, it should be 41.0h", "No, it should be 39.5h"], correct: 1 },
  { id: 16, text: "A contract names the signatory 'Dr. Elizabeth Harrington' but is addressed to 'Dr. Elisabeth Harrington'. What is the discrepancy?", options: ["The title differs", "The first name spelling differs", "The last name differs", "There is no discrepancy"], correct: 1 },
  { id: 17, text: "Which NI number matches the format 'XX 99 99 99 X'?", options: ["AB 12 34 56 C", "AB 12 34 567 C", "AB-12-34-56-C", "A1 12 34 56 C"], correct: 0 },
  { id: 18, text: "A letter is dated '23rd Febuary, 2024'. What is wrong?", options: ["The day is wrong", "The month is misspelled", "The year is wrong", "Nothing is wrong"], correct: 1 },
  { id: 19, text: "Inventory: Part A 145 + Part B 230 + Part C 87 + Part D 63 = Total 515. Is this correct?", options: ["Yes, the total is correct", "No, the total should be 525", "No, the total should be 505", "No, the total should be 510"], correct: 1 },
  { id: 20, text: "Which sentence contains an error? (A) The committee has approved the budget. (B) Neither option are suitable. (C) The data were collected over three months. (D) Each team member submitted their report.", options: ["A", "B", "C", "D"], correct: 1 },
  { id: 21, text: "Employee start dates: Johnson 01/04/2019, Peters 15/07/2020, Williams 22/02/2021, Johnson 01/04/2019. What is the issue?", options: ["Peters' date looks wrong", "Williams' date looks wrong", "Johnson appears twice", "No issue"], correct: 2 },
  { id: 22, text: "Original code: 'REF-2024-GHK-007'. Which copy is an exact match?", options: ["REF-2024-GKH-007", "REF-2024-GHK-070", "REF-2024-GHK-007", "REF-204-GHK-007"], correct: 2 },
  { id: 23, text: "A paragraph reads: 'The affect of the new policy has been positve, with staff moral improving.' How many errors?", options: ["1", "2", "3", "4"], correct: 2 },
  { id: 24, text: "A price list shows: Standard £45 · Premium £67 · Deluxe £89 · Premium £72. What is the issue?", options: ["Standard price is inconsistent", "Premium appears twice with different prices", "Deluxe price is too high", "No issue"], correct: 1 },
  { id: 25, text: "An invoice shows: 3 units × £24.00 = £62.00. Is the calculation correct?", options: ["Yes", "No, it should be £72.00", "No, it should be £68.00", "No, it should be £70.00"], correct: 1 },
  { id: 26, text: "Which word is the odd one out? Analyse · Assessment · Evaluate · Investigate · Interpret", options: ["Analyse", "Assessment", "Evaluate", "Investigate"], correct: 1 },
  { id: 27, text: "Project codes: PRJ-447, PRJ-448, PRJ-449, PRJ-447, PRJ-450. What is the issue?", options: ["A code is missing from the sequence", "PRJ-447 appears twice", "The sequence order is wrong", "No issue"], correct: 1 },
  { id: 28, text: "Which date format is inconsistent with the others? (A) 12-Mar-2024  (B) 05-Apr-2024  (C) 2024-Jun-14  (D) 18-Jul-2024", options: ["A", "B", "C", "D"], correct: 2 },
  { id: 29, text: "Survey result: '72% agreed, 18% disagreed, and 14% were neutral.' What is the issue?", options: ["No issue — the figures look reasonable", "The percentages sum to 104%, not 100%", "The neutral percentage is unrealistically high", "The agreed percentage seems too low"], correct: 1 },
  { id: 30, text: "Which pair of serial numbers is an exact match? (A) SN-88234-K vs SN-88234-K  (B) SN-88234-K vs SN-88243-K  (C) SN-88234-K vs SN-88234-X  (D) SN-88234-K vs SN-882-34-K", options: ["A", "B", "C", "D"], correct: 0 },
  { id: 31, text: "A document states: 'The project commenced 1 March and will conclude in exactly six months, on 1 August.' Is this correct?", options: ["Yes, 1 August is exactly six months later", "No, six months from 1 March is 1 September", "No, six months from 1 March is 1 July", "The statement is ambiguous"], correct: 1 },
  { id: 32, text: "Which sort code is incorrectly formatted? (Format: XX-XX-XX)", options: ["20-14-33", "08-32-00", "40-47-841", "16-58-22"], correct: 2 },
  { id: 33, text: "A meeting invite reads: 'See you on Tuesday the 14th of May.' A calendar shows 14 May falls on a Wednesday. What is the error?", options: ["The date is wrong", "The day of the week is wrong", "The month is wrong", "No error"], correct: 1 },
  { id: 34, text: "A CV lists: 2018–2020 Role A · 2019–2022 Role B · 2022–Present Role C. What is the issue?", options: ["Role A seems too short", "Roles A and B overlap", "Role C has no end date", "No issue"], correct: 1 },
  { id: 35, text: "Which VAT number is incorrectly formatted? (Format: GB + 9 digits)", options: ["GB 123 456 789", "GB 987 654 321", "GB 12 345 678", "GB 456 789 123"], correct: 2 },
  { id: 36, text: "Department shares: A 32% · B 28% · C 21% · D 17% · E 9%. What is the issue?", options: ["Dept A percentage looks too high", "The percentages sum to 107%, not 100%", "Dept E percentage is unrealistically low", "No issue"], correct: 1 },
  { id: 37, text: "Which email address contains an error? (A) sarah.jones@dept.org.uk  (B) m.patel@department.co.uk  (C) r..thomas@company.com  (D) a.johnson@office.org", options: ["A", "B", "C", "D"], correct: 2 },
  { id: 38, text: "A schedule shows: Meeting A 09:00–10:30 · Meeting B 10:00–11:00 · Meeting C 11:30–12:00. What is the conflict?", options: ["Meetings A and B overlap", "Meetings B and C overlap", "All three meetings overlap", "There is no conflict"], correct: 0 },
  { id: 39, text: "A report contains figures: Figure 1, Figure 2, Figure 4, Figure 5, Figure 6. What is missing?", options: ["Figure 3", "Figure 7", "Nothing is missing", "Figure 0"], correct: 0 },
  { id: 40, text: "A data entry reads: Account No. 7734-Alpha-002. Which copy contains an error?", options: ["7734-Alpha-002", "7734-Apha-002", "7734-Alpha-002", "7734-Alpha-002"], correct: 1 },
];

export const AD_DURATION_SECONDS = 20 * 60;

export function scoreAD(answers: (number | null)[]) {
  let correct = 0;
  answers.forEach((answer, i) => {
    if (answer !== null && i < AD_QUESTIONS.length && answer === AD_QUESTIONS[i].correct) correct++;
  });
  const percentage = Math.round((correct / AD_QUESTIONS.length) * 100);
  let interpretation = "";
  let color = "";
  if (percentage >= 90)      { interpretation = "Exceptional Attention to Detail"; color = "text-emerald-400"; }
  else if (percentage >= 75) { interpretation = "Strong Attention to Detail"; color = "text-blue-400"; }
  else if (percentage >= 60) { interpretation = "Good Attention to Detail"; color = "text-cyan-400"; }
  else if (percentage >= 45) { interpretation = "Developing Attention to Detail"; color = "text-amber-400"; }
  else                       { interpretation = "Needs Development"; color = "text-red-400"; }
  return { correct, total: AD_QUESTIONS.length, percentage, interpretation, color };
}
