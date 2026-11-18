import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const origin='https://www.waterheaterboys.com';
const read=route=>readFileSync(`site/dist${route}index.html`,'utf8');
const schemas=html=>[...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(match=>JSON.parse(match[1]));
const sitemap=readFileSync('site/dist/sitemap.xml','utf8');
const cityRoutes=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match=>new URL(match[1]).pathname).filter(route=>/^\/service-areas\/[^/]+\/$/.test(route));
const counties=['San Francisco County','San Mateo County','Contra Costa County','Alameda County','Santa Clara County'];

test('every built city page identifies its local service and the existing business',()=>{
  assert.ok(cityRoutes.length>0,'No city pages found in the built sitemap');
  const ids=new Set();
  for(const route of cityRoutes){
    const html=read(route),data=schemas(html);
    const services=data.filter(item=>item['@type']==='Service');
    assert.equal(services.length,1,route);
    const service=services[0],business=data.find(item=>item['@type']==='Plumber');
    assert.equal(service['@id'],`${origin}${route}#service`);
    assert.ok(!ids.has(service['@id']),'City Service IDs must be unique');ids.add(service['@id']);
    assert.equal(service.url,`${origin}${route}`);
    assert.equal(service.provider['@id'],business['@id']);
    assert.equal(business['@id'],`${origin}/#business`);
    assert.deepEqual(business.areaServed.map(area=>area.name),counties);
    assert.equal(service.areaServed['@type'],'City');
    const city=service.areaServed.name;
    assert.ok(service.name.endsWith(`in ${city}`));
    assert.ok(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1].includes(`in ${city}`));
    assert.ok(counties.includes(service.areaServed.containedInPlace.name));
    assert.equal(service.areaServed.containedInPlace.containedInPlace.name,'California');
    assert.deepEqual(service.serviceType,['Water heater installation','Plumbing services']);
    assert.ok(!('geo' in service)&&!('address' in service),'Do not invent city branches');
  }
});

test('city-specific Service schema does not leak onto other page types',()=>{
  for(const route of ['/','/service-areas/','/services/gas-tank-water-heaters/','/about-us/','/blog/','/post/my-water-heater-is-leaking-what-should-i-do/']){
    assert.equal(schemas(read(route)).filter(item=>item['@type']==='Service').length,0,route);
  }
});
