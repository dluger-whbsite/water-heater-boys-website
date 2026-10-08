import {useDocumentOperation,type DocumentActionComponent} from 'sanity';

export const PublishJob:DocumentActionComponent=props=>{const {patch,publish}=useDocumentOperation(props.id,props.type);return {label:'Submit job',disabled:Boolean(publish.disabled),onHandle:()=>{patch.execute([{setIfMissing:{publishedAt:new Date().toISOString()}},{set:{reviewStatus:'approved'}}]);publish.execute();props.onComplete();}}};
PublishJob.action='publish';
