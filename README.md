# Water Heater Boys completed-job proof of concept

Status: local source implementation. Sanity account, phone-accessible Studio, GitHub ownership, and automatic Cloudflare publishing are not connected yet. No individual job/project routes exist.

## Local development

Install with `pnpm install`, then `pnpm dev`. Public routes are `/`, `/services/gas-tank-water-heaters/`, and `/workflow/`. `pnpm test` verifies record placement and draft exclusion; `pnpm build` produces `site/dist`.

Create a free Sanity project in the company's account. Put its public project ID and dataset in `.env` using `.env.example`. Copy PUBLIC_SANITY variables into `site/.env` because Astro loads environment variables from its project root. Run `pnpm studio` for the real Sanity editor. Configure only the actual Studio origins as credentialed CORS origins. Use Sanity-hosted Studio for phone access after account connection. No purchase is needed for this test. Free editing users are administrators; submission is not an enforced authorization boundary.

Managers create Completed Jobs, enter city/service/details/date/photos, and use Submit for review. The reviewer uses Publish approved job. The first publish sets the feed date; subsequent corrections preserve it. Review-status fields are administrative context, not a security mechanism. Production queries use the published perspective and exclude drafts. Rebuild the Astro site after publication. Automatic build/deploy hookup must be completed against company-owned accounts before declaring the end-to-end test successful.

## Wix imports

`migration/example.json` illustrates a legacy job with stable identity, original page, unknown completion date, and image associations requiring verification. It is not imported or published automatically. Import in two phases: upload verified original photos through the Sanity Assets API, then write image references into each completedJob document. Keep source identifiers for repeatable, duplicate-free imports. Unknown dates stay null. Before publishing an older job, assign a documented legacy feed-order date so bulk imports do not overtake newly completed work. Review text and every photo association against Wix/originals.

## Ownership and exports

Company owns GitHub, Sanity, and Cloudflare accounts. Source and schemas belong in its private repository; credentials stay in environment secrets. Keep original photos and CMS exports outside Git. Sanity dataset export includes document JSON and image binaries by default; verify warnings and asset counts, and test restoring into a separate dataset before relying on backups. Do not expose private customer information or GPS metadata in public marketing assets.

## Acceptance test before expansion

1. A real manager signs into the hosted Studio from a phone and uploads several approved photos.
2. Draft is absent from the homepage and gas-tank section.
3. Reviewer publishes; automated build completes and both locations update.
4. Update and republish preserve first-publication ordering; unpublish removes the record after the next successful build.
5. A fourth published record displaces the oldest of the three homepage items.
6. Export and restore preserve text, photo associations, and ordering.

Do not mark the proof complete based only on fixture tests or local builds.
