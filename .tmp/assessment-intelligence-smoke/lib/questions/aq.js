"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LIKERT_LABELS = exports.AQ_DURATION_SECONDS = exports.AQ_QUESTIONS = void 0;
exports.scoreAQ = scoreAQ;
// 10 questions per dimension, interleaved C/O/R/E pattern
// Reach (R) and Endurance (E) are reverse-scored (low spread = high AQ)
exports.AQ_QUESTIONS = [
    { id: 1, text: "When facing a difficult situation at work, I believe I can influence the outcome.", dimension: "C", reversed: false },
    { id: 2, text: "When something goes wrong, I ask what I could have done differently, even if it wasn't my fault.", dimension: "O", reversed: false },
    { id: 3, text: "When I face a setback at work, it tends to negatively affect my home life too.", dimension: "R", reversed: true },
    { id: 4, text: "When I face a major setback, I feel its negative effects for a long time afterward.", dimension: "E", reversed: true },
    { id: 5, text: "I feel I have real power to shape how challenges in my life turn out.", dimension: "C", reversed: false },
    { id: 6, text: "I take personal responsibility for improving situations, even when others created the problem.", dimension: "O", reversed: false },
    { id: 7, text: "Problems in one area of my life tend to spill over into other areas.", dimension: "R", reversed: true },
    { id: 8, text: "It takes me a significant amount of time to bounce back after adversity.", dimension: "E", reversed: true },
    { id: 9, text: "Even in chaotic situations, I can find something within my control.", dimension: "C", reversed: false },
    { id: 10, text: "I hold myself accountable for the outcomes in my life.", dimension: "O", reversed: false },
    { id: 11, text: "A single failure often makes me question my abilities in completely unrelated areas.", dimension: "R", reversed: true },
    { id: 12, text: "The impact of problems in my life tends to linger well beyond the initial event.", dimension: "E", reversed: true },
    { id: 13, text: "When things go wrong, I focus on what I can do differently rather than feeling helpless.", dimension: "C", reversed: false },
    { id: 14, text: "When my team fails, I examine my own contribution regardless of others' roles.", dimension: "O", reversed: false },
    { id: 15, text: "When something goes wrong, it tends to color the rest of my day in other areas too.", dimension: "R", reversed: true },
    { id: 16, text: "I often worry that current difficulties will follow me far into the future.", dimension: "E", reversed: true },
    { id: 17, text: "I trust my ability to navigate through difficult circumstances.", dimension: "C", reversed: false },
    { id: 18, text: "I rarely make excuses when things don't go as planned.", dimension: "O", reversed: false },
    { id: 19, text: "Difficulties in my professional life significantly affect how I relate to friends and family.", dimension: "R", reversed: true },
    { id: 20, text: "When something bad happens, I tend to believe it will affect me for a very long time.", dimension: "E", reversed: true },
    { id: 21, text: "I rarely feel completely powerless when facing a major obstacle.", dimension: "C", reversed: false },
    { id: 22, text: "I actively take steps to address problems rather than waiting for others to fix them.", dimension: "O", reversed: false },
    { id: 23, text: "When I face adversity, it undermines my confidence across many different areas.", dimension: "R", reversed: true },
    { id: 24, text: "I struggle to envision a future where current challenges will be resolved.", dimension: "E", reversed: true },
    { id: 25, text: "I believe my actions make a meaningful difference when adversity strikes.", dimension: "C", reversed: false },
    { id: 26, text: "I feel personally responsible for improving difficult situations I encounter.", dimension: "O", reversed: false },
    { id: 27, text: "I find that one problem tends to create a chain reaction of other problems in my life.", dimension: "R", reversed: true },
    { id: 28, text: "After a failure, it takes considerable time before I feel like my normal self again.", dimension: "E", reversed: true },
    { id: 29, text: "When circumstances are overwhelming, I still identify things I can act on.", dimension: "C", reversed: false },
    { id: 30, text: "I own my part in setbacks, even when external factors played a significant role.", dimension: "O", reversed: false },
    { id: 31, text: "A setback in one relationship often affects how I interact with other people.", dimension: "R", reversed: true },
    { id: 32, text: "I often feel that the effects of adversity in my life are permanent or near-permanent.", dimension: "E", reversed: true },
    { id: 33, text: "I feel capable of managing most of the challenges that come my way.", dimension: "C", reversed: false },
    { id: 34, text: "When facing adversity, my first instinct is to ask what I can do to improve the situation.", dimension: "O", reversed: false },
    { id: 35, text: "When things go wrong, I tend to feel that everything in my life is falling apart.", dimension: "R", reversed: true },
    { id: 36, text: "When facing a difficult situation, I tend to believe it will persist for a very long time.", dimension: "E", reversed: true },
    { id: 37, text: "I focus on what I can change rather than dwelling on what I cannot.", dimension: "C", reversed: false },
    { id: 38, text: "I hold myself to high standards in how I respond to challenges.", dimension: "O", reversed: false },
    { id: 39, text: "Adversity in one part of my life makes it hard to function well in other parts.", dimension: "R", reversed: true },
    { id: 40, text: "The hardships I face feel like they have lasting, permanent impacts on my life.", dimension: "E", reversed: true },
];
exports.AQ_DURATION_SECONDS = 20 * 60;
exports.LIKERT_LABELS = [
    "Strongly Disagree",
    "Disagree",
    "Neutral",
    "Agree",
    "Strongly Agree",
];
function scoreAQ(answers) {
    let control = 0, ownership = 0, reach = 0, endurance = 0;
    exports.AQ_QUESTIONS.forEach((q, i) => {
        const raw = answers[i] ?? 3;
        const value = q.reversed ? 6 - raw : raw;
        if (q.dimension === "C")
            control += value;
        else if (q.dimension === "O")
            ownership += value;
        else if (q.dimension === "R")
            reach += value;
        else if (q.dimension === "E")
            endurance += value;
    });
    const total = control + ownership + reach + endurance;
    let interpretation = "";
    let color = "";
    let description = "";
    if (total >= 166) {
        interpretation = "Exceptional Resilience";
        color = "text-emerald-400";
        description = "You demonstrate outstanding capacity to handle adversity. You take control, own outcomes, contain setbacks, and recover swiftly.";
    }
    else if (total >= 135) {
        interpretation = "High Resilience";
        color = "text-blue-400";
        description = "You handle adversity well. You generally maintain perspective, take responsibility, and recover in a healthy timeframe.";
    }
    else if (total >= 95) {
        interpretation = "Moderate Resilience";
        color = "text-amber-400";
        description = "You have a functional response to adversity but some challenges can feel overwhelming or longer-lasting than necessary.";
    }
    else if (total >= 60) {
        interpretation = "Low Resilience";
        color = "text-orange-400";
        description = "Adversity tends to have a broad and lasting impact on you. Building specific coping strategies in each CORE dimension will help.";
    }
    else {
        interpretation = "Adversely Challenged";
        color = "text-red-400";
        description = "Setbacks feel very difficult to contain and recover from. Focused coaching and support can make a significant difference.";
    }
    return { total, control, ownership, reach, endurance, interpretation, color, description };
}
