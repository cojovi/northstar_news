# Publication gate

`assertPublicationReady({ id, data, body, review })` is a synchronous assertion for the build loader. `id` is `category/slug`, without a leading slash or `.md`, and its slug must match `data.slug`. It returns without changing the input or throws `Error("Publication blocked (<id>): <reason>")`. It does no fetching, writing, rendering or publication itself. The actual `scripts/lib/load-articles.js` loader calls this assertion before normalization; actual-loader regressions exercise rejection through the production path.

## Fixed historical scope

`legacy-publication-ids.json` contains exactly 136 sorted, unique routes published at Git revision `02c10cb932fcd1149987eec4c8d13b7c21eb36df`. It is a checked-in historical inventory, not a list generated from today's content. Never add new routes to it as part of publishing. Dates, author names and `indexable: false` cannot grandfather a new published route.

Derivation used `git ls-tree -r --name-only <revision> content`, restricted to `content/<category>/<file>.md`, then `git show <revision>:<file>` for each original source. Frontmatter was parsed with `gray-matter` and `js-yaml` using `yaml.JSON_SCHEMA`, matching `parseArticleSource` in the loader. Only `status: published` was selected; IDs use the directory category and parsed `data.slug`, not the filename. The test's `baseline()` function reproduces the derivation and compares every ID with the static JSON.

One original file has invalid YAML: `content/us/feasting-on-evidence-the-luigi-mangione-murder-case-takes-a-darkly-humorous-twist.md` has a title wrapped in doubled quotes. For that exact file only, the derivation asserts that original defect and omits the title line **in memory** before YAML parsing. Its slug and status are parsed unaltered. The other 135 published files parse without this exception. No original files were repaired, and no live generators were run to derive this inventory.

Historical published routes without a ready publication block retain their existing pending or partial evidence notices. Historical credits remain unverified where the author registry marks them `legacy`; this gate never upgrades a byline or a source-review status. This is route grandfathering, not approval of the historical text or future edits at that route.

Explicit `withdrawn`, `review-hold` and `draft` statuses do not require new-publication approval. Existing `normalizeArticle` makes those records nonindexable, including when raw metadata says `indexable: true`; the loader currently skips drafts. Changing a new route back to `published` invokes all new-publication checks. Missing or unknown statuses are rejected by the assertion.

## New published routes

All of these checks apply even if raw metadata sets `indexable: false`:

- `author` and `author_slug` exactly match an entry in `src/data/authors.json` whose kind is `person` or `organization`. Registered historical identities with kind `legacy` cannot be used for new publications. An organizational desk credit does not assert human review.
- `content_type` is explicit and belongs to `CONTENT_TYPES` from `authority.js`. Category or satire-flag defaults do not qualify.
- `body` is a string with nonempty trimmed text. There is no word-count threshold or semantic truth heuristic.
- Evidence merges `data.evidence` and `review.evidence`, with sidecar fields taking precedence, as normalization does. It requires `status` of `reviewed` or `partial`, an ISO calendar date or timestamp in `reviewed_at`, nonblank `summary` and `limits`, and a safe, non-placeholder HTTP(S) `record_url`.
- Sources follow normalization's existing conventions: `data.sources`, merged `evidence.sources`, and literal HTTP(S) body links. Explicit lists must be arrays; their entries may be URLs or objects with `url`. At least one source is required. Invalid explicit source entries fail rather than disappear. URLs are normalized for ledger membership, without fetching. Unsupported schemes, credentials, reserved example/test/invalid/local hosts, loopback hosts and recognizable placeholder hostnames are rejected. These are bounded lexical checks, not comprehensive detection of fabricated URLs.
- `review.publication.status` must be `ready`. `review.publication.source_sha256` must equal SHA256 of **`body.trim()` encoded as UTF8**, using Node `createHash("sha256")`. The lowercase hexadecimal digest is computed from actual parsed Markdown body bytes; frontmatter is excluded. Editing the trimmed body invalidates the assertion until its approval record is revisited. Surrounding whitespace alone does not change the hash.
- `review.publication.claim_ledger` must be a nonempty array. Every entry must be an object with nonblank `claim` and `supporting_excerpt`, a safe `source_url` present in the collected evidence sources, and `attribution` equal to `source-statement`, `analysis`, `uncertain` or `independent-finding`. Every entry is checked; malformed entries cannot be ignored. The ledger belongs inside `review.publication`.

If **any** record, including historical or withdrawn material, carries `review.publication.status: "ready"`, its body, evidence, hash and ledger are checked too. An invalid ready assertion throws; it never silently falls back to pending. The new-author and explicit-type requirements apply to new published routes, so validating an existing ready assertion does not reclassify its historical credit. Historical partial sidecars without a publication block keep their disclosed scope.

## What approval records do and do not establish

This gate enforces structure and binds an approval record to a particular body. It does not prove that the ledger covers every load-bearing claim, that a supporting excerpt is authentic or supports its claim, that a source tells the truth, or that an article is independently corroborated. Attribution labels are descriptions, not certifications. In particular, `independent-finding` is not proof of independence. The gate neither requires nor establishes human review, actual interviews, credentials, field reporting or completed fact-checking.

Actual source checks must still occur before publication. The person or process preparing the record must inspect the cited material, check material claims and chronology, preserve attribution, disclose relationships, and record unresolved limits truthfully. Computing a fresh hash after a text edit is not a substitute for revisiting the evidence and approval.

A syntactically valid `record_url` can still be nonexistent or misleading. Production review links must resolve to an actual public record with the represented scope; do not invent links to satisfy this gate. In the current snapshot, `/source-reviews` is built from `src/data/source-reviews.json` by `src/lib/pages.js`, and `RoutePage.js` renders review sections with `id: review.slug`. Adding a sidecar under `content/reviews/` alone does **not** publish a new register entry. Future integration must maintain the public register (or another real public record), including the matching anchor and truthful visible review wording. The current register renderer labels entries partial and not full fact-checks; any extension must preserve truthful scope. Checking record pages and source availability is an integration/editorial responsibility; this module performs no HTTP or rendered-anchor checks.

## Loader integration and regression checks

The production loader imports `assertPublicationReady` and calls it immediately after parsing the source and its real review sidecar, before `normalizeArticle`:

```js
assertPublicationReady({
  id: category + "/" + data.slug,
  data,
  body: content,
  review,
});
```

The existing `assertNoMockTemplate(content, data.status)` gate is retained. Errors abort the build rather than being caught and downgraded. `tests/publication-gate.test.js` covers the assertion; `tests/publication-loader-gate.test.js` exercises synthetic additions through the actual loader in disposable copies. No synthetic article is written to the publication corpus.

Use Node 22 and the active profile's managed scratch for temporary fixtures and npm cache. Run the complete test, typecheck, build, lint and output-verification gates, not just the isolated assertion tests. Tests validate structure and integration, not the truth of sources or article claims.
