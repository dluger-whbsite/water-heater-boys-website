# Water Heater Boys owner preview

Private Cloudflare Workers preview:
https://water-heater-boys-owner-preview.dluger.workers.dev/

This preview is a static snapshot of the Astro build. It does not update immediately when a Sanity job is published; rebuild and redeploy the preview until the planned GitHub/Cloudflare build automation is connected. The existing Wix site and waterheaterboys.com domain are not connected to this Worker.

Cloudflare account: `b40f136956186504f9e4861e69c3e110`.
Worker: `water-heater-boys-owner-preview`.
Access application: `4674f170-1906-4918-9341-39e0b933421c`.
Reusable allow policy: `345b6d0b-48c4-483e-9acd-5ab121348bd0`.
One-time PIN identity provider: `ddef826c-66e3-4e0a-b0a8-85b8b907d100`.

The Access policy allows only these five exact work emails: `dluger@waterheaterboysllc.com`, `dpurnomo@waterheaterboysllc.com`, `pharsono@waterheaterboysllc.com`, `ldimarumba@waterheaterboysllc.com`, and `tmedrano@waterheaterboysllc.com`. Reviewers open the preview URL and sign in using the emailed one-time code. To admit additional reviewers later, add their exact email addresses to the existing reusable policy. Do not create an `Everyone` rule. Worker preview URLs are disabled. The public site remains Wix until separately approved.

Deploy only the Astro output (`site/dist`). The Worker code adds `X-Robots-Tag: noindex, nofollow` to asset responses, and the Astro preview HTML itself includes `noindex`. The `scripts/cloudflare-assets.mjs` helper omits the local workflow page and checks preview HTML for noindex before registering asset hashes. The source deployment configuration is `wrangler.preview.jsonc`.

Unauthenticated checks on 2026-09-15 returned Cloudflare Access redirects (HTTP 302) for `/`, `/services/gas-tank-water-heaters/`, `/assets/brand/rick-hero.jpg`, and `/_astro/SiteHead.bemXESCW.css`. Authorized sign-in still needs a real browser test by the allowed user.
