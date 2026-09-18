import {normalizedPath,redirectFor,retiredPaths} from './worker-routes.mjs';

const securityHeaders={
  'Referrer-Policy':'strict-origin-when-cross-origin',
  'X-Content-Type-Options':'nosniff',
  'X-Frame-Options':'SAMEORIGIN',
  'Permissions-Policy':'camera=(), geolocation=(), microphone=()',
};

export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(url.hostname==='waterheaterboys.com'){
      url.hostname='www.waterheaterboys.com';
      return Response.redirect(url.toString(),301);
    }

    const destination=redirectFor(url);
    if(destination)return Response.redirect(destination.toString(),301);

    const path=normalizedPath(url);
    if(retiredPaths.has(path)){
      return new Response('This article has been retired.',{status:410,headers:{'X-Robots-Tag':'noindex, nofollow',...securityHeaders}});
    }
    if(path==='/workflow'){
      return new Response('Not found',{status:404,headers:{'X-Robots-Tag':'noindex, nofollow',...securityHeaders}});
    }

    const response=await env.ASSETS.fetch(request);
    const headers=new Headers(response.headers);
    for(const [name,value] of Object.entries(securityHeaders))headers.set(name,value);
    if(response.status===404)headers.set('X-Robots-Tag','noindex, nofollow');
    return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
  },
};
