import {getCliClient} from 'sanity/cli';
const client=getCliClient({apiVersion:'2026-09-01'});
console.log(await client.fetch('*[_type=="completedJob"]{_id,city,title,equipment,problem,workPerformed,legacyId,"assets":photos[].asset._ref}',{}, {perspective:'raw'}));
