/**
 * 轻量观测：配置 VITE_GA_MEASUREMENT_ID 后在 index.html 侧可接 GA4；
 * 此处提供无侵入页面浏览打点钩子，避免硬编码具体厂商。
 */
type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

export function trackPageView(pathname: string, title?: string): void {
  const w = window as Window & { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[] };
  const id = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
  if (id && typeof w.gtag === "function") {
    w.gtag("event", "page_view", {
      page_path: pathname,
      page_title: title || document.title,
    });
  }
  if (import.meta.env.DEV) {
    return;
  }
  void pathname;
}

export function trackEvent(name: string, params?: AnalyticsPayload): void {
  const w = window as Window & { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag === "function") {
    w.gtag("event", name, params || {});
  }
}
