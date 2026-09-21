import {spawnSync} from 'node:child_process';
import path from 'node:path';

const production=process.argv.includes('--production');
const astro=path.resolve('node_modules/astro/bin/astro.mjs');
// These values are public website configuration, not credentials. Keeping the
// project defaults here prevents a local preview deployment from silently
// building without the published job portfolio when no .env file is present.
const sanityProjectId=process.env.PUBLIC_SANITY_PROJECT_ID||'28nfeuw0';
const sanityDataset=process.env.PUBLIC_SANITY_DATASET||'production';
const result=spawnSync(process.execPath,[astro,'build','--root','site'],{
  stdio:'inherit',
  env:{
    ...process.env,
    PUBLIC_SITE_MODE:production?'production':'preview',
    PUBLIC_SANITY_PROJECT_ID:sanityProjectId,
    PUBLIC_SANITY_DATASET:sanityDataset,
  },
});

process.exit(result.status??1);
