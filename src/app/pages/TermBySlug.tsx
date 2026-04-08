import { Navigate, useParams } from "react-router";

/**
 * 兼容文档中的 /term/[slug]，重定向到站内主路径 /terms/:id
 */
export function TermBySlug() {
  const { slug } = useParams();
  if (!slug) {
    return <Navigate to="/not-found" replace />;
  }
  return <Navigate to={`/terms/${slug}`} replace />;
}
