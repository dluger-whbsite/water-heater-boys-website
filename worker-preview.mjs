import {normalizedPath,redirectFor,retiredPaths} from './worker-routes.mjs';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const destination=redirectFor(url);
    if(destination)return Response.redirect(destination.toString(),301);
    if (retiredPaths.has(normalizedPath(url))) {
      return new Response('This article has been retired.', {status: 410, headers: {'X-Robots-Tag':'noindex, nofollow'}});
    }
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    headers.set('X-Robots-Tag', 'noindex, nofollow');
    return new Response(response.body, {status: response.status, headers});
  }
};
