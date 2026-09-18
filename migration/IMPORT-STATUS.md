# Wix migration status

## Publication update — September 12, 2026

At the user's explicit request, all 70 imported jobs were approved and published. Sanity verification confirms 57 gas-tank, 6 tankless, 7 heat-pump records and no remaining imported drafts. Existing non-target records were verified unchanged. The corrected ZIPs were checked before publication. Source content, photos and unknown completion dates were preserved. Before/after backups are in backups/; publication results are in prepared/publication.json. The draft-only status and verification described below document the earlier import stage, not the current publication state.

Source: Water-Heater-Boys-Astra-Migration.zip supplied by the owner. README-FIRST-ASTRA.md read first. No Wix recrawl performed.

## Imported as drafts, September 12, 2026

70 Sanity drafts: 57 gas tank, 6 tankless, 7 heat pump. Every row reconciles with the package image manifest by category, filename, title, city, and source page. Source CSVs are unchanged in source-package/. Verification passed for all retained fields and the SHA-1 checksum of every uploaded photo. No migrated jobs were published. The existing Danville test job's revision is unchanged.

183 archive entries were extracted without overwriting duplicate names. Inventory retains archive names, original filenames, and hashes; short indexed local names avoid Windows filename-length failures. All 70 selected files are mapped in prepared/file-map.json. 57 matches were exact/byte-identical; 13 needed documented suffix/truncation or visual duplicate resolution in reviewed-image-overrides.json. GT-037 and TL-002 were converted from HEIC to JPEG with originals retained; conversions.json preserves checksums and provenance. Logos are kept separately in brand-source/logos.zip and were not imported as job photos. Unrelated assets were not uploaded.

Verification: prepared/verification.json. Local backup: backups/jobs-after-wix-import.json, plus pre-import snapshots. Nine tests and the Astro build pass. Service/home feed placement was tested with in-memory publication only; real imported jobs remain drafts and will not appear on the site until approved/published.

## Content mapping

- job_id -> legacyId and stable drafts.wix-{lowercase job_id} document ID.
- job_title -> title. Original retained in legacyOriginalTitle.
- city and ZIP remain strings; no location corrections inferred.
- description -> description. Original retained in legacyOriginalDescription. Do not invent a split into problem/workPerformed when the source combines them.
- service folder -> serviceType.
- image_filename -> legacyImageFilename; exact category-aware local matching, then Sanity asset reference.
- source_page -> legacySourceUrl, not a new route.
- no dates in source -> completionDate and publishedAt remain absent from imported drafts.
- legacyOrder records source order, not chronological order.

New manager entries still use problem/workPerformed. Legacy records use the same completedJob schema with their existing description. Once reviewed/published, legacy jobs appear on their service feed. Homepage prioritizes new manager jobs; legacy records only fill remaining slots and are explicitly labeled as Wix portfolio entries with unknown completion date. No fake dates are assigned. No /job or /project routes exist.

## Needs attention

- RESOLVED by owner on September 12: GT-031 = 94583; TL-004 = 94121. Corrected draft titles/descriptions/ZIP fields, preserved original source fields, and recorded repeatable overrides in owner-corrections.json. Neither job was published.
- Same-name Ryan images were visually resolved: Bradford White gas tank versus Rheem heat pump. Extensionless/truncated names were resolved using the supplied files and recorded mappings, not a recrawl.
- GT-037 triggered a Sanity HEIC processing error. Resuming after JPEG conversion skipped all 36 previously imported drafts. Both selected HEIC originals are retained.
- Existing manually entered Danville test job was inspected and preserved. No automatic duplicate-content merge was performed.
- ZIP-versus-city accuracy has not been independently verified; this audit checks internal consistency only.

## Runbook

Dry run (no account writes): pnpm exec sanity exec scripts/import-wix.ts

With images: append -- --images ABSOLUTE_IMAGE_DIRECTORY. Preserve gas-tank/, tankless/, heat-pump/ folders where available. Optional --file-map PATH uses a JSON object of source job ID to relative local path, for explicit renamed files only.

Import only after image preflight and review: pnpm exec sanity exec scripts/import-wix.ts --with-user-token -- --images ABSOLUTE_IMAGE_DIRECTORY --apply

Apply refuses all writes if any image is missing/ambiguous. It snapshots existing job documents under ignored backups/ before writes. It creates drafts with uploaded source images, never publishes or overwrites. Stable IDs allow safe retries after a partial failure. Existing source-ID records are skipped, including published versions. This is not an automatic duplicate-content merge. For these supplied archives, use --images migration/source-images-indexed --file-map migration/prepared/file-map.json. The extraction script refuses overwrite; do not rerun it on its existing destination. A partial first extraction in source-images/ was preserved after a Windows long-path error and is not used by the import.

Prepared payloads and image-check.json are generated by the same script. Keep source images and package in business-owned storage. The pre-import job snapshot is not a full asset backup; retain originals and use a full Sanity dataset export with assets for long-term backups.
