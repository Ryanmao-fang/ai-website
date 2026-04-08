import { useEffect } from "react";
import { useLocation } from "react-router";
import { siteConfig } from "@/lib/siteConfig";
import { trackPageView } from "@/lib/analytics";

type PageMetaProps = {
  title: string;
  description?: string;
};

export function PageMeta({ title, description }: PageMetaProps) {
  const location = useLocation();
  useEffect(() => {
    const full = `${title} · ${siteConfig.brandName}`;
    document.title = full;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute(
      "content",
      description || `${siteConfig.brandName}：AI 名词、工具与学习路线。`
    );
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute("content", full);
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement("meta");
      ogDesc.setAttribute("property", "og:description");
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute(
      "content",
      description || `${siteConfig.brandName}，温暖可信赖的 AI 通识学习入口。`
    );
    trackPageView(location.pathname + location.search, full);
  }, [title, description, location.pathname, location.search]);
  return null;
}
