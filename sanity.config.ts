import {defineConfig} from 'sanity';
import {structureTool} from 'sanity/structure';
import {completedJob} from './studio/schemaTypes/completedJob';
import {PublishJob} from './studio/actions';
export default defineConfig({name:'water-heater-boys',title:'Water Heater Boys · Completed Jobs',projectId:process.env.SANITY_STUDIO_PROJECT_ID||'missing-project',dataset:process.env.SANITY_STUDIO_DATASET||'production',plugins:[structureTool()],schema:{types:[completedJob]},document:{actions:(actions,ctx)=>ctx.schemaType==='completedJob'?actions.map(a=>a.action==='publish'?PublishJob:a):actions}});
