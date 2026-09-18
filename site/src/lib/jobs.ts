import {createClient} from '@sanity/client';
export type Job={_id:string;city:string;zip?:string;title?:string;description?:string;serviceType:string;equipment?:string;problem?:string;workPerformed?:string;completionDate?:string;publishedAt?:string;photos:{url:string;alt:string}[];legacySourceUrl?:string;legacyId?:string;legacyOrder?:number};
export const connected=Boolean(import.meta.env.PUBLIC_SANITY_PROJECT_ID);
export async function loadJobs():Promise<Job[]>{
 if(!connected)return [];
 const client=createClient({projectId:import.meta.env.PUBLIC_SANITY_PROJECT_ID,dataset:import.meta.env.PUBLIC_SANITY_DATASET||'production',apiVersion:'2026-03-01',useCdn:false,perspective:'published'});
 return client.fetch(`*[_type == "completedJob" && defined(publishedAt)]{_id,city,zip,title,description,serviceType,equipment,problem,workPerformed,completionDate,publishedAt,legacySourceUrl,legacyId,legacyOrder,"photos":photos[]{"url":asset->url,alt}}`);
}
