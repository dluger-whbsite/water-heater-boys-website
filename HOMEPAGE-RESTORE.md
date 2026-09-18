# Approved homepage restored in Astro

The approved homepage-concept/app/page.tsx and custom globals.css were reused in the Astro project, not redesigned. Original concept source and deployment remain untouched.

Homepage renders the React component at build time through @astrojs/react with no client hydration. Tailwind/shadcn imports were removed because this page uses explicit custom CSS, not utility components.

Preserved: navy/yellow branding, logo, hero and installation photo, warranty callout, trust strip, four service cards, work section, about/process section, service areas, existing Jobber iframe URL and fallback, footer, responsive styles.

Integrated: three Sanity jobs in the work section, optional native details disclosures, links to existing Astro water-heater service pages and specific job-card anchors (no individual job pages). Unbuilt pages still link to Wix. Original hardcoded project examples are no longer the homepage feed. Imported jobs remain behind new manager jobs in ordering.

Checks: Astro static build and nine tests passed. Separate Edge browser checked 1440px desktop and 390px phone layouts, all sections, three CMS images, disclosures, and lack of horizontal overflow/page errors. Screenshots are under backups/homepage-review/. No customer request was submitted.

Remaining: Jobber returned a security challenge, and the iframe request was blocked in the automated browser (ERR_BLOCKED_BY_RESPONSE). Its rendering needs confirmation in a normal browser; the original service-request fallback remains available. No workaround for the security check was attempted. Business claims copied from the approved design still require owner signoff before production launch. Service-page visual redesign is the next separate step.
