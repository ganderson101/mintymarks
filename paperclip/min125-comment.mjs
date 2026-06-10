const API=process.env.PAPERCLIP_API_URL,KEY=process.env.PAPERCLIP_API_KEY,RUN=process.env.PAPERCLIP_RUN_ID,CO=process.env.PAPERCLIP_COMPANY_ID;
const MIN125="b45440b9-a5c2-4462-a43a-58c50708c28b";
async function api(path,opts={}){const r=await fetch(`${API}${path}`,{...opts,headers:{Authorization:`Bearer ${KEY}`,"X-Paperclip-Run-Id":RUN,"Content-Type":"application/json",...(opts.headers||{})}});const t=await r.text();let j;try{j=JSON.parse(t)}catch{j=t}return{status:r.status,body:j};}

const body=[
"**CEO triage + decomposition — MIN-125 User statistics**",
"",
"Studied the repo. Good news: most of the plumbing already exists (per-user sessions, per-question answer rows, Laplace weak-topic scoring + mastery state, and spaced-repetition due-flags). So this is mostly assembly + a clean stats endpoint + a thoughtful mobile UI - not a from-scratch build.",
"",
"**Load-bearing design rule** that satisfies your 'delete a session -> erased from stats' requirement: statistics are computed LIVE from the session rows, never cached. So deleting a session (with a confirm step) automatically updates every statistic, for free.",
"",
"**Decomposed into 3 children + the hard-gate chain:**",
"- **MIN-126 (pedagogy-engineer) - ACTIVE now.** The consult you asked for: defines exactly which stats to show, how to rank weak topics, and the 'not enough data yet' thresholds (the clever part). Design only.",
"- **MIN-127 (backend-engineer) - queued behind MIN-126.** Read-only stats endpoint: per-day question counts, current+longest streak (timezone-aware), per-subject/level/topic rollups with 'touched' flags (so untouched areas collapse), and hasEnoughData flags. + tests.",
"- **MIN-128 (frontend-engineer) - queued behind MIN-126+127.** The page itself: simple by default, tap to drill down (overview -> subject -> level -> topic -> session -> per-question), mobile-first, weak topics surfaced, untouched subjects hidden, delete-with-confirm.",
"",
"**Hard gates before anything reaches the live app:** test-guardian (tests green) -> safety-privacy PASS (it shows a child their own data + adds a delete) -> release-verifier GO. All build work stays on a feature branch; nothing merges to main until those pass.",
"",
"No decision needed from you right now - you gave latitude to be imaginative and I'm running with it. I'll route MIN-127 then MIN-128 automatically as each upstream lands. Full spec: paperclip/reports/min125-user-statistics-spec-2026-06-08.md.",
].join("\n");

const c=await api(`/api/issues/${MIN125}/comments`,{method:"POST",body:JSON.stringify({body})});
console.log("COMMENT:",c.status,JSON.stringify(c.body).slice(0,200));

// Verify child statuses
const list=await api(`/api/companies/${CO}/issues?limit=400`);
const arr=Array.isArray(list.body)?list.body:(list.body.issues||list.body.data||[]);
for(const k of ["MIN-125","MIN-126","MIN-127","MIN-128"]){
  const i=arr.find(x=>(x.identifier||x.key)===k);
  console.log(k,"->",i?.status,"| assignee:",i?.assigneeAgentId);
}
