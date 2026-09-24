export const SITE_URL = 'https://thenorthstarledger.com';
export const DEFAULT_IMAGE = `${SITE_URL}/og/default.jpg`;

// Use the public asset URL for this repository's GitHub-hosted images, while
// preserving images hosted elsewhere and resolving local paths to absolute URLs.
export function resolveSocialImage(image) {
  if (typeof image !== 'string' || !image.trim()) return DEFAULT_IMAGE;

  try {
    const url = new URL(image.trim(), `${SITE_URL}/`);
    if (!['https:', 'http:'].includes(url.protocol)) return DEFAULT_IMAGE;

    const githubPath = url.hostname === 'github.com'
      ? /^\/cojovi\/northstar_news\/(?:blob|raw)\/main\/public\/(.+)$/.exec(url.pathname)
      : url.hostname === 'raw.githubusercontent.com'
        ? /^\/cojovi\/northstar_news\/main\/public\/(.+)$/.exec(url.pathname)
        : null;

    return githubPath ? `${SITE_URL}/${githubPath[1]}` : url.href;
  } catch {
    return DEFAULT_IMAGE;
  }
}
