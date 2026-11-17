import {readFile, readdir} from 'node:fs/promises';
import {resolve, relative, sep} from 'node:path';

// Audit the rendered HTML, including static landing pages and Markdown posts.
const root=resolve(process.argv[2]||'site/dist');
const decode=text=>text.replace(/&#(x[\da-f]+|\d+);/gi,(_,n)=>String.fromCodePoint(n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n))).replace(/&(amp|lt|gt|quot|apos|nbsp);/g,(_,n)=>({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '})[n]);
const plain=html=>decode(html.replace(/<[^>]*>/g,' ')).replace(/\s+/g,' ').trim();
async function walk(dir){
  const files=[];
  for(const entry of await readdir(dir,{withFileTypes:true})){
    const path=resolve(dir,entry.name);
    if(entry.isDirectory())files.push(...await walk(path));
    else if(entry.name.endsWith('.html'))files.push(path);
  }
  return files;
}
const pages=[];
for(const file of (await walk(root)).sort()){
  const html=await readFile(file,'utf8');
  const path='/'+relative(root,file).split(sep).join('/').replace(/index\.html$/,'');
  const h1=[...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(match=>plain(match[1]));
  const robots=[...html.matchAll(/<meta\b[^>]*name=["']robots["'][^>]*>/gi)].map(match=>match[0]).join(' ');
  pages.push({path,indexable:!robots.includes('noindex')&&path!=='/workflow/',h1,title:plain(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'')});
}
const issues=[];
const seen=new Map();
for(const page of pages){
  if(page.h1.length!==1||!page.h1[0])issues.push({path:page.path,issue:'Expected one nonempty H1',h1:page.h1});
  if(page.indexable&&page.h1.length===1){
    const key=page.h1[0].toLowerCase();
    if(seen.has(key))issues.push({path:page.path,issue:'Duplicate H1',other:seen.get(key)});
    else seen.set(key,page.path);
  }
}
console.log(JSON.stringify({root,total:pages.length,indexable:pages.filter(p=>p.indexable).length,issues,pages},null,2));
if(issues.length)process.exitCode=1;
