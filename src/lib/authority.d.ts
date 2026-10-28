import type { Article, AuthorProfile } from "../types/article";
export const registry: Record<string, AuthorProfile>;
export const CONTENT_TYPES: string[];
export function tagPath(tag: string): string;
export function validateTag(tag: unknown): string;
export function safeUrl(value: unknown): string | null;
export function articlePath(
  article: Pick<Article, "categoryPath" | "category" | "slug">,
): string;
export function canonicalUrl(article: Article): string;
export function isDiscoverable(article: Partial<Article>): boolean;
export function normalizeArticle(
  data: Record<string, unknown>,
  body: string,
  category: string,
  review?: Record<string, unknown>,
): Article;
export function articleSchema(article: Article): Record<string, unknown>;
export function linkLiteralUrls(): (tree: unknown) => void;
