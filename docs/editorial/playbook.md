# Editorial playbook

Cody Viveiros owns The Northstar Ledger and PROTOCOL SENTINEL. They are shared-owner publications, not independent confirmation of each other. Automation assists research, drafting and publishing. Human review of all historical articles has not been established.

## Identity and labels

`src/data/authors.json` is the stable registry. New automated output uses `northstar-desk` (Organization), through `content/author_registry.py`. Do not assign invented people, degrees or credentials. Preserve historical credits and their legacy identity notices. Owner identity is not a credential and does not establish that the owner reviewed each story.

Set `content_type` to news, analysis, opinion, satire or sponsored. Explain paid or affiliated relationships before the body. Never use satire to retroactively excuse unsupported factual claims. The archive's existing labels require review, not automatic conversion to verified news.

## Source-first workflow

1. Define a narrow question and collect actual dated source URLs. Record the document title, date, relevant passage and what it does and does not establish. Named outlets without links are leads.
2. Build a claim ledger before drafting. Mark each important assertion as supported, disputed or unresolved. Do not manufacture quotations, sources, credentials, awards, revenue, endorsements, field observations or interviews.
3. Draft within those limits. Differentiate source claims from established facts and interpretation. Preserve source dates, scope, denominators, units and counterevidence. Do not infer professional expertise from a Dr. prefix.
4. Review high-risk claims individually: allegations, criminal matters, health, finance, identities, awards, affiliations. If the record cannot support the claim, qualify it, omit it from new work or hold publication. A disclaimer does not validate an unsupported claim.
5. Record media provenance separately: creator/tool, source URL, permission/license evidence, transformations and illustrative versus documentary purpose. Avoid stock-credit text for generated art. Do not invent a visual description or aspect ratio.
6. Run the duplicate gate against Northstar and an exported sister archive before release. Similar bodies with different titles are still duplicates. Do not cross-canonicalize genuinely distinct articles. A consolidation requires an explicit reviewed decision and relevant redirect.
7. Use the publish checklist. A technical green build does not complete editorial source review. Existing optional auto-publish functions are not evidence of a review gate; operators must complete this checklist before enabling them.

## Corrections and retention

Current archive integrity action (2026-10-28): retain 136 article URLs/dates; 70 withdrawal notices (69 exact template provenance matches plus the separate CMAC award withdrawal), 3 publication review holds, 2 explicitly labeled satire/fiction records, and 61 promotable entries. Keep the ten partial documentary reviews separate; they overlap these groups and are not ten full fact-checks. Promotional eligibility is not verification. `/archive-integrity` lists every exact template match with original title/date/source/hash and action date. This code/template provenance check makes no finding that subject claims are false.

Use `status: review-hold` and `indexable: false` for retained accounts awaiting primary evidence. Explain the actual missing basis prominently, without claiming an investigation or declaring claims false. For the Forbes/GQ accounts, actual issuer/feature evidence is needed; for the CMAC financial/quotation account, actual podcast/transcript and appropriate business records are needed. Do not invent them. Two existing mixed comic narratives now use `content_type: satire`, `is_satire: true`, and `indexable: false`, with explicit fiction titles/deks/byline-area/body notices and `BlogPosting` schema. Their original bodies remain historical fiction, not biography or authenticated award accounts.

Sidecar `kind` distinguishes `template-provenance`, `fiction-classification` and `publication-review-hold`; normalization exposes `review_kind`, with scoped partial records identified as `documentary-source-review`. Provenance/classification sidecars keep `evidence.status: pending`. Public documentary review records retain their original summaries, sources and limits. Never sum overlapping groups into an externally fact-checked-story total.

Keep original published/updated timestamps unless a documented article update actually occurred. Add dated correction notes explaining changes; disclosure-only changes do not make old reporting new. Keep URLs and correction history where practicable. Removal/consolidation needs an explanation or meaningful redirect, never a silent homepage substitute.

The contact route points to the publisher website. Delivery, response times and confidential handling are not verified. Do not solicit confidential records or call this a secure tip channel. Public pending notices mean review is incomplete. Existing affiliated text remains historical text, not verified text.

## Technical publication path

`npm run content` parses YAML on Node with JSON schema (dates remain exact strings), applies sidecars and normalization, and creates the browser JSON snapshot. Browser, prerender, schema and discovery consume this normalized model. Do not manually edit the snapshot; edit Markdown, the registry or review sidecars, then regenerate.

The loader rejects literal mock bodies and the exact unsupported interview paragraph preserved in `scripts/generate-mock-content.js`, including legacy published entries. Withdrawn notices are retained. This is a narrow template gate, not keyword censorship or a factual certification of other prose. Generator imports and default invocation write nothing. Fixture generation requires `node scripts/generate-mock-content.js --fixtures-dir tests/fixtures/explicit-output`; never point it at publication content. It refuses traversal, symlinks, production paths and existing files, and emits visible mock drafts credited to the organizational desk. Generator regression tests run default/import checks on an isolated copy with a sentinel content directory.

All discovery consumers use the shared state/indexability policy. Withdrawals, holds and noindex fiction stay out of promotional news lists, related/search results, feeds and sitemaps. Category/tag URLs remain navigable; empty categories are noindex and omitted from prominent section navigation. Public correction and integrity pages may clearly link retained records.

Required checks: `npm test`, `npm run typecheck`, `npm run build`, `node scripts/verify-social-metadata.js`, `node scripts/verify-authority-output.js`, `npm run lint`. The static server `npm run serve:static` serves built files and genuine 404s without SPA fallback. Parent release review must verify Vercel clean URL resolution, redirects and 404 status on preview before deployment.
