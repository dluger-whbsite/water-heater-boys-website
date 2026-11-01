# Production publishing

The four paid landing pages and their Jobber forms are approved production content. Do not replace them with older repository snapshots, downloaded live-page baselines, or saved build folders.

- Build from the current GitHub main source with `node scripts/build-site.mjs --production`.
- Before publishing, run `node scripts/verify-paid-landings.mjs` against the actual assets directory being uploaded (pass a directory argument for an alternate package). Do not bypass this check with a temporary Wrangler configuration.
- Production config runs this check automatically. Keep this safeguard in place.
- Run relevant tests, use `--keep-vars`, and verify the four public URLs after publication.
- Commit and push approved landing-page source changes so other publishers receive them. Do not include unrelated unfinished changes.
- Jobber form IDs: 40g 5308180; 50g 5308159; 75g 5308187; generic 5326861. Retired shared form 2079447 must not return on these pages.
- Winter offers: 40g $50 off $1,850 = $1,800; 50g $50 off $1,950 = $1,900; 75g $100 off a job-specific quote, no fixed installation price. Update the verifier together with any owner-approved future offer change.
- These checks validate website configuration, not Jobber's internal form settings or successful conversion receipt.
