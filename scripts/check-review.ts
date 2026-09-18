import {getCliClient} from 'sanity/cli';
const client = getCliClient({apiVersion:'2026-09-01'});
console.log(await client.fetch('*[_id == $id]{_id,reviewStatus}', {id:'drafts.8b4c82c3-9e70-4884-986d-82c8a46189bf'}, {perspective:'raw'}));
