# Spanish Translation Review Plan

## Current state

Spanish is the default product language, but most Spanish assessment question banks are still marked as draft in `lib/questions/es/*.ts`.

Reviewed today:

- `aq`
- `critical-thinking`

All other Spanish assessment banks should be treated as AI-translated draft content until a human reviewer approves them.

## Release rule

Do not describe draft Spanish assessment content as professionally reviewed or validated.

For demos, draft translations may be shown if the audience understands they are pending final language QA. For production hiring decisions, each Spanish question bank should be reviewed before being actively sold as Spanish-ready.

## Recommended gate

Short term:

- Keep draft tests available for internal QA and demos.
- Maintain `TRANSLATION_STATUS = "draft" | "reviewed"` in every Spanish question file.
- Track a manual QA checklist per assessment before marking a file as reviewed.

Before broad Spanish launch:

- Add an internal admin/ops view that lists Spanish translation status by assessment.
- Add reviewer name, reviewed date, and notes in a durable source of truth.
- Prevent marketing/admin copy from implying reviewed Spanish content where `TRANSLATION_STATUS = "draft"`.

## Human review checklist

For each Spanish assessment:

- Formal usted register is used consistently.
- LATAM vocabulary is natural for Argentina and Guatemala.
- Question intent matches the English source.
- Answer options preserve scoring meaning and difficulty.
- No option accidentally gives away the correct answer.
- No grammar, gender, or agreement issues.
- Timers, result labels, categories, dimensions, and instructions are localized.
- Sensitive hiring language avoids unsupported clinical, legal, or discriminatory claims.

## Recommended reviewer workflow

1. Export one assessment's English and Spanish question bank side by side.
2. Reviewer checks semantic accuracy and professional tone.
3. Reviewer flags wording changes without modifying scoring logic.
4. Engineering updates only display text in `lib/questions/es`.
5. Update `TRANSLATION_STATUS` to `"reviewed"` after approval.
6. Record the reviewer/date in this plan or the future ops view.

## Priority order

Review these first for near-term LATAM B2B demos:

1. Customer Service Skills
2. Sales Aptitude
3. Communication Skills
4. Integrity & Ethics
5. Situational Judgment
6. Emotional Intelligence
7. Teamwork & Collaboration
8. Leadership Styles
