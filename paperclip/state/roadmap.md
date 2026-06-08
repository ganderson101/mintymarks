# MintyMarks Roadmap

## Done

- Adaptive quiz engine with SRS (spaced repetition)
- Weak topic detection with confidence-aware Wilson interval
- Maths questions: KS2 and KS3 coverage including factors/multiples fix
- Feedback system: in-session question reports + general feedback
- Biology question bank (KS3 spotcheck completed)
- Nightly digest email to George
- Board portal: invite-link login for family board members

## In Progress

- Individual-child care: struggle detection and encouragement model
- Biology question expansion
- Board member theme chooser
- **Vocab subject (11+/GL)** [MIN-114] — MCQ where options are definitions, dictionary entry in `solution`. Build: MIN-115 (question-author: GL 11+ word list + bank, v1 >=300 words) + MIN-116 (frontend-engineer: wire subject/level). Branch `feat/min114-vocab-11plus`. Gates: answer-verifier -> test-guardian -> release-verifier before merge. Spec: reports/min114-vocab-subject-spec-2026-06-08.md

## Planned

- More subjects (Chemistry, Physics, English, History)
- Audio message requests from board members
- Parent dashboard: per-child progress view
- Gamification: mastery badges (no streaks)
