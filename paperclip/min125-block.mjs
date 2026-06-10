const API=process.env.PAPERCLIP_API_URL,KEY=process.env.PAPERCLIP_API_KEY,RUN=process.env.PAPERCLIP_RUN_ID,CO=process.env.PAPERCLIP_COMPANY_ID;
async function api(path,opts={}){const r=await fetch(`${API}${path}`,{...opts,headers:{Authorization:`Bearer ${KEY}`,"X-Paperclip-Run-Id":RUN,"Content-Type":"application/json",...(opts.headers||{})}});const t=await r.text();let j;try{j=JSON.parse(t)}catch{j=t}return{status:r.status,body:j};}
const list=await api(`/api/companies/${CO}/issues?limit=400`);
const arr=Array.isArray(list.body)?list.body:(list.body.issues||list.body.data||[]);
const id=k=>arr.find(x=>(x.identifier||x.key)===k)?.id;
for(const k of ["MIN-127","MIN-128"]){
  const r=await api(`/api/issues/${id(k)}`,{method:"PATCH",body:JSON.stringify({status:"blocked"})});
  console.log(k,"PATCH blocked ->",r.status, r.body && r.body.status ? r.body.status : JSON.stringify(r.body).slice(0,160));
}
const re=await api(`/api/companies/${CO}/issues?limit=400`);
const a2=Array.isArray(re.body)?re.body:(re.body.issues||re.body.data||[]);
for(const k of ["MIN-126","MIN-127","MIN-128"]){const i=a2.find(x=>(x.identifier||x.key)===k);console.log(k,"=>",i?.status);}
