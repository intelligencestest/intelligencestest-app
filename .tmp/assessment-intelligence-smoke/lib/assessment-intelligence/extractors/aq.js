"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractAQEvidence = extractAQEvidence;
const aq_1 = require("@/lib/questions/aq");
const taxonomy_1 = require("../taxonomy");
const scales_1 = require("../scales");
function answersFrom(rawAnswers) {
    return Array.isArray(rawAnswers) ? rawAnswers.map((answer) => (typeof answer === "number" ? answer : null)) : null;
}
function scoreFrom(input) {
    if (input.scoreDetails?.type === "aq")
        return input.scoreDetails;
    const answers = answersFrom(input.rawAnswers);
    if (answers) {
        const scored = (0, aq_1.scoreAQ)(answers);
        return {
            type: "aq",
            total: scored.total,
            control: scored.control,
            ownership: scored.ownership,
            reach: scored.reach,
            endurance: scored.endurance,
            interpretation: scored.interpretation,
            description: scored.description,
        };
    }
    const total = input.score > 100 ? (0, scales_1.clampScore)(input.score, 200) : (0, scales_1.clampScore)(input.score * 2, 200);
    const estimatedDimension = Math.round(total / 4);
    return {
        type: "aq",
        total,
        control: estimatedDimension,
        ownership: estimatedDimension,
        reach: estimatedDimension,
        endurance: estimatedDimension,
    };
}
const DIMENSIONS = [
    {
        id: "control",
        competencyId: "adversity-control",
        label: { en: "Control", es: "Control" },
    },
    {
        id: "ownership",
        competencyId: "personal-accountability",
        label: { en: "Ownership", es: "Responsabilidad" },
    },
    {
        id: "reach",
        competencyId: "setback-containment",
        label: { en: "Reach", es: "Alcance" },
    },
    {
        id: "endurance",
        competencyId: "recovery-orientation",
        label: { en: "Endurance", es: "Duracion" },
    },
];
function totalStatement(score, locale) {
    if (score >= 80) {
        return locale === "es"
            ? "Evidencia fuerte de respuesta resiliente ante presion y contratiempos."
            : "Strong evidence of resilient response under pressure and setbacks.";
    }
    if (score >= 65) {
        return locale === "es"
            ? "Evidencia favorable de resiliencia, con validacion recomendada en situaciones reales."
            : "Favorable evidence of resilience, with recommended validation in real situations.";
    }
    if (score >= 50) {
        return locale === "es"
            ? "Evidencia mixta de resiliencia; algunas dimensiones pueden requerir seguimiento."
            : "Mixed resilience evidence; some dimensions may require follow-up.";
    }
    return locale === "es"
        ? "Evidencia de riesgo en respuesta ante adversidad, presion o recuperacion despues de contratiempos."
        : "Risk evidence in response to adversity, pressure, or recovery after setbacks.";
}
function totalImpact(score, locale) {
    if (score >= 80) {
        return locale === "es"
            ? "Puede sostener desempeno cuando existen obstaculos, presion o informacion imperfecta."
            : "May sustain performance when obstacles, pressure, or imperfect information are present.";
    }
    if (score >= 65) {
        return locale === "es"
            ? "Puede manejar contratiempos con efectividad si el contexto y los apoyos del rol son adecuados."
            : "May handle setbacks effectively when the role context and supports are appropriate.";
    }
    if (score >= 50) {
        return locale === "es"
            ? "La respuesta ante adversidad parece variable y debe validarse con ejemplos conductuales."
            : "Response to adversity appears variable and should be validated with behavioral examples.";
    }
    return locale === "es"
        ? "Puede presentar mayor exposicion en roles con presion sostenida, ambiguedad o recuperacion rapida."
        : "May show higher exposure in roles with sustained pressure, ambiguity, or rapid recovery demands.";
}
function dimensionStatement(label, score, locale) {
    if (score >= 65) {
        return locale === "es"
            ? `${label}: evidencia favorable en la dimension CORE completada.`
            : `${label}: favorable evidence in the completed CORE dimension.`;
    }
    if (score >= 50) {
        return locale === "es"
            ? `${label}: evidencia mixta; conviene validar consistencia con ejemplos laborales.`
            : `${label}: mixed evidence; consistency should be validated with work examples.`;
    }
    return locale === "es"
        ? `${label}: senal de riesgo que requiere validacion directa en entrevista.`
        : `${label}: risk signal requiring direct interview validation.`;
}
function dimensionImpact(competencyId, score, locale) {
    const risk = score < 50;
    const copy = {
        "analytical-reasoning": {
            positive: { en: "", es: "" },
            risk: { en: "", es: "" },
        },
        "decision-quality": {
            positive: { en: "", es: "" },
            risk: { en: "", es: "" },
        },
        "resilience-under-pressure": {
            positive: { en: "", es: "" },
            risk: { en: "", es: "" },
        },
        "assessment-performance": {
            positive: { en: "", es: "" },
            risk: { en: "", es: "" },
        },
        "adversity-control": {
            positive: {
                en: "Supports a tendency to look for actionable levers in difficult situations.",
                es: "Respalda una tendencia a buscar acciones posibles en situaciones dificiles.",
            },
            risk: {
                en: "May feel reduced control when facing obstacles, increasing the need for structure or support.",
                es: "Puede sentir menor control ante obstaculos, elevando la necesidad de estructura o apoyo.",
            },
        },
        "personal-accountability": {
            positive: {
                en: "Supports ownership of improvement even when the problem is shared or externally caused.",
                es: "Respalda asumir responsabilidad de mejora aun cuando el problema sea compartido o externo.",
            },
            risk: {
                en: "May externalize setbacks or wait for others to resolve difficult situations.",
                es: "Puede externalizar contratiempos o esperar que otros resuelvan situaciones dificiles.",
            },
        },
        "setback-containment": {
            positive: {
                en: "Supports limiting the spread of one setback into unrelated tasks or relationships.",
                es: "Respalda limitar que un contratiempo afecte tareas o relaciones no relacionadas.",
            },
            risk: {
                en: "Setbacks may spill into unrelated work areas and reduce consistency under pressure.",
                es: "Los contratiempos pueden extenderse a areas no relacionadas y reducir consistencia bajo presion.",
            },
        },
        "recovery-orientation": {
            positive: {
                en: "Supports recovery within a healthy timeframe after pressure or disappointment.",
                es: "Respalda recuperacion en un plazo saludable despues de presion o decepcion.",
            },
            risk: {
                en: "Recovery after setbacks may take longer, which can matter in fast-paced roles.",
                es: "La recuperacion despues de contratiempos puede tomar mas tiempo, relevante en roles dinamicos.",
            },
        },
    };
    return risk ? copy[competencyId].risk[locale] : copy[competencyId].positive[locale];
}
function extractAQEvidence(input, locale) {
    const scored = scoreFrom(input);
    const assessmentId = input.assessmentId ?? input.id ?? input.name;
    const totalNormalized = (0, scales_1.normalizeScore)(scored.total, 200);
    const signals = [
        {
            id: `${assessmentId}:aq:resilience-under-pressure`,
            assessmentId,
            assessmentName: input.name,
            assessmentKey: "aq",
            competencyId: "resilience-under-pressure",
            competencyLabel: (0, taxonomy_1.competencyLabel)("resilience-under-pressure", locale),
            kind: "resilience",
            score: scored.total,
            maxScore: 200,
            normalizedScore: totalNormalized,
            direction: (0, scales_1.evidenceDirection)(totalNormalized),
            strength: (0, scales_1.evidenceStrength)(totalNormalized),
            statement: totalStatement(totalNormalized, locale),
            businessImpact: totalImpact(totalNormalized, locale),
            limitation: locale === "es"
                ? "AQ no mide habilidad tecnica, experiencia laboral, motivacion ni ajuste completo al rol."
                : "AQ does not measure technical skill, work experience, motivation, or full role fit.",
            rawEvidence: locale === "es"
                ? `Puntuacion AQ total ${scored.total}/200`
                : `Total AQ score ${scored.total}/200`,
        },
    ];
    for (const dimension of DIMENSIONS) {
        const raw = scored[dimension.id];
        const normalizedScore = (0, scales_1.normalizeScore)(raw, 50);
        const label = dimension.label[locale];
        signals.push({
            id: `${assessmentId}:aq:${dimension.id}`,
            assessmentId,
            assessmentName: input.name,
            assessmentKey: "aq",
            competencyId: dimension.competencyId,
            competencyLabel: (0, taxonomy_1.competencyLabel)(dimension.competencyId, locale),
            dimensionId: dimension.id,
            dimensionLabel: label,
            kind: "resilience",
            score: raw,
            maxScore: 50,
            normalizedScore,
            direction: (0, scales_1.evidenceDirection)(normalizedScore),
            strength: (0, scales_1.evidenceStrength)(normalizedScore),
            statement: dimensionStatement(label, normalizedScore, locale),
            businessImpact: dimensionImpact(dimension.competencyId, normalizedScore, locale),
            limitation: locale === "es"
                ? "Debe validarse con ejemplos recientes de presion, responsabilidad y recuperacion."
                : "Should be validated with recent examples of pressure, accountability, and recovery.",
            rawEvidence: `${label} ${raw}/50`,
        });
    }
    return signals;
}
