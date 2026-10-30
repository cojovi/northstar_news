import sourceReviews from "../data/source-reviews.json" with { type: "json" };
import archiveIntegrity from "../data/archive-integrity.json" with { type: "json" };
export const PAGES = {
  "about": {
    "title": "About The Northstar Ledger",
    "description": "Purpose, ownership and evidence limits.",
    "body": "The Northstar Ledger publishes news summaries, analysis and commentary about public decisions and their consequences. Our focus includes public spending, household and small-business policy costs, and institutional and platform decisions.\n\nCody Viveiros owns The Northstar Ledger and [PROTOCOL SENTINEL](https://protocolsentinel.com). Shared ownership and shared research mean the publications do not independently corroborate each other. Read [ownership and conflicts](/ownership).\n\nAI and other automation assist research, drafting and publishing. The Northstar Ledger Desk is the organizational byline responsible for automated publication; Cody Viveiros is the publisher. A desk credit does not mean a human editor reviewed an article. Historical bylines are retained with identity limits.\n\nOlder articles may contain unsupported claims. Read each article’s evidence notice and dated corrections. The [source-review register](/source-reviews) explains ten targeted reviews and what remains unchecked. [Topic guides](/topics) connect coverage and questions for further inquiry; they are not original investigations."
  },
  "ownership": {
    "title": "Ownership and conflicts",
    "description": "Cody Viveiros owns The Northstar Ledger and PROTOCOL SENTINEL.",
    "body": "Cody Viveiros is the owner and publisher of The Northstar Ledger and [PROTOCOL SENTINEL](https://protocolsentinel.com). Similar coverage across these publications may use shared research. It is not independent corroboration.\n\nCoverage involving Cody Viveiros, Cojovi or CMAC is affiliated coverage and carries a relationship disclosure. Disclosure does not substantiate a credential, award, commercial result or endorsement. The [publisher profile](/business/cody-viveiros-dfw-business-powerhouse) now provides affiliated ownership information. The [CMAC award account](/business/cmac-roofing-earns-top-texas-honor-and-charts-a-bigger-future-in-housing-and-construction-tech) is withdrawn pending source records.\n\nDated notices explain which unsupported assertions have been withdrawn without declaring them false. Earlier text remains in repository history. Other affiliated archive entries may still carry pending-evidence notices.\n\nAffiliated coverage requires both a clear relationship disclosure and identifiable supporting records. Paid placements must be labeled sponsored; the available archive does not establish whether a particular historical story was paid. See [standards](/standards)."
  },
  "standards": {
    "title": "Editorial standards and evidence limits",
    "description": "Sources, attribution, content types and review limits.",
    "body": "Claims need identifiable records and usable links. Distinguish a source’s statement from an independently established fact, and keep allegations, findings and analysis separate. Dates, identities, credentials and financial claims need particular care.\n\nNews summarizes reported events. Analysis interprets evidence. Opinion expresses a viewpoint. Satire and sponsored content require explicit labels. These labels do not excuse unsupported claims.\n\nA pending notice means a documented source review is incomplete. A partial source review names the records checked, the date and the limits; it does not verify every claim. Company or agency statements remain attributed statements. Review notices are not blanket fact-check badges. See the [source-review register](/source-reviews).\n\nAutomation supports research, drafting and publishing. The desk byline identifies organizational responsibility and does not claim human review. Interviews, field reporting, anonymous sourcing and independent tests require supporting evidence before they can be represented as completed work.\n\nFor publication, check material claims against actual records, confirm chronology, disclose affiliation and AI assistance, compare shared-owner coverage and record unresolved questions. These requirements do not establish that every historical article complied. Report a specific problem through [corrections](/corrections)."
  },
  "corrections": {
    "title": "Corrections and source reviews",
    "description": "Report an issue and understand dated editorial changes.",
    "body": "Report a correction through our [public GitHub issue form](https://github.com/cojovi/northstar_news/issues/new). Include the article URL, the disputed passage, a concise explanation and public source links. The [publisher website](https://cojovi.com/) is another contact option. There is no guaranteed response or response time.\n\nGitHub issues are public. Do not submit confidential information, personal records or sensitive material. These contact options are not a secure tip service and provide no promise of confidentiality.\n\nSubstantive corrections receive dated visible notes explaining what changed. Original publication dates are retained. An update date reflects a substantive change, not a newly reported event. A source-review date can record a limited check without changing the article’s update timestamp.\n\nWithdrawal removes an unsupported news account from the live body and retains its URL with an explanation. Withdrawn stories are excluded from indexing, promotional article lists and feeds. Earlier text remains in repository history. A withdrawal for insufficient records does not establish that the former claims are false.\n\nOur [source-review register](/source-reviews) links ten targeted reviews, including retained withdrawal notices. A partial review is not a full fact-check. We aim to retain article URLs and visible correction history where practicable; removal or consolidation should explain the change or provide a relevant redirect."
  },
  "contact": {
    "title": "Contact the publisher",
    "description": "Public corrections and publisher contact options.",
    "body": "Cody Viveiros is the publisher of The Northstar Ledger. Use the [public GitHub issue form](https://github.com/cojovi/northstar_news/issues/new) for corrections, broken links and other specific site issues. Include the article URL and public evidence so the concern can be assessed.\n\nThe publisher’s website, [cojovi.com](https://cojovi.com/), offers an additional contact option. No response or response time is guaranteed.\n\nGitHub issues are publicly visible. Do not submit confidential information or sensitive personal material. These are not secure tip services and confidentiality is not promised. External services have their own privacy practices.\n\nRead the [corrections policy](/corrections) for the meaning of review and withdrawal notices. Follow new published entries through [RSS](/rss.xml) or [Atom](/atom.xml) without providing an email address."
  },
  "ai-media-policy": {
    "title": "AI and media policy",
    "description": "Automation, desk responsibility and media provenance.",
    "body": "AI and other automation assist research, drafting and publishing. Generated language can contain errors and misleading attribution. The Northstar Ledger Desk is the organizational credit for automated publication; Cody Viveiros is the publisher. These roles do not establish human review of an article.\n\nHistorical bylines remain visible without invented biographies or qualifications. A title or professional prefix is not proof of a credential. Pending and partial evidence notices describe the available source record, rather than certify the prose.\n\nImages may be illustrations or generated media. Image credits are displayed with provenance limits; an old credit alone does not verify origin, license or the depicted event. Illustrations must not be treated as documentary evidence.\n\nMedia records should identify the creator or tool, source, permission or license, relevant edits and whether an image is illustrative or documentary. Alt text should describe established visual information without inventing a scene. The archive’s image provenance has not been comprehensively verified. Report a specific concern through [contact](/contact)."
  },
  "privacy": {
    "title": "Privacy information",
    "description": "Browser preferences, analytics and external services.",
    "body": "Reading this site requires no account. The theme control stores a light or dark preference in your browser’s local storage. You can clear it through your browser’s site-data settings.\n\nGoogle Analytics measures visits and can receive page and device information under its own practices. Hosting and external image providers receive normal request information such as IP addresses and browser details. Their precise retention periods have not been established here, so we cannot promise anonymity or a specific retention period.\n\nThe public interface offers RSS and Atom rather than an email signup. An existing subscription integration can store email addresses if a signup interface is enabled; email delivery has not been established.\n\nExternal source links, social sharing, GitHub issues and the publisher website are governed by those services’ practices. GitHub issues are public. Do not submit confidential or sensitive information. No secure tip channel or guaranteed response is offered. Use [contact](/contact) for questions about information previously submitted."
  },
  "terms": {
    "title": "Terms of use",
    "description": "Archive use, attribution and evidence limits.",
    "body": "The Northstar Ledger provides articles for information and discussion. Older entries may contain unsupported or outdated claims. Read the source dates, evidence limits, affiliation disclosures and correction history before relying on a claim.\n\nArticles are not individualized legal, medical, financial or other professional advice. A byline does not establish professional qualifications. An accompanying illustration is not proof of an event.\n\nWhen quoting or linking, identify the article and its date and retain relevant uncertainty and conflict disclosures. Third-party text and images remain subject to their owners’ rights; a historical image credit does not establish a verified license.\n\nExternal links can change. Shared-owner publications do not independently corroborate each other. Report errors or rights concerns through [contact](/contact), using public information and avoiding confidential material. See [corrections](/corrections) for the retention commitment."
  }
};
PAGES["source-reviews"] = {
 title: "Source-review register — October 28, 2026",
 description: "Ten historical source-review records, with dated changes, current restoration scope, sources and limits.",
 body: "These historical documentary checks are not full fact-checks of every claim or social recording. Some original copies have been restored at the publisher's request without a new fact-check; their current pending status and dated history are explicit. Review dates describe the earlier check, not authentication of a restored body. Original publication dates remain on the articles.\n\n" + sourceReviews.map(r => `[${r.title}](${r.path}) — [review](#${r.slug})`).join("\n\n"),
 reviews: sourceReviews.map(review => ({...review, kind: "documentary-source-review"})),
};
PAGES["archive-integrity"] = {
 title: "Archive integrity and publication history",
 description: "Exact template-provenance withdrawals and dated publisher-requested restorations; not a complete factual certification.",
 body: `## Scope and method\n\n${archiveIntegrity.method}\n\nThe October 28 audit identified 69 exact template-provenance records. Those withdrawals and the separate CMAC award withdrawal remain in effect. Five other articles that received automatic classification or publication holds have since been restored to published, indexable discovery at the publisher's explicit request. Their original titles and complete copies are restored, including their own qualifying language. Restoration is not independent factual authentication.\n\nAll historical article URLs and publication dates remain. Earlier text and dated actions are preserved in Git and the records below. The [source-review register](/source-reviews) distinguishes historical checks from the current restored copies; no complete archive fact-check is claimed.\n\nOriginal source revision: ${archiveIntegrity.revision}. [Original generator source](${archiveIntegrity.generator_source}); original revision generator SHA-256: ${archiveIntegrity.original_generator_sha256}. Comparison-script SHA-256: ${archiveIntegrity.comparison_generator_sha256}.\n\n## Exact template provenance withdrawals\n\nThese records describe development/mock-template presentation, not proof that every headline is false.\n\n` + archiveIntegrity.records.map(r =>
  `[${r.title}](${r.path}) — **Withdrawn**. Original publication: ${r.published}. Action: ${r.action_date}. [Original source](${r.original_source}). Original body SHA-256: ${r.original_body_sha256}.`
 ).join("\n\n") + "\n\n## Publisher-requested restorations\n\nThe earlier automatic treatments are superseded for these articles. They are published and eligible for ordinary discovery; no independent verification is added.\n\n" + archiveIntegrity.classifications.map(r =>
  `[${r.title}](${r.path}) — **Published; original copy restored**. Restored: ${r.restored_at}. Original publication: ${r.published}. ${r.basis} ${r.needs} [Original source](${r.original_source}). Original body SHA-256: ${r.original_body_sha256}.`
 ).join("\n\n") + "\n\nTemplate withdrawals remain excluded from promotional discovery. The restored articles are no longer on publication hold or excluded by automatic fiction classification. Empty sections and uncurated taxonomy may remain noindex under the ordinary discovery policy. Read [corrections](/corrections) and [ownership](/ownership).",
};
PAGES.corrections.body += "\n\nThe [archive integrity and publication history](/archive-integrity) lists exact development/mock-template withdrawals and the publisher-requested restoration of five other articles. Earlier automatic classifications and holds for those restored articles are superseded. These records are not external fact-check certifications.";
export const TOPICS = {
  "public-spending": {
    title: "Public spending and accountability",
    description:
      "Follow public money, oversight and the records behind accountability claims.",
    intro:
      "Read these archived stories as starting points for questions about spending, oversight and evidence. Compare allegations with dated agency records, contracts and audit findings; a viral claim or a second shared-owner article is not independent confirmation.",
    slugs: [
      "social-security-record-cleanup-benefits-evidence",
      "minnesotas-fraud-iceberg-how-nick-shirleys-viral-investigation-lit-a-fire-under-the-system",
      "israel-churches-geofenced-fara-7653",
    ],
    questions: [
      "What does the underlying agency or contract record actually say?",
      "Which amounts are expenditures, allegations or estimates?",
      "What information remains unavailable or contested?",
    ],
  },
  "policy-costs": {
    title: "Household and small-business policy costs",
    description:
      "Trace policy changes to household bills and small-business decisions.",
    intro:
      "These archived entries connect inflation, tax rules and trade policy. They are not original price surveys or financial advice. Check effective dates and distinguish a proposal from an enacted rule before applying an article to a current bill or business decision.",
    slugs: [
      "september-cpi-gasoline-core-inflation-household-costs",
      "texas-rings-in-2026-with-new-laws-on-ai-evictions-immigration-enforcement-and-business-taxes",
      "us-pushes-new-china-chip-tariffs-to-2027-sending-a-very-loud-signal-to-the-semiconductor-supply-chain",
    ],
    questions: [
      "When does the policy take effect, and who is covered?",
      "What assumptions connect the policy to a stated cost?",
      "Is a quoted price representative or just one example?",
    ],
  },
  "institutional-decisions": {
    title: "Institutional and platform decisions",
    description:
      "Examine how organizations and platforms set rules affecting their users.",
    intro:
      "Connect the archive’s coverage of platform access, policies and institutional choices. These entries do not establish independent product tests. Compare dated policy text and public statements with the article’s interpretation, and note where access or implementation cannot be confirmed.",
    slugs: [
      "anthropic-claude-abuse-policy-customer-access",
      "what-happens-after-you-swipe-right-on-tinder",
      "truth-api-early-access-controversy",
    ],
    questions: [
      "What did the organization announce, and what was observed?",
      "Who gains or loses access under the decision?",
      "Does the source record support the interpretation?",
    ],
  },
};
