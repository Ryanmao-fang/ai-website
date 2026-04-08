import { Navigate, useParams } from "react-router";
import { getTermBySlug } from "@/content/termsCatalog";

/**
 * 兼容文档中的 /term/[slug]，重定向到站内主路径 /terms/:id
 */
export function TermBySlug() {
  const { slug } = useParams();
  const term = getTermBySlug(slug);
  if (!term) {
    return <Navigate to="/not-found" replace />;
  }
  return <Navigate to={`/terms/${term.slug}`} replace />;
}
