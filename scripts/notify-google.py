#!/usr/bin/env python3
"""
Submit verified Northstar Ledger sitemaps to Google Search Console.
The Google Indexing API does not support ordinary news articles.
"""

import os
import sys
import argparse
import glob
from pathlib import Path

# Common key search paths
DEFAULT_KEY_PATHS = [
    os.environ.get("GOOGLE_INDEXING_KEY", ""),
    "/Users/cojovi/.hermes/profiles/loki/cmac-projects-05845f52986a.json",
    str(Path.home() / ".hermes/profiles/loki/cmac-projects-05845f52986a.json"),
    str(Path.home() / ".config/google/service_account.json"),
]

def find_key_file():
    for p in DEFAULT_KEY_PATHS:
        if p and os.path.exists(p):
            return p
    return None

def get_latest_articles(content_dir, limit=1):
    import re
    articles = []
    for md_path in Path(content_dir).rglob("*.md"):
        try:
            text = md_path.read_text(encoding="utf-8")
            if not text.startswith("---"):
                continue
            parts = text.split("---", 2)
            if len(parts) < 3:
                continue
            fm = parts[1]
            status_m = re.search(r"^status:\s*([^\s]+)", fm, re.M)
            if not status_m or status_m.group(1) != "published":
                continue
            pub_m = re.search(r"^published:\s*([^\s]+)", fm, re.M)
            slug_m = re.search(r"^slug:\s*([^\s]+)", fm, re.M)
            cat_m = re.search(r"^category:\s*([^\s]+)", fm, re.M)
            
            pub_date = pub_m.group(1).strip("'\"") if pub_m else ""
            slug = slug_m.group(1).strip("'\"") if slug_m else md_path.stem
            cat = cat_m.group(1).strip("'\"") if cat_m else md_path.parent.name
            
            url = f"https://thenorthstarledger.com/{cat}/{slug}"
            articles.append((pub_date, url))
        except Exception:
            continue
            
    articles.sort(key=lambda x: x[0], reverse=True)
    return [url for _, url in articles[:limit]]

def notify_google(urls, key_path):
    """Submit verified discovery manifests, not unsupported article indexing requests."""
    from urllib.parse import quote, urlparse
    import xml.etree.ElementTree as ET
    from google.oauth2 import service_account
    from google.auth.transport.requests import AuthorizedSession
    import requests

    origin = "https://thenorthstarledger.com"
    manifests = [origin + "/" + name for name in ("sitemap.xml", "post-sitemap.xml", "rss.xml")]
    # Fail closed: do not notify Google before the article and manifest are live.
    response = requests.get(manifests[1], timeout=30)
    response.raise_for_status()
    sitemap_urls = {node.text for node in ET.fromstring(response.content).iter()
                    if node.tag.endswith("}loc")}
    for url in urls:
        parsed = urlparse(url)
        if parsed.scheme != "https" or parsed.netloc != "thenorthstarledger.com" or url not in sitemap_urls:
            raise ValueError(f"Not a canonical published sitemap URL: {url}")
        page = requests.get(url, timeout=30)
        page.raise_for_status()
        if '<h1' not in page.text or '<article' not in page.text or '<div id="root"></div>' in page.text:
            raise ValueError(f"Article is not prerendered on production: {url}")
        if f'<link rel="canonical" href="{url}"' not in page.text:
            raise ValueError(f"Production canonical does not match: {url}")
    for manifest in manifests:
        response = requests.get(manifest, timeout=30)
        response.raise_for_status()
        ET.fromstring(response.content)

    credentials = service_account.Credentials.from_service_account_file(
        key_path, scopes=["https://www.googleapis.com/auth/webmasters"])
    session = AuthorizedSession(credentials)
    endpoint = ("https://www.googleapis.com/webmasters/v3/sites/"
                + quote("sc-domain:thenorthstarledger.com", safe="") + "/sitemaps")
    results = []
    for manifest in manifests:
        target = endpoint + "/" + quote(manifest, safe="")
        response = session.put(target, timeout=30)
        response.raise_for_status()
        check = session.get(target, timeout=30)
        check.raise_for_status()
        entry = check.json()
        if entry.get("path") != manifest or not entry.get("lastSubmitted"):
            raise RuntimeError(f"Sitemap submission not confirmed: {manifest}")
        print(f"Search Console sitemap submission verified: {manifest} ({entry['lastSubmitted']})")
        results.append((manifest, True, entry))
    print("Discovery manifests submitted. This does NOT request individual URL indexing or prove crawling/indexing.")
    return results

def main():
    parser = argparse.ArgumentParser(description="Verify live articles and resubmit discovery manifests to Search Console")
    parser.add_argument("urls", nargs="*", help="Specific published URL(s) to verify before sitemap submission")
    parser.add_argument("--recent", type=int, default=0, help="Verify top N recent articles before sitemap submission")
    parser.add_argument("--key", default="", help="Path to Google Service Account JSON key")
    args = parser.parse_args()

    key_path = args.key or find_key_file()
    if not key_path:
        print("❌ Error: Google Service Account key file not found.", file=sys.stderr)
        print("Set GOOGLE_INDEXING_KEY env var or place key in ~/.hermes/profiles/loki/", file=sys.stderr)
        sys.exit(1)

    repo_root = Path(__file__).resolve().parent.parent
    content_dir = repo_root / "content"

    target_urls = []
    if args.urls:
        target_urls = args.urls
    elif args.recent > 0:
        target_urls = get_latest_articles(content_dir, limit=args.recent)
    else:
        # Default to latest 1 article
        target_urls = get_latest_articles(content_dir, limit=1)

    if not target_urls:
        print("⚠️ No target URLs found to index.")
        sys.exit(0)

    results = notify_google(target_urls, key_path)
    all_ok = all(r[1] for r in results)
    sys.exit(0 if all_ok else 1)

if __name__ == "__main__":
    main()
