import type { Article } from "../types/article";
export function escapeXml(value: unknown): string;
export function sitemap(entries: { url: string; updated?: string }[]): string;
export function rssFeed(articles: Article[]): string;
export function atomFeed(articles: Article[]): string;
