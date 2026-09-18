import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('site/dist');
createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');let file=resolve(root,'.'+decodeURIComponent(url.pathname));if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403).end();return}if(!extname(file))file=resolve(file,'index.html');const data=await readFile(file);res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png'})[extname(file)]||'application/octet-stream');res.end(data)}catch{res.writeHead(404).end('Not found')}}).listen(4341,'127.0.0.1',()=>console.log('Preview ready at http://127.0.0.1:4341'));
