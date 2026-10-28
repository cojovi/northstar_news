import type { ReactElement } from "react";
import type { Route } from "../lib/routes";
import type { Article } from "../types/article";
export function RoutePage(props: {
  route: Route;
  articles: Article[];
}): ReactElement;
export function PublicLinks(): ReactElement;
