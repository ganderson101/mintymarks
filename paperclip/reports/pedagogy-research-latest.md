# Pedagogy-research note — 2026-06-07

*Recurring artifact (fortnightly refresh). Template for the rest follows this shape.
Author: pedagogy-engineer · Issue MIN-37 · lands in George's evening digest (MIN-36).*

Three of the newest evidence-based learning-science findings relevant to MintyMarks
(KS2→A-level, durable learning). Each: source + what it would mean for us.

**1. Spaced retrieval works in maths — but its size scales with prior mastery.**
2025 meta-analysis (Educational Psychology Review) confirms spacing + retrieval
practice durably improve maths learning; a primary-school study in the same line
found the spacing benefit *depends on initial practice performance*.
→ *For us:* validates our SM-2 + quizzing core. The lever is making the **interval
itself** mastery-aware, not just the topic mix — a child who already half-knows a
topic gains most from longer gaps. (Source: [Springer EPR 2025](https://link.springer.com/article/10.1007/s10648-025-10035-1), [Frontiers primary-school 2025](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2025.1632206/full))

**2. Interleaving (mixing topics) beats blocking by a wide margin.**
Rearranging practice so problem *types* alternate (ABCABC, not AABBCC) is a
"desirable difficulty": interleavers scored 63% vs blockers' 20% at a one-week
delay in maths. It looks worse in the moment, which is why it's under-used.
→ *For us:* our 70/30 weakness-biased `selectTopic` can serve the same topic in
long runs (the "cornering" risk already flagged in MIN-35 §2). A simple
no-immediate-repeat / interleave constraint would turn that into a strength.
(Source: [AFT — Interleaving in Math](https://www.aft.org/ae/spring2020/agarwal_agostinelli), [Chartered College 2025](https://my.chartered.college/research-hub/how-interleaving-can-help-students-retain-maths-knowledge/))

**3. Pretesting / errorful generation: a wrong guess *before* the answer helps.**
2024–25 work on the pretesting effect shows attempting (and failing) a question
before seeing the answer beats errorless study, and the failed guess fuels
curiosity to learn the correct answer.
→ *For us:* validates surfacing the explanation right after a miss (planned MIN-35
P1), and suggests showing a question *before* any teaching, not only as assessment.
(Source: [Pretesting effect, PMC 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC12292081/), [Prequestions/errorful generation, OSF 2024](https://osf.io/k235q/))

## Recommendation
**Ship interleaving as the next pedagogy change (#2).** It is the highest
leverage-per-line-of-code: a small selection constraint that prevents back-to-back
repeats of one topic, directly fixing the "cornered child" risk while adding a
well-evidenced durable-learning gain. It needs no backend/SRS-contract change and
slots cleanly behind MIN-35's selection work.
