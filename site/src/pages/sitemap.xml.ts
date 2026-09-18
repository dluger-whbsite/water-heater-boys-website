import type {APIRoute} from 'astro';
import {serviceAreas} from '../lib/serviceAreas';
import {getCollection} from 'astro:content';

const origin='https://www.waterheaterboys.com';
const articles=await getCollection('blog');
const routes=[
  '/',
  '/blog/',
  '/faqs/',
  '/privacy-policy/',
  '/disclaimer/',
  ...articles.map((article)=>`/post/${article.id}/`),
  '/about-us/',
  '/service-areas/',
  ...serviceAreas.map((area)=>`/service-areas/${area.slug}/`),
  '/services/gas-tank-water-heaters/',
  '/services/tankless-water-heaters/',
  '/services/heat-pump-water-heaters/',
  '/services/plumbing/',
  '/services/safety-shut-off-valves/',
];

export const GET:APIRoute=()=>new Response(
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((route)=>`  <url><loc>${origin}${route}</loc></url>`).join('\n')}\n</urlset>\n`,
  {headers:{'Content-Type':'application/xml; charset=utf-8'}},
);
