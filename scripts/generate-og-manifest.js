import fs from "node:fs";
import { loadArticles } from "./lib/load-articles.js";
import { canonicalUrl } from "../src/lib/authority.js";
const manifest = Object.fromEntries(
  loadArticles().map((a) => [
    `${a.categoryPath}/${a.slug}`,
    {
      title: a.title,
      dek: a.dek,
      hero_image: a.hero_image,
      thumbnail: a.thumbnail,
      url: canonicalUrl(a),
    },
  ]),
);
fs.writeFileSync(
  "public/og-manifest.json",
  JSON.stringify(manifest, null, 2) + "\n",
);
// Route metadata is owned by prerender and the client metadata helper. The
// public manifest is data only; an async inline writer could restore stale tags.
console.log(
  `Generated canonical OG manifest for ${Object.keys(manifest).length} retained article routes.`,
);
