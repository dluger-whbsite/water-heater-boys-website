import {defineType,defineField} from 'sanity';
export const completedJob=defineType({name:'completedJob',title:'Completed Jobs',type:'document',fields:[
 defineField({name:'title',title:'Job title',type:'string',description:'Optional for new jobs. Preserves the original title for migrated jobs.'}),
 defineField({name:'city',title:'City',type:'string',validation:r=>r.required(),options:{list:['San Francisco','San Mateo','Palo Alto','San Carlos','Foster City','San Jose','Walnut Creek','Danville','San Ramon','Pleasant Hill','Clayton','Newark','Santa Clara','Fremont','Oakland','Redwood City','Livermore','Mountain View','Hayward','Burlingame','Concord','Pleasanton','Los Altos Hills','Sunnyvale','Union City','Danville/Blackhawk','Daly City','San Bruno','Dublin','Belmont','Redwood Shores','Castro Valley','Hillsborough']}}),
 defineField({name:'zip',title:'ZIP code',type:'string',description:'Optional. Keep blank when unknown.'}),
 defineField({name:'serviceType',title:'Service type',type:'string',validation:r=>r.required(),options:{list:[{title:'Gas tank water heater',value:'gas-tank'},{title:'Tankless water heater',value:'tankless'},{title:'Heat pump water heater',value:'heat-pump'},{title:'General plumbing',value:'plumbing'}]}}),
 defineField({name:'equipment',title:'Equipment / brand / model',type:'string',description:'Optional. Enter what you know.'}),
 defineField({name:'description',title:'Existing job description',type:'text',rows:5,hidden:({document})=>!document?.legacyId,validation:r=>r.custom((value,ctx)=>ctx.document?.legacyId&&!value?'Preserve the existing job description.':true)}),
 defineField({name:'problem',title:'What was the original problem?',type:'text',rows:3,validation:r=>r.custom((value,ctx)=>!ctx.document?.legacyId&&!value?'Please describe the original problem.':true)}),
 defineField({name:'workPerformed',title:'What work did you complete?',type:'text',rows:3,validation:r=>r.custom((value,ctx)=>!ctx.document?.legacyId&&!value?'Please describe the work performed.':true)}),
 defineField({name:'completionDate',title:'Completion date',type:'date',description:'Leave blank if unknown for an older imported job.'}),
 defineField({name:'photos',title:'Job photos',type:'array',validation:r=>r.required().min(1).max(12),of:[{type:'image',options:{hotspot:true},fields:[{name:'alt',title:'Photo description',type:'string',description:'Optional short description of what the photo shows.'}]}],description:'Add several photos. Put your best finished-installation photo first. Use photos cleared for website use.'}),
 defineField({name:'reviewStatus',title:'Review status',type:'string',initialValue:'draft',readOnly:true,options:{list:['draft','submitted','approved']}}),
 defineField({name:'publishedAt',title:'Recent-jobs feed date',type:'datetime',description:'Set on first publication. For Wix imports use the historical publication date or an explicitly chosen legacy ordering date.'}),
 defineField({name:'legacySourceUrl',title:'Original Wix page',type:'url',fieldset:'migration'}),
 defineField({name:'legacyId',title:'Stable import ID',type:'string',readOnly:true,fieldset:'migration'}),
 defineField({name:'legacyImageFilename',title:'Mapped source image filename',type:'string',readOnly:true,fieldset:'migration'}),
 defineField({name:'legacyOrder',title:'Source portfolio order (not a date)',type:'number',readOnly:true,fieldset:'migration'}),
 defineField({name:'legacyOriginalTitle',title:'Original title before cleanup',type:'string',readOnly:true,fieldset:'migration'}),
 defineField({name:'legacyOriginalDescription',title:'Original description before cleanup',type:'text',readOnly:true,fieldset:'migration'}),
 defineField({name:'migrationNotes',title:'Migration review notes',type:'text',fieldset:'migration'})
],fieldsets:[{name:'migration',title:'Wix migration details',options:{collapsible:true,collapsed:true}}],preview:{select:{title:'city',subtitle:'title',media:'photos.0'}}});
