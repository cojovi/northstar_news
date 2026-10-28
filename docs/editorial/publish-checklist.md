# Source-first release checklist

This is a prospective release gate, not a claim that historical entries passed.

- [ ] Material claims have an actual dated source record and a claim ledger. Distinguish allegations and interpretation; hold unsupported high-risk claims.
- [ ] Byline is an approved registry identity. Automated assistance uses the publication desk. No inferred credentials or invented reviewer.
- [ ] Content type is explicit. Affiliated and sponsored relationships are disclosed near the top. Shared-owner repetition is not corroboration.
- [ ] Sources are working URLs to the actual records; no invented links, interviews, quotes, awards or testing claims.
- [ ] Image provenance/license and illustrative status are recorded; alt text and measured dimensions are accurate.
- [ ] Original dates are retained. Corrections identify the specific change and do not pretend review is complete.
- [ ] Compare bodies, not headlines. Export the sister archive to an approved local `{url,content}[]` JSON file; run `node scripts/check-duplicate-content.js --candidate content/<category>/<slug>.md --comparison-json docs/editorial/sister-export.json`. This tool does no network publishing. Exit 1 means a >=0.8 five-word-shingle match needs a documented editorial decision. Exit 0 with Northstar only does not satisfy the sister check.
- [ ] If near-duplicate bodies exist, hold the new article or document a consolidation/redirect decision. If reporting is genuinely different, preserve self canonicals. Do not rewrite either story with made-up facts to evade detection.
- [ ] Run all checks in the playbook; inspect article ending, sources, author, tag/topic paths, feeds and HTTP 404s in preview.
- [ ] Confirm the newsletter/email claim matches verified sending capability. RSS/Atom works without collection; no test signups or messages during implementation.
- [ ] Release owner reviews the concrete diff and preview. Notifications are a separate authorized operation after production availability; they do not prove indexing. Ordinary articles must not use the restricted Google Indexing API. `scripts/notify-google.py` retains verified Search Console sitemap submission/readback semantics.
