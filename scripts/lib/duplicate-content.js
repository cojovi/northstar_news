// Compare body text, not titles or source labels. A match is a review gate,
// never a finding of plagiarism or proof that either account is correct.
export function shingles(body, size = 5) {
  const words = body
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
  return new Set(
    words.length < size
      ? [words.join(" ")]
      : words
          .slice(0, words.length - size + 1)
          .map((_, i) => words.slice(i, i + size).join(" ")),
  );
}
export function bodySimilarity(a, b) {
  const left = shingles(a),
    right = shingles(b);
  if (!a.trim() || !b.trim()) return 0;
  const intersection = [...left].filter((s) => right.has(s)).length;
  return intersection / (left.size + right.size - intersection);
}
export function duplicateMatches(candidate, records, threshold = 0.8) {
  return records
    .map((record) => ({
      url: record.url,
      score: bodySimilarity(candidate, record.content),
    }))
    .filter((r) => r.score >= threshold)
    .sort((a, b) => b.score - a.score);
}
