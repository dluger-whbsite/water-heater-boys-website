import {createClient} from '@sanity/client';
const client=createClient({projectId:'28nfeuw0',dataset:'production',apiVersion:'2026-09-01',useCdn:false,perspective:'published'});
const jobs=await client.fetch(`*[_type=="completedJob"]|order(city asc){_id,city,zip,title,description,problem,workPerformed,legacyId}`);
const fields=['title','description','problem','workPerformed'];
const findings=[];
for(const job of jobs){
 const matches=[];
 for(const field of fields){
  const values=[...String(job[field]||'').matchAll(/\b9\d{4}\b/g)].map(match=>match[0]);
  if(values.length)matches.push({field,values,text:job[field]});
 }
 if(matches.length)findings.push({_id:job._id,city:job.city,structuredZip:job.zip||null,legacyId:job.legacyId||null,matches});
}
console.log(JSON.stringify({publishedJobs:jobs.length,jobsWithEmbeddedZip:findings.length,findings},null,2));
