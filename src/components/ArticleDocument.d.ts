import type { ReactElement } from "react";
import type { Article } from "../types/article";
export function ArticleDocument(props: {
  article: Article;
  related?: Article[];
}): ReactElement;
export function MarkdownBody(props: { content: string }): ReactElement;
