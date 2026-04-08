import { termsCatalog } from "@/content/termsCatalog";
import { toolsCatalog } from "@/content/toolsCatalog";
import { templatesCatalog } from "@/content/templatesCatalog";

export type SearchResultTerm = {
  kind: "term";
  id: number;
  name: string;
  description: string;
  category: string;
};

export type SearchResultTool = {
  kind: "tool";
  id: number;
  name: string;
  description: string;
  category: string;
  icon: string;
};

export type SearchResultTemplate = {
  kind: "template";
  id: number;
  title: string;
  scenario: string;
  category: string;
};

export type SearchResults = {
  terms: SearchResultTerm[];
  tools: SearchResultTool[];
  templates: SearchResultTemplate[];
};

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

export function searchAllContent(rawQuery: string): SearchResults {
  const q = normalize(rawQuery);
  if (!q) {
    return { terms: [], tools: [], templates: [] };
  }

  const terms = termsCatalog
    .filter((t) => {
      const hay = normalize(
        `${t.slug} ${t.name} ${t.description} ${t.category} ${t.aliases.join(" ")}`
      );
      return hay.includes(q);
    })
    .map((t) => ({
      kind: "term" as const,
      id: t.id,
      name: t.name,
      description: t.description,
      category: t.category,
    }));

  const tools = toolsCatalog
    .filter((t) => {
      const hay = normalize(
        `${t.slug} ${t.name} ${t.description} ${t.category} ${t.tags.join(" ")}`
      );
      return hay.includes(q);
    })
    .map((t) => ({
      kind: "tool" as const,
      id: t.id,
      name: t.name,
      description: t.description,
      category: t.category,
      icon: t.icon,
    }));

  const templates = templatesCatalog
    .filter((t) => {
      const hay = normalize(`${t.title} ${t.scenario} ${t.category} ${t.tags.join(" ")}`);
      return hay.includes(q);
    })
    .map((t) => ({
      kind: "template" as const,
      id: t.id,
      title: t.title,
      scenario: t.scenario,
      category: t.category,
    }));

  return { terms, tools, templates };
}
