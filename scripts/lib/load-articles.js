import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import yaml from "js-yaml";
import { SITE_URL, resolveSocialImage } from "../../src/lib/socialImage.js";
import { normalizeArticle } from "../../src/lib/authority.js";
import { assertNoMockTemplate } from "./mock-template-gate.js";
import { assertPublicationReady } from "./publication-gate.js";
import { assertEditorialLocks } from "./editorial-locks.js";
// JSON_SCHEMA handles block/inline YAML equally and keeps timestamp precision.
export function parseArticleSource(source) {
  return matter(source, {
    engines: {
      yaml: (value) => yaml.load(value, { schema: yaml.JSON_SCHEMA }),
    },
  });
}
export function loadArticles(root = process.cwd()) {
  const contentDir = path.join(root, "content");
  const articles = [];
  for (const file of fs.readdirSync(contentDir, { recursive: true }).sort()) {
    if (
      !file.endsWith(".md") ||
      file.split(path.sep).length !== 2 ||
      file.startsWith("reviews/")
    )
      continue;
    const { data, content } = parseArticleSource(
      fs.readFileSync(path.join(contentDir, file), "utf8"),
    );
    if (!["published", "withdrawn", "review-hold"].includes(data.status)) continue;
    assertNoMockTemplate(content, data.status);
    const category = file.split(path.sep)[0];
    const reviewPath = path.join(
      contentDir,
      "reviews",
      category,
      `${data.slug}.json`,
    );
    const review = fs.existsSync(reviewPath)
      ? JSON.parse(fs.readFileSync(reviewPath, "utf8"))
      : {};
    if (!review || typeof review !== "object" || Array.isArray(review))
      throw new Error(`Invalid review sidecar: ${reviewPath}`);
    assertPublicationReady({
      id: category + "/" + data.slug,
      data,
      body: content,
      review,
    });
    const image = new URL(resolveSocialImage(data.hero_image));
    if (image.origin === SITE_URL) {
      const imagePath = path.join(
        root,
        "public",
        decodeURIComponent(image.pathname),
      );
      if (fs.existsSync(imagePath)) {
        const bytes = fs.readFileSync(imagePath);
        if (
          bytes.length > 24 &&
          bytes
            .subarray(0, 8)
            .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        ) {
          data.hero_width = bytes.readUInt32BE(16);
          data.hero_height = bytes.readUInt32BE(20);
        }
      }
    }
    articles.push(normalizeArticle(data, content, category, review));
  }
  const routes = articles.map((a) => `${a.categoryPath}/${a.slug}`);
  if (new Set(routes).size !== routes.length)
    throw new Error("Duplicate published article route");
  const lockFile = path.join(root, "content", "editorial-locks.json");
  const ownRoot = fileURLToPath(new URL("../../", import.meta.url));
  if (path.resolve(root) === path.resolve(ownRoot) || fs.existsSync(lockFile)) {
    let policy;
    try { policy = JSON.parse(fs.readFileSync(lockFile, "utf8")); }
    catch { throw new Error("Editorial copy lock: missing or unreadable publisher policy"); }
    assertEditorialLocks(articles, policy);
  }
  return articles.sort(
    (a, b) => Date.parse(b.published) - Date.parse(a.published),
  );
}
