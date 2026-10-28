import { generateArticleContent } from '../generate-mock-content.js';

const normalize = body => body.trim().replace(/\s+/g, ' ');
const categories = ['us', 'world', 'politics', 'business', 'tech', 'health', 'entertainment', 'sports', 'opinion', 'lifestyle', 'travel'];
const exactBodies = new Set(categories.flatMap(category => [4, 5, 6].map(count =>
  normalize(generateArticleContent({}, category, count)))));
// This is a literal paragraph from the preserved development generator, not
// a ban on words such as "experts", "interview", "mock" or "screening".
const unsupportedInterview = normalize(generateArticleContent({}, 'us', 6).split('\n\n')[1]);
export function assertNoMockTemplate(body, status) {
  if (status === 'withdrawn') return;
  const normalized = normalize(body);
  if (exactBodies.has(normalized) || normalized.includes(unsupportedInterview))
    throw new Error('Publication blocked: literal development mock template body or unsupported mock interview paragraph.');
}
