const API=process.env.PAPERCLIP_API_URL,KEY=process.env.PAPERCLIP_API_KEY,RUN=process.env.PAPERCLIP_RUN_ID,CO=process.env.PAPERCLIP_COMPANY_ID;
async function api(path,opts={}){const r=await fetch(`${API}${path}`,{...opts,headers:{Authorization:`Bearer ${KEY}`,"X-Paperclip-Run-Id":RUN,"Content-Type":"application/json",...(opts.headers||{})}});const t=await r.text();let j;try{j=JSON.parse(t)}catch{j=t}return{status:r.status,body:j};}
const list=await api(`/api/companies/${CO}/issues?limit=400`);
const arr=Array.isArray(list.body)?list.body:(list.body.issues||list.body.data||[]);
const id=k=>arr.find(x=>(x.identifier||x.key)===k)?.id;

const TEST_GUARDIAN="01416e37-cbd2-437b-8237-cfd52e7204d1";
const SAFETY_PRIVACY="ca5efc91-c528-494a-ba00-6f38c286c331";
const RELEASE_VERIFIER="12d4fa9f-f580-42fa-890b-1e9482c800f8";

// Mark MIN-127 and MIN-128 done
for(const k of ["MIN-127","MIN-128"]){
  const r=await api(`/api/issues/${id(k)}`,{method:"PATCH",body:JSON.stringify({status:"done"})});
  console.log(k,"done:",r.body?.status||r.status);
}

// Unblock MIN-128 (already done above) - now create gate issues

const BRANCH="feat/min125-user-stats";
const COMMITS="cf2c40f (MIN-127 backend) + a032817 (MIN-128 frontend)";

const tgDesc=[
"## Gate: test-guardian HARD — MIN-125 User Statistics",
"",
"Verify the stats build on branch **feat/min125-user-stats** (`"+COMMITS+"`).",
"",
"## What to check",
"1. **Backend tests** (all suites): `cd backend && python -m pytest -v`. Should be **81+ tests, 0 failures**. The new suite is `test_stats_overview.py` (18 tests covering: no-sessions hasData=false, totals, streak edge-cases, thresholds, delete-cascade, subject-agnostic vocab, trend gating).",
"2. **Frontend build**: `npm run build` (or `npx vite build` if `npm run` unavailable). Must complete without errors (a pre-existing chunk-size warning is OK; it predates this branch).",
"3. **No regressions** to existing test suites: `test_auth_magic.py`, `test_avatar_coins.py`, `test_progress_mastery.py` — all must remain green.",
"",
"## Branch",
"feat/min125-user-stats — 2 commits ahead of origin/main.",
"",
"## Done = all tests green + build passes. State test counts in your comment. CEO routes safety-privacy next. Do not delegate; do not hire.",
"Parent: MIN-125.",
].join("\n");

const spDesc=[
"## Gate: safety-privacy PASS — MIN-125 User Statistics (BLOCKED on test-guardian)",
"",
"Audit the stats feature on **feat/min125-user-stats** for AADC compliance and privacy safety.",
"",
"## What to audit",
"1. **Data shown** is the child's OWN data only. No comparison to other children, no leaderboard, no global ranking. Confirm this in StatsPage.jsx.",
"2. **Weak-topic framing**: the section is labelled 'Worth practising more' with accuracy bars and mastery labels. Confirm the language does NOT use words like 'weak', 'bad', 'failing'. Check `WeakTopicsSpotlight` in StatsPage.jsx.",
"3. **Not-enough-data guard**: `MIN_TOPIC_ATTEMPTS = 3` — below this, no weakness verdict is shown. Confirm the threshold exists and is applied.",
"4. **Delete-with-confirm**: `SessionRow` in StatsPage.jsx shows 'Remove?' with Yes/No before calling `deleteSession`. Confirm the confirm step is mandatory (not skippable).",
"5. **Backend endpoint** (`GET /progress/overview` in backend/progress.py): confirm it returns only the authenticated user's data (Depends(get_current_user)), never leaks other users' rows, no PII beyond the user's own performance.",
"6. **No new data collection**: confirm the endpoint reads only existing columns (sessions, answers, topic_srs). No new columns, no new tables.",
"",
"## Done = PASS (or FAIL with specific required changes). State your verdict in the comment. CEO routes release-verifier on PASS. Do not delegate; do not hire.",
"Parent: MIN-125.",
].join("\n");

const rvDesc=[
"## Gate: release-verifier GO — MIN-125 User Statistics (BLOCKED on safety-privacy PASS)",
"",
"Final release check on **feat/min125-user-stats** before merge to main.",
"",
"## What to verify",
"1. Branch is clean off origin/main (check `git log --oneline origin/main..HEAD`).",
"2. `npm run build` passes (or `npx vite build`). No new build errors vs origin/main.",
"3. All backend tests pass (`python -m pytest -v` in backend/).",
"4. No unexpected files committed (binary blobs, secrets, temp scripts).",
"5. Commit messages follow the project convention (feat/merge/ci prefix, MIN-NNN in subject).",
"",
"## Done = GO (safe to merge) or STOP (with specific blockers). State verdict in comment. CEO merges to main on GO. Do not delegate; do not hire.",
"Parent: MIN-125.",
].join("\n");

function mk(title,desc,assignee){
  return api(`/api/companies/${CO}/issues`,{method:"POST",body:JSON.stringify({
    title,description:desc,parentId:id("MIN-125"),assigneeAgentId:assignee,priority:"high",status:"in_progress"
  })});
}

const rTG=await mk("MIN-125 gate: test-guardian (backend 81t + frontend build)",tgDesc,TEST_GUARDIAN);
console.log("test-guardian gate:",rTG.status,rTG.body?.key||rTG.body?.identifier);

// safety-privacy and release-verifier start blocked
const rSP_data={title:"MIN-125 gate: safety-privacy PASS (weak-topic framing, delete-confirm, own-data only)",description:spDesc,parentId:id("MIN-125"),assigneeAgentId:SAFETY_PRIVACY,priority:"high",status:"blocked"};
const rSP=await api(`/api/companies/${CO}/issues`,{method:"POST",body:JSON.stringify(rSP_data)});
console.log("safety-privacy gate:",rSP.status,rSP.body?.key||rSP.body?.identifier);

const rRV_data={title:"MIN-125 gate: release-verifier GO",description:rvDesc,parentId:id("MIN-125"),assigneeAgentId:RELEASE_VERIFIER,priority:"high",status:"blocked"};
const rRV=await api(`/api/companies/${CO}/issues`,{method:"POST",body:JSON.stringify(rRV_data)});
console.log("release-verifier gate:",rRV.status,rRV.body?.key||rRV.body?.identifier);

// Comment on MIN-125
const c=[
"**Build complete — routing hard-gate chain.**",
"",
"Both implementation issues are shipped to `feat/min125-user-stats` (2 commits ahead of origin/main):",
"- MIN-127 (backend) `cf2c40f`: `GET /progress/overview` — live-derived stats, timezone-aware streak, hasEnoughData flags, subject-agnostic (vocab works), reads ALL sessions. 18 new tests; 81 total pass.",
"- MIN-128 (frontend) `a032817`: `StatsPage.jsx` — activity heatmap (12 wks), streak card, weak-topics spotlight ('Worth practising more' framing), subject/level/topic drill-down, session detail (per-question review), delete-with-confirm on every session row. Untouched subjects take zero space. Mobile-first. Build passes.",
"",
"Gate chain started:",
"- test-guardian (HARD) — ACTIVE",
"- safety-privacy PASS (HARD) — blocked on test-guardian",
"- release-verifier GO (HARD) — blocked on safety-privacy",
"",
"Nothing merges to main until all three pass. CEO routes each gate as the upstream clears.",
].join("\n");
const rc=await api(`/api/issues/${id("MIN-125")}/comments`,{method:"POST",body:JSON.stringify({body:c})});
console.log("MIN-125 comment:",rc.status);
