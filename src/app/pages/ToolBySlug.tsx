import { Navigate, useParams } from "react-router";
import { getToolBySlug } from "@/content/toolsCatalog";

/**
 * 兼容文档中的 /tool/[slug]，重定向到 /tools/:id
 */
export function ToolBySlug() {
  const { slug } = useParams();
  const tool = getToolBySlug(slug);
  if (!tool) {
    return <Navigate to="/not-found" replace />;
  }
  return <Navigate to={`/tools/${tool.slug}`} replace />;
}
