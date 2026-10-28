import type { Article, AuthorProfile } from "../types/article";
export interface Route {
  path?: string;
  indexable?: boolean;
  articleCount?: number;
  type:
    | "home"
    | "search"
    | "article"
    | "category"
    | "page"
    | "author"
    | "tag"
    | "topics"
    | "topic"
    | "notFound";
  title: string;
  description: string;
  category?: string;
  slug?: string;
  tag?: string;
  body?: string;
  profile?: AuthorProfile;
  intro?: string;
  slugs?: string[];
  questions?: string[];
  reviews?: {slug: string; path: string; title: string; reviewed_at: string; summary: string; limits: string; action: string; sources: string[]}[];
}
export const CATEGORIES: string[];
export function routeInventory(articles: Article[]): Record<string, Route>;
export function parseRoute(
  path: string,
  inventory: Record<string, Route>,
): Route;
export function shouldHandleLink(
  event: MouseEvent,
  link: {
    origin: string;
    pathname: string;
    hash: string;
    target: string;
    download: boolean;
  },
  origin: string,
  inventory: Record<string, Route>,
): boolean;
export function routeArticles(route: Route, articles: Article[]): Article[];

export function isRouteIndexable(route: Route): boolean;
export function routeRobots(route: Route): string;
