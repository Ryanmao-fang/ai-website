import { Fragment, type ReactNode } from "react";

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 在纯文本中高亮关键词（用于搜索结果摘要）
 */
export function highlightTextParts(text: string, query: string): ReactNode {
  const q = query.trim();
  if (!q) {
    return text;
  }
  const re = new RegExp(`(${escapeRegExp(q)})`, "gi");
  const parts = text.split(re);
  return parts.map((part, i) => {
    if (part.toLowerCase() === q.toLowerCase()) {
      return (
        <mark key={i} className="rounded-sm bg-amber-200/90 text-foreground px-0.5">
          {part}
        </mark>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}
