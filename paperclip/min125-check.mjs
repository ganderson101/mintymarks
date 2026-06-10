const API=process.env.PAPERCLIP_API_URL,KEY=process.env.PAPERCLIP_API_KEY,RUN=process.env.PAPERCLIP_RUN_ID,CO=process.env.PAPERCLIP_COMPANY_ID;
async function api(path,opts={}){const r=await fetch(`${API}${path}`,{...opts,headers:{Authorization:`Bearer ${KEY}`,"X-Paperclip-Run-Id":RUN,"Content-Type":"application/json",...(opts.headers||{})}});const t=await r.text();let j;try{j=JSON.parse(t)}catch{j=t}return{status:r.status,body:j};}
const list=await api(`/api/companies/${CO}/issues?limit=400`);
const arr=Array.isArray(list.body)?list.body:(list.body.issues||list.body.data||[]);
for(const k of ["MIN-125","MIN-126","MIN-127","MIN-128"]){
  const i=arr.find(x=>(x.identifier||x.key)===k);
  if(i) console.log(k,"=>",i.status,"| id:",i.id);
}
// Fetch comments on MIN-126
const m126=arr.find(x=>(x.identifier||x.key)==="MIN-126");
if(m126){
  const c=await api(`/api/issues/${m126.id}/comments`);
  const comments=Array.isArray(c.body)?c.body:(c.body.comments||c.body.data||[]);
  console.log("\nMIN-126 comments:",comments.length);
  for(const cm of comments.slice(-3)){console.log("---\n",cm.body?.slice(0,500));}
}
