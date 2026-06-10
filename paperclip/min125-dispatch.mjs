const API=process.env.PAPERCLIP_API_URL,KEY=process.env.PAPERCLIP_API_KEY,RUN=process.env.PAPERCLIP_RUN_ID,CO=process.env.PAPERCLIP_COMPANY_ID;
const PARENT_ID="b45440b9-a5c2-4462-a43a-58c50708c28b";
const PEDAGOGY="51bf5a89-0599-44cf-94ca-9ec3a39b3f67";
const BACKEND="c9459690-f674-4d72-8a16-1e48a1725bcc";
const FRONTEND="499a2e40-f610-4ad1-a310-e971a74a5ae1";
async function api(path,opts={}){const r=await fetch(`${API}${path}`,{...opts,headers:{Authorization:`Bearer ${KEY}`,"X-Paperclip-Run-Id":RUN,"Content-Type":"application/json",...(opts.headers||{})}});const t=await r.text();let j;try{j=JSON.parse(t)}catch{j=t}return{status:r.status,body:j};}
function mk(title,description,assignee,priority,status){const b={title,description,parentId:PARENT_ID,assigneeAgentId:assignee,priority};if(status)b.status=status;return api(`/api/companies/${CO}/issues`,{method:"POST",body:JSON.stringify(b)});}

const CONTINUITY=[
"",
"## Continuity (MIN-6)",
"On wake read paperclip/state/<your_agent_id>_checkpoint.json; if it matches this issue and status is in_progress, resume from nextStep. Rewrite the checkpoint before/after each major step. Drive your own status to done; use blocked only with a named unblock owner+action. Do not ask George to do what the agent chain can resolve."
].join("\n");

const pedDesc=[
"## Objective (DESIGN ONLY - no code, no shipped changes)",
"Define the authoritative statistics spec for a new learner-facing User Statistics page (parent MIN-125). George explicitly asked that a pedagogy agent be consulted for which stats are worth tracking and displaying. Your output is the spec that MIN-127 (backend) and MIN-128 (frontend) implement.",
"",
"## Context / architecture (already verified by CEO)",
"- Per-user data lives in: GET /sessions, GET /sessions/{id}/answers, GET /progress/topics (Laplace weakness + mastery state per subject/category), GET /progress/srs (isDue). Full findings: paperclip/reports/min125-user-statistics-spec-2026-06-08.md.",
"- Hard rule: stats must be DERIVED LIVE from session/answer rows so deleting a session erases it from stats automatically. Design with that in mind.",
"",
"## Deliverable: a spec document at paperclip/reports/min125-pedagogy-stats-spec-2026-06-08.md, covering:",
"1. The stat set. Confirm George explicit asks (days practised, total questions, questions-per-day, current+longest day streak) AND propose additional pedagogically-valuable stats (e.g. accuracy trend over time, mastery distribution, weak-topic ranking method, SRS topics-due-for-review count, retention/forgetting signal, time-per-question, consistency/regularity, improvement velocity). For EACH: what it is, why it helps a KS2-A-level learner/parent, and which existing data source computes it.",
"2. Weak-topic surfacing. Exactly how to rank and present weaker topics (reuse the existing Laplace weakness + mastery_state - specify the formula/ordering, how many to show, the wording).",
"3. 'Not enough data' thresholds. The crux of George 'clever enough to know when it cannot show meaningful stats'. Give concrete minimums (e.g. min attempts per topic before a weakness verdict; min active days before a trend; min sessions before per-day averages) and the exact fallback copy to show instead ('Keep practising to unlock this').",
"4. Streak definition. Day boundary (user timezone), what counts as an active day, grace rules if any.",
"5. Untouched subjects/levels. Rule for collapsing/hiding subjects+levels with zero activity so they take little/no space.",
"6. Drill-down hierarchy. Recommended levels of the simple->detailed path (e.g. overview -> subject -> level -> topic -> session -> per-question) and what number/insight sits at each level on a MOBILE screen.",
"7. Safety note for safety-privacy to later check: anything about showing a child their own performance that could demotivate (frame weak topics constructively).",
"",
"## Constraints",
"- Pure design/research. Do NOT edit code, the engine, the bank, or any contract. Write only the spec doc (untracked report file is fine; no commit needed).",
"- Keep it implementable and concrete (numbers, formulas, copy), not abstract.",
"",
"## Done = spec doc written + a completion comment summarising the stat set + thresholds. CEO routes MIN-127/128 off your spec. Do not delegate; do not hire.",
"Parent: MIN-125.",
CONTINUITY
].join("\n");

const beDesc=[
"## Objective",
"Add a read-only stats aggregation endpoint to the backend so the User Statistics page (MIN-125) can render quickly without heavy client computation, AND so that deleting a session erases it from stats for free.",
"",
"## BLOCKED until MIN-126 (pedagogy stats spec) lands. CEO will unblock and confirm the final stat list. You may pre-read the code now.",
"",
"## Design rules (load-bearing)",
"- Compute EVERYTHING live from the user session + answer rows (and reuse progress.py weakness/mastery + srs logic). NO denormalised stats table/cache. Deleting a session (DELETE /sessions/{id}, already implemented) must therefore automatically change the stats with zero extra code.",
"- Additive only: a NEW endpoint (e.g. GET /stats or GET /progress/overview). Do NOT change the contract of existing endpoints.",
"",
"## What to implement (final shape per MIN-126 spec; baseline from George explicit asks)",
"- Per-day activity: list of {date, questionsAnswered, correct, sessions} for active days (drives the calendar/heatmap + per-day counts).",
"- Streak: current consecutive-active-day streak + longest ever, using the user timezone for the day boundary (spec from MIN-126).",
"- Totals: total questions, total correct, total time, total sessions, distinct active days.",
"- Per (subject, level, topic) rollups: attempts, accuracy, mastery_state, weakness score, lastPracticed; plus a touched flag so the frontend can collapse untouched subjects/levels.",
"- Per-stat hasEnoughData flags using the MIN-126 thresholds, so the UI shows 'keep practising to unlock' instead of noisy numbers.",
"- SRS: count of topics currently due for review.",
"",
"## Constraints",
"- Branch feat/min125-user-stats cut from origin/main (not local main, not a dirty tree). Commit. Do NOT merge to main.",
"- Add pytest covering: aggregation correctness on seeded sessions, the streak edge cases (timezone boundary, gaps), the hasEnoughData thresholds, and that deleting a session changes the aggregate.",
"",
"## Acceptance criteria",
"- New read-only endpoint returns the above, derived live. Existing endpoints unchanged. pytest green (state how you ran it + counts in your comment). Branch + commit hash in the comment.",
"",
"## Gate chain after you finish (CEO routes; do NOT merge): test-guardian (HARD) -> safety-privacy PASS (HARD) -> release-verifier (HARD). Do not delegate; do not hire.",
"Parent: MIN-125. Spec: paperclip/reports/min125-user-statistics-spec-2026-06-08.md + MIN-126 output.",
CONTINUITY
].join("\n");

const feDesc=[
"## Objective",
"Build the User Statistics page (MIN-125): simple by default, drill-down by tapping, mobile-first.",
"",
"## BLOCKED until MIN-126 (stats spec) + MIN-127 (stats endpoint) land. CEO unblocks. You may pre-read Dashboard.jsx / Results.jsx / src/api/sessions.js now and prototype layout.",
"",
"## Requirements (from George, verbatim intent)",
"- Simple by default; the user drills down by tapping parts of the display (overview -> subject -> level -> topic -> session -> per-question, per MIN-126 recommended hierarchy). Use the existing GET /sessions/{id}/answers for the per-question leaf.",
"- Show: which days practised + questions-per-day (a compact calendar/heatmap works well on mobile), totals, and streak (current + longest).",
"- Mobile-first: must fit a phone screen and stay intuitive - progressive disclosure, not a wall of numbers.",
"- Surface weaker topics prominently and constructively (use the weakness ranking + copy from MIN-126).",
"- Not-enough-data intelligence: when MIN-127 says hasEnoughData=false, show the friendly 'keep practising to unlock' state instead of a misleading number.",
"- Untouched subjects/levels take little/no space - collapse or hide anything with touched=false.",
"- Delete a session from history -> confirm dialog -> on confirm call DELETE /sessions/{id}; stats update automatically (backend derives live). The confirm step is mandatory.",
"- Latitude to be imaginative within MIN-126 stat set.",
"",
"## Constraints",
"- Branch feat/min125-user-stats (same branch as MIN-127; rebase/branch off their commit so endpoint+UI land together). Cut from origin/main. Frontend-only. Do NOT merge to main.",
"",
"## Acceptance criteria",
"- Reachable stats page; default view is simple; tapping drills down; renders correctly at mobile width (state how you verified - build + a width check/screenshot).",
"- Untouched subjects/levels are collapsed/hidden. Weak topics surfaced. 'Not enough data' states show correctly. Delete-with-confirm works and stats reflect the deletion. No regressions; build passes. Files changed + commit hash in your comment.",
"",
"## Gate chain after you finish (CEO routes; do NOT merge): test-guardian (HARD) -> safety-privacy PASS (HARD) -> release-verifier (HARD). Do not delegate; do not hire.",
"Parent: MIN-125. Spec: paperclip/reports/min125-user-statistics-spec-2026-06-08.md + MIN-126/127 output.",
CONTINUITY
].join("\n");

const r1=await mk("MIN-125 design: pedagogy statistics spec (which stats + thresholds)",pedDesc,PEDAGOGY,"high");
console.log("PEDAGOGY:",r1.status,r1.body.key||r1.body.identifier||JSON.stringify(r1.body).slice(0,300));
const r2=await mk("MIN-125 backend: read-only stats aggregation endpoint",beDesc,BACKEND,"high","blocked");
console.log("BACKEND:",r2.status,r2.body.key||r2.body.identifier||JSON.stringify(r2.body).slice(0,300));
const r3=await mk("MIN-125 frontend: user statistics page (drill-down, mobile, delete-with-confirm)",feDesc,FRONTEND,"high","blocked");
console.log("FRONTEND:",r3.status,r3.body.key||r3.body.identifier||JSON.stringify(r3.body).slice(0,300));
