/* Capture only campaign metadata; never form answers or customer details. */
(() => {
  if (!['waterheaterboys.com', 'www.waterheaterboys.com'].includes(location.hostname)) return;
  const measurementId = 'G-JLE3QE7HQ4';
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid', 'fbclid'];
  const query = new URLSearchParams(location.search);
  const now = Date.now();
  let previous = {};
  try {
    const saved = JSON.parse(sessionStorage.getItem('whb_campaign') || 'null');
    if (saved && now - saved.time < 30 * 60 * 1000) previous = saved.values;
  } catch { /* Tracking must not prevent someone from requesting service. */ }
  const explicit = keys.some(key => query.has(key));
  const values = explicit ? {} : {...previous};
  for (const key of keys) {
    const value = query.get(key);
    if (value && value.length <= 500) values[key] = value;
  }
  if (!values.utm_source) {
    if (values.gclid || values.gbraid || values.wbraid) {
      values.utm_source = 'google';
      values.utm_medium ||= 'cpc';
    } else if (location.pathname === '/nextdoor-gas-tank-replacement/') {
      // This URL is dedicated to the Nextdoor offer, not proof of a paid click.
      values.utm_source = 'nextdoor';
      values.utm_medium ||= 'paid_social';
    }
  }
  if (values.utm_source) values.utm_campaign ||= 'gas_tank_replacement';
  try { sessionStorage.setItem('whb_campaign', JSON.stringify({time: now, values})); } catch {}
  window.whbLandingAttribution = {values, measurementId};
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  const config = {};
  for (const [utm, field] of [['utm_source','campaign_source'], ['utm_medium','campaign_medium'], ['utm_campaign','campaign_name']]) {
    if (values[utm]) config[field] = values[utm];
  }
  window.gtag('config', measurementId, config);
  const tag = document.createElement('script');
  tag.async = true;
  tag.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(tag);
})();
