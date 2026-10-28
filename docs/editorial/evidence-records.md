# Article evidence records

Place one JSON sidecar at `content/reviews/<category>/<slug>.json`, copying `evidence-template.json`. These files are editorial input, not articles. The filename must match a published article route. No source URL should be fabricated from a publisher name.

`affiliated: true` adds the ownership conflict notice. A false value does not override the automatic disclosure for Cody Viveiros, Cojovi or CMAC mentions. `notice` adds a legible unresolved-claims note to the evidence box. Neither field verifies claims or rewrites historical text.

`evidence.sources` accepts actual http(s) URLs or objects with a `url` field. Existing article URLs are also exposed as unverified source leads. An invalid or non-http URL is discarded. `evidence.status` defaults to pending. A reviewed record requires all of: public `record_url`, nonempty `summary`, explicit `limits`, a valid `reviewed_at` date and at least one actual source URL. This is a documented-review label, not a guarantee of accuracy or proof of human review. Do not create completed records without performing the described work.

`corrections` is an array of `{ "date": "ISO date", "note": "What changed and why", "url": "actual supporting URL, optional" }`. Correction notes are separate from the original article body. An undated note is labeled as undated. Do not claim a disclosure-only note repaired source deficiencies.

For serious claims keep a claim ledger in the review record: exact passage, evidence URL/date/passage, counterevidence, supported/disputed/unresolved finding and limits. The parent can add high-risk pending records using this format without changing the renderer. `npm run content` regenerates browser data and `npm run build` refreshes all static output.

## Targeted checks and withdrawals (2026-10-28)

Use `evidence.status: "partial"` for a dated, scoped check with `completed_full_factcheck: false`, actual checked source URLs, a summary, explicit limits and a public review URL. Incomplete records normalize to pending. The ten sanitized public records in `src/data/source-reviews.json` mirror the corresponding sidecars and render at `/source-reviews`, with actual anchor targets. Keep private packet paths and tool artifacts out of public review data.

A withdrawal uses frontmatter `status: withdrawn` and `indexable: false`. The loader retains the complete notice, original publication date and route. Both metadata paths set noindex; shared discovery filters exclude it from promotional lists, search results, related stories, hubs, feeds and article sitemaps. The source-review register and correction/ownership pages may link retained notices for transparency. A review date alone does not change an article’s update timestamp.

The separate `/archive-integrity` record lists 69 exact mock-template provenance matches, two fiction classifications and three publication holds. Sidecar `kind` is `template-provenance`, `fiction-classification` or `publication-review-hold`, exposed as `review_kind` in normalized data; the ten existing scoped partial reviews normalize as `documentary-source-review`. Template matches are complete normalized-body plus literal title/path comparisons, not external subject-matter fact-checks. Their evidence remains pending. A hold uses `status: review-hold` and `indexable: false`; the two fiction records use satire metadata plus `indexable: false`. Preserve original bodies beneath prominent notices for holds/fiction, and preserve Git originals for withdrawals. These record sets overlap; do not add their totals as verified stories.

For the shared-owner duplicate check, pass the actual source file read-only:

```sh
node scripts/check-duplicate-content.js --candidate content/tech/what-happens-after-you-swipe-right-on-tinder.md --comparison-source ../projectsentinal/blog/source/_posts/2026-10-22-what-happens-after-you-swipe-right-on-tinder.md
```

The regression test compares that exact body, requires substantial distinction, and preserves source provenance and the shared-research disclosure. PROTOCOL SENTINEL is the approved sister publication, https://protocolsentinel.com. NewsPredator remains only a historical byline identity.
