import { createHash } from 'node:crypto';

// Copy-integrity policy requested by the publisher; this is not fact verification.
export function assertEditorialLocks(articles, policy) {
  if (policy?.version !== 1 || !Array.isArray(policy.entries) || !policy.entries.length)
    throw new Error('Editorial copy lock: missing or invalid publisher policy');
  const byId = new Map(articles.map(a => [`${a.categoryPath}/${a.slug}`, a]));
  const seen = new Set();
  for (const lock of policy.entries) {
    if (!/^[a-z0-9_-]+\/[a-z0-9_-]+$/.test(lock.id || '') || seen.has(lock.id))
      throw new Error('Editorial copy lock: invalid or duplicate identifier');
    seen.add(lock.id);
    const a = byId.get(lock.id);
    if (!a) throw new Error(`Editorial copy lock: missing protected article ${lock.id}`);
    for (const field of ['title', 'dek', 'author', 'author_slug', 'published', 'tags']) {
      if (JSON.stringify(a[field]) !== JSON.stringify(lock.fields[field]))
        throw new Error(`Editorial copy lock: unapproved ${field} change in ${lock.id}`);
    }
    if (a.status !== 'published' || !a.indexable || a.is_satire || a.editorial_notices !== false)
      throw new Error(`Editorial copy lock: publication/presentation change in ${lock.id}`);
    const hash = createHash('sha256').update(a.content).digest('hex');
    if (hash !== lock.body_sha256)
      throw new Error(`Editorial copy lock: unapproved body change in ${lock.id}`);
  }
}
