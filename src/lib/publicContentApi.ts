import { apiBaseUrl } from "@/lib/api";

async function getJson(path: string) {
  const resp = await fetch(`${apiBaseUrl}${path}`, { method: "GET" });
  const payload = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const msg = (payload as { error?: string })?.error || `请求失败（${resp.status}）`;
    throw new Error(msg);
  }
  return payload;
}

export type CmsTermPublic = {
  slug: string;
  name: string;
  description: string;
  category: string;
  reading_minutes: number;
  cover_image_url: string;
  updated_at: string;
  content_version: string;
};

export type CmsToolPublic = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tags: string[];
  rating: number;
  link: string;
  platform: string;
  open_source: boolean;
  price_tier: string;
  suitable_for: string;
  updated_at: string;
  content_version: string;
};

export type CmsTemplatePublic = {
  id: number;
  title: string;
  scenario: string;
  category: string;
  tags: string[];
  min_tier: string;
  content_markdown?: string;
  content_json?: any;
  updated_at: string;
  content_version: string;
};

export const publicContentApi = {
  listTerms: async (): Promise<CmsTermPublic[]> => {
    const payload = await getJson("/api/public/terms");
    return ((payload as any)?.items || []) as CmsTermPublic[];
  },
  getTerm: async (slug: string): Promise<any | null> => {
    try {
      const payload = await getJson(`/api/public/terms/${encodeURIComponent(slug)}`);
      return (payload as any)?.item || null;
    } catch {
      return null;
    }
  },
  listTools: async (): Promise<CmsToolPublic[]> => {
    const payload = await getJson("/api/public/tools");
    return ((payload as any)?.items || []) as CmsToolPublic[];
  },
  getTool: async (slug: string): Promise<any | null> => {
    try {
      const payload = await getJson(`/api/public/tools/${encodeURIComponent(slug)}`);
      return (payload as any)?.item || null;
    } catch {
      return null;
    }
  },
  listTemplates: async (): Promise<CmsTemplatePublic[]> => {
    const payload = await getJson("/api/public/templates");
    return ((payload as any)?.items || []) as CmsTemplatePublic[];
  },
  listLearningPaths: async (): Promise<any[]> => {
    const payload = await getJson("/api/public/learning-paths");
    return ((payload as any)?.items || []) as any[];
  },

  search: async (q: string, limit?: number): Promise<{
    terms: any[];
    tools: any[];
    templates: any[];
    learningPaths: any[];
  }> => {
    const qs = new URLSearchParams({ q: q.trim() });
    if (limit != null) {
      qs.set("limit", String(limit));
    }
    const payload = await getJson(`/api/public/search?${qs.toString()}`);
    return {
      terms: ((payload as any)?.terms || []) as any[],
      tools: ((payload as any)?.tools || []) as any[],
      templates: ((payload as any)?.templates || []) as any[],
      learningPaths: ((payload as any)?.learningPaths || []) as any[],
    };
  },
};

