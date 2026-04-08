import { Navigate, useParams } from "react-router";

/**
 * 兼容文档中的 /tool/[slug]，重定向到 /tools/:id
 */
export function ToolBySlug() {
  const { slug } = useParams();
  if (!slug) {
    return <Navigate to="/not-found" replace />;
  }
  return <Navigate to={`/tools/${slug}`} replace />;
}
