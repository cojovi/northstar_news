import fs from "node:fs";
import { loadArticles } from "./lib/load-articles.js";
const articles = loadArticles();
fs.writeFileSync(
  "src/data/articles.json",
  JSON.stringify(articles, null, 2) + "\n",
);
console.log(
  `Validated and generated browser snapshot for ${articles.length} retained article routes (including withdrawal notices).`,
);
