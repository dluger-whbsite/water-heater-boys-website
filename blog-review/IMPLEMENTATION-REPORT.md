# Water Heater Boys blog implementation report

Status: implemented, tested, and deployed to the private owner preview on September 16, 2026. The current public site remains Wix and was not changed.

The 13 article bodies were imported byte-for-byte from `approved-blog-handoff.md` after the title line. One H1 per article is retained; the page template supplies the existing site estimate section and related-article links. The new Astro blog uses a Git-owned content collection because this project did not previously have a blog/CMS model. No separate Sanity blog records were created.

## Article routes prepared for launch

| Handoff article | Final route |
| --- | --- |
| #19 Leaking water heater | `/post/my-water-heater-is-leaking-what-should-i-do/` |
| #15 Signs of failure | `/post/signs-your-water-heater-is-failing/` |
| #18 Tankless vs. traditional | `/post/tankless-vs-traditional-water-heater-which-is-better-for-my-home/` |
| #12 Big-box vs. plumber | `/post/why-choosing-a-professional-water-heater-over-big-box-stores-saves-you-money/` |
| #10 Tankless pricing | `/post/understanding-tankless-heater-pricing-factors-influencing-installation-costs/` |
| #7 Toilet repair or replacement | `/post/is-it-time-to-replace-your-toilet-here-s-why-upgrading-makes-sense/` |
| #14 Safety upgrades | `/post/essential-safety-devices-for-your-home/` |
| #5 Sewer line repair | `/post/sewer-line-repair-in-the-bay-area/` |
| #3 Heat pump guide, including merged #16 | `/post/thinking-about-a-heat-pump-water-heater-here-s-what-bay-area-homeowners-should-know-before-replacin/` |
| #2 Electric tankless | `/post/should-you-install-an-electric-tankless-water-heater/` |
| #9/#17 Homeowner Rule 9-6 guide | `/post/is-california-banning-gas-water-heaters/` |
| #1 Property-manager rules | `/post/what-bay-area-property-managers-should-know-about-the-2027-water-heater-rules/` |
| #8 Replacement cost | `/post/water-heater-replacement-cost-in-the-bay-area-what-to-expect-and-how-to-save/` |

The blog index is `/blog/`. The article routes are included in the site sitemap.

## Permanent redirects prepared in the Worker

- Old #9 `replacing-a-water-heater-in-california-is-about-to-get-harder-here-s-how-to-prepare` → definitive homeowner rules article.
- Old #16 `should-i-switch-to-a-hybrid-electric-water-heater` → merged heat pump guide.
- Old #5 `sewer-line-repair-in-the-east-bay-what-homeowners-should-know-before-paying-for-another-clearing` → Bay Area sewer article.
- Old #14 `california-home-insurance-now-requires-automatic-shutoff-valves-how-much-should-it-cost` → safety upgrades article.

These are true 301 responses in the deployed private-preview Worker. They are **not active yet** on Wix.

## Retired posts

Old #4 descaling, #6 shower water/filtration, #11 gas water heater maintenance, and #13 plumbing inspection are not in the new blog. Their exact old `/post/` URLs return HTTP 410 Gone on the private preview rather than redirecting to an unrelated page. These responses are **not active yet** on Wix.

## Human review / unresolved implementation items

- Original blog featured-image files were not in the current project. The Wix image URLs were identified, but the low-resolution Wix thumbnail URLs are not a suitable long-term image source. Supply or export the original image files if those images should appear on the new pages. The copy is intact without them.
- The rule articles accurately label January 2028 as a proposal rather than an adopted date as of this implementation. Recheck Bay Area Air District Rule 9-6 immediately before public launch and after its anticipated Board decision.
- The article collection is Git/Markdown, not Sanity. If office staff later need to edit blogs in a browser, a Sanity article schema/import can be added without changing the public URLs or article template.
- The owner preview contains the finished blog implementation behind the existing Cloudflare Access login. No production domain or Wix configuration was changed.

## Verification

- Full Astro build succeeded: 31 pages, including the blog index and all 13 articles.
- All 17 repository tests passed, including a byte-for-byte copy check, route/link check, 301 redirect check, and 410 retirement check.
- Live browser checks confirmed the blog index and a complete article render correctly behind Cloudflare Access.
- Cloudflare Worker version `95b9b8ee-3add-4050-9613-9b846dfbd623` is deployed at the unchanged owner-preview URL.
