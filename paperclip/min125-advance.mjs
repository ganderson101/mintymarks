const API=process.env.PAPERCLIP_API_URL,KEY=process.env.PAPERCLIP_API_KEY,RUN=process.env.PAPERCLIP_RUN_ID,CO=process.env.PAPERCLIP_COMPANY_ID;
async function api(path,opts={}){const r=await fetch(`${API}${path}`,{...opts,headers:{Authorization:`Bearer ${KEY}`,"X-Paperclip-Run-Id":RUN,"Content-Type":"application/json",...(opts.headers||{})}});const t=await r.text();let j;try{j=JSON.parse(t)}catch{j=t}return{status:r.status,body:j};}
const list=await api(`/api/companies/${CO}/issues?limit=400`);
const arr=Array.isArray(list.body)?list.body:(list.body.issues||list.body.data||[]);
const id=k=>arr.find(x=>(x.identifier||x.key)===k)?.id;
const M126=id("MIN-126"),M127=id("MIN-127"),M125=id("MIN-125");

// 1. Complete MIN-126 with the spec as the deliverable
const c126=[
"**MIN-126 spec delivered** → `paperclip/reports/min125-pedagogy-stats-spec-2026-06-08.md`.",
"",
"Authored against the real data model (sessions/answers + progress.py). Highlights for the build:",
"- Reuse `_laplace_weakness` + the mastery ladder verbatim (stats page must agree with the adaptive engine).",
"- **Subject-agnostic**: derive subjects/levels from the user's own rows (progress.py's hardcoded 4-subject regex + the 50-row history cap would both break stats — the new endpoint must avoid them).",
"- Thresholds table for 'not enough data' (weak label ≥3 attempts; topic accuracy ≥5; overall accuracy ≥20; trend ≥5 sessions/≥3 days; per-day avg ≥3 days). Each stat carries `hasEnoughData`.",
"- Streak = consecutive active days in the **user's timezone** (`?tz=` param), current streak allows yesterday-grace; longest = max run.",
"- Weak topics → framed **'Topics to practise next'** with mastery ladder + a Practise deep-link; never 'your weaknesses' (safety).",
"- Untouched subjects/levels: omitted from the tree, one collapsed 'not started yet' discovery line.",
"- Delete-with-confirm on the History session row → existing `DELETE /sessions/{id}`; live-derived stats update for free.",
"",
"Marking done. Routing MIN-127 (backend) now.",
].join("\n");
console.log("c126:",(await api(`/api/issues/${M126}/comments`,{method:"POST",body:JSON.stringify({body:c126})})).status);
console.log("MIN-126 done:",(await api(`/api/issues/${M126}`,{method:"PATCH",body:JSON.stringify({status:"done"})})).body.status);

// 2. Unblock MIN-127 (backend) → in_progress
console.log("MIN-127 unblock:",(await api(`/api/issues/${M127}`,{method:"PATCH",body:JSON.stringify({status:"in_progress"})})).body.status);
const c127=[
"**Unblocked — spec is final.** Build to `paperclip/reports/min125-pedagogy-stats-spec-2026-06-08.md` (§1 stat set, §3 thresholds, §4 streak, §5 untouched flags).",
"Reminders baked into that spec:",
"- Endpoint must be **subject-agnostic** (do NOT copy progress.py's `maths|physics|chemistry|biology` regex — vocab/11+ exists) and read **all** sessions (progress.py's history is LIMIT 50; stats need the full set).",
"- Reuse `_laplace_weakness` + `_mastery_state` from progress.py.",
"- Accept `?tz=` for the streak day boundary (default UTC).",
"- Emit `hasEnoughData` per stat and `touched` per (subject/level/topic).",
"- Live-derived only (no cache table) so delete cascades for free. + pytest incl. a 'delete a session changes the aggregate' test.",
"Branch `feat/min125-user-stats` off origin/main; do NOT merge. Comment when done so CEO routes the gate chain.",
].join("\n");
console.log("c127:",(await api(`/api/issues/${M127}/comments`,{method:"POST",body:JSON.stringify({body:c127})})).status);

// 3. Parent note
const c125=[
"**Progress:** pedagogy spec (MIN-126) delivered and closed → backend (MIN-127) unblocked and routed. Frontend (MIN-128) stays blocked on MIN-127. Gate chain (test-guardian → safety-privacy → release-verifier) unchanged.",
"Spec: `paperclip/reports/min125-pedagogy-stats-spec-2026-06-08.md`.",
].join("\n");
console.log("c125:",(await api(`/api/issues/${M125}/comments`,{method:"POST",body:JSON.stringify({body:c125})})).status);

const re=await api(`/api/companies/${CO}/issues?limit=400`);
const a2=Array.isArray(re.body)?re.body:(re.body.issues||re.body.data||[]);
for(const k of ["MIN-125","MIN-126","MIN-127","MIN-128"]){const i=a2.find(x=>(x.identifier||x.key)===k);console.log(k,"=>",i?.status);}
