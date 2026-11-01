/* Keep Jobber's supported embed, but supply attribution before it initializes. */
(() => {
  const loader = document.currentScript;
  const url = new URL(loader.getAttribute('form_url'));
  const state = window.whbLandingAttribution;
  const current = new URLSearchParams(location.search);
  const forwardedByJobber = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];
  if (state) {
    for (const [key, value] of Object.entries(state.values)) {
      // Jobber's embed already copies current query parameters. Avoid duplicates.
      if (!current.has(key) || !forwardedByJobber.includes(key)) url.searchParams.set(key, value);
    }
    if (!current.has('utm_content') && !url.searchParams.has('utm_content')) {
      url.searchParams.set('utm_content', location.pathname.replace(/^\/|\/$/g, '') || 'homepage');
    }
    // "website" identifies the form's location; it makes no paid-ad claim.
    if (!state.values.utm_source) url.searchParams.set('utm_source', 'website');
  }
  const embed = document.createElement('script');
  embed.src = 'https://d3ey4dbjkt2f6s.cloudfront.net/assets/static_link/work_request_embed_snippet.js';
  embed.setAttribute('clienthub_id', loader.getAttribute('clienthub_id'));
  embed.setAttribute('form_url', url.toString());
  loader.parentNode.insertBefore(embed, loader.nextSibling);
})();
