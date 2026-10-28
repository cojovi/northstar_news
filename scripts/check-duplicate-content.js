import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { loadArticles } from "./lib/load-articles.js";
import { duplicateMatches } from "./lib/duplicate-content.js";
import { canonicalUrl } from "../src/lib/authority.js";
const args = process.argv.slice(2);
const flagValue = (name) =>
  args.includes(name) ? args[args.indexOf(name) + 1] : null;
const candidatePath = flagValue("--candidate");
if (!candidatePath) {
  console.error(
    "Usage: node scripts/check-duplicate-content.js --candidate content/category/draft.md [--comparison-json docs/editorial/sister-export.json] [--comparison-source path/to/sister.md]",
  );
  process.exit(2);
}
const candidate = matter(fs.readFileSync(candidatePath, "utf8")).content;
let records = loadArticles()
  .filter(
    (a) =>
      path.resolve(`content/${a.categoryPath}/${a.slug}.md`) !==
      path.resolve(candidatePath),
  )
  .map((a) => ({ url: canonicalUrl(a), content: a.content }));
const comparison = flagValue("--comparison-json");
if (comparison) {
  const additional = JSON.parse(fs.readFileSync(comparison, "utf8"));
  if (
    !Array.isArray(additional) ||
    additional.some(
      (r) => typeof r.url !== "string" || typeof r.content !== "string",
    )
  )
    throw new Error(
      "Comparison export requires an array of {url,content} records",
    );
  records = records.concat(additional);
}
const comparisonSource = flagValue("--comparison-source");
if (comparisonSource) {
  records.push({url: comparisonSource, content: matter(fs.readFileSync(comparisonSource, "utf8")).content});
}
const matches = duplicateMatches(candidate, records);
console.log(
  JSON.stringify(
    {
      candidate: candidatePath,
      comparisonScope: comparisonSource ? `Northstar plus actual source file: ${comparisonSource}` : comparison
        ? "Northstar plus provided sister export"
        : "Northstar only — sister export required before shared-owner publication",
      threshold: 0.8,
      matches,
    },
    null,
    2,
  ),
);
process.exitCode = matches.length ? 1 : 0;
