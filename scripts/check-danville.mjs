import {createClient} from '@sanity/client';
const id='8b4c82c3-9e70-4884-986d-82c8a46189bf';
const client=createClient({projectId:'28nfeuw0',dataset:'production',apiVersion:'2026-09-01',useCdn:false,perspective:'raw'});
const records=await client.fetch('*[_id in $ids]{_id,_rev,_updatedAt,city,zip,title,equipment,description,problem,workPerformed,completionDate,reviewStatus,publishedAt}',{ids:[id,`drafts.${id}`]});
console.log(JSON.stringify(records,null,2));
