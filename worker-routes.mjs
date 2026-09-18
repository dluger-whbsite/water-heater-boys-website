export const permanentRedirects={
  '/about-us':'/about-us/',
  '/service-locations-bayarea':'/service-areas/',
  '/general-plumbing':'/services/plumbing/',
  '/services':'/#services',
  '/services/gas-tank-water-heater-installation':'/services/gas-tank-water-heaters/',
  '/services/gas-tankless-water-heater-installations':'/services/tankless-water-heaters/',
  '/services/hybrid-heat-pump-water-heater-installations':'/services/heat-pump-water-heaters/',
  '/services/safety-valves':'/services/safety-shut-off-valves/',
  '/contact-us':'/#estimate',
  '/request-service':'/#estimate',
  '/post/replacing-a-water-heater-in-california-is-about-to-get-harder-here-s-how-to-prepare':'/post/is-california-banning-gas-water-heaters/',
  '/post/should-i-switch-to-a-hybrid-electric-water-heater':'/post/thinking-about-a-heat-pump-water-heater-here-s-what-bay-area-homeowners-should-know-before-replacin/',
  '/post/sewer-line-repair-in-the-east-bay-what-homeowners-should-know-before-paying-for-another-clearing':'/post/sewer-line-repair-in-the-bay-area/',
  '/post/california-home-insurance-now-requires-automatic-shutoff-valves-how-much-should-it-cost':'/post/essential-safety-devices-for-your-home/',
};

export const retiredPaths=new Set([
  '/post/tankless-water-heater-descaling-why-it-matters-and-how-often-you-should-do-it',
  '/post/your-shower-water-might-be-aging-your-skin-faster-than-you-think-here-s-why-whole-house-filtration',
  '/post/maintaining-your-gas-water-heater-efficiently',
  '/post/why-every-home-needs-a-plumbing-inspection-and-why-we-offer-it-for-free',
]);

export function normalizedPath(url){
  return url.pathname.replace(/\/$/,'')||'/';
}

export function redirectFor(url){
  // Match only the exact legacy path. Canonical Astro pages end in a slash;
  // normalizing that slash here would redirect the destination back to itself.
  const destination=permanentRedirects[url.pathname];
  if(!destination)return null;
  return new URL(destination,url.origin);
}
