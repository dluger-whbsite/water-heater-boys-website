import {useState} from 'react';
import {useClient,useDocumentOperation,type DocumentActionComponent} from 'sanity';
export const SubmitForReview:DocumentActionComponent=props=>{
 const client=useClient({apiVersion:'2026-09-01'});
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState<{title:string;body:string}|null>(null);
 const submitted=props.draft?.reviewStatus==='submitted';
 return {
  label:busy?'Submitting…':submitted?'Submitted for review':'Submit for review',
  disabled:busy||!props.draft,
  onHandle:async()=>{
   if(!props.draft)return;
   if(submitted){setMessage({title:'Submitted for review',body:'This job is waiting for an office editor to review and publish it. Submitting does not publish it on the website.'});return;}
   setBusy(true);
   try{
    // Only update the existing draft, leaving all job fields and the published version alone.
    await client.patch(props.draft._id).set({reviewStatus:'submitted'}).commit();
    setMessage({title:'Submitted for review',body:'Your job has been saved for review. An office editor can now review and publish it. It is not published on the website yet.'});
   }catch(error){
    setMessage({title:'Submission failed',body:error instanceof Error?error.message:'Please check your connection and try again.'});
   }finally{setBusy(false);}
  },
  dialog:message?{type:'dialog',header:message.title,content:<p>{message.body}</p>,onClose:()=>{setMessage(null);props.onComplete();}}:undefined
 };
};
export const PublishJob:DocumentActionComponent=props=>{const {patch,publish}=useDocumentOperation(props.id,props.type);return {label:'Publish approved job',disabled:Boolean(publish.disabled),onHandle:()=>{patch.execute([{setIfMissing:{publishedAt:new Date().toISOString()}},{set:{reviewStatus:'approved'}}]);publish.execute();props.onComplete();}}};
PublishJob.action='publish';
