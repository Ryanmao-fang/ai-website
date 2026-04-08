export type LearningPathLevelId = "beginner" | "intermediate" | "advanced";

export type LearningPathItemRef = {
  type: "term" | "tool" | "template";
  id: number;
};

export type LearningPathSection = {
  id: LearningPathLevelId;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  items: LearningPathItemRef[];
};

export const learningPathSections: LearningPathSection[] = [
  {
    id: "beginner",
    title: "入门篇",
    subtitle: "从零开始，轻松入门AI",
    icon: "🌱",
    color: "from-emerald-500 to-teal-500",
    items: [
      { type: "term", id: 4 },
      { type: "term", id: 1 },
      { type: "tool", id: 1 },
      { type: "term", id: 3 },
      { type: "template", id: 1 },
      { type: "tool", id: 3 },
    ],
  },
  {
    id: "intermediate",
    title: "进阶篇",
    subtitle: "深入理解，灵活应用",
    icon: "🌿",
    color: "from-teal-500 to-cyan-500",
    items: [
      { type: "term", id: 5 },
      { type: "term", id: 3 },
      { type: "tool", id: 2 },
      { type: "template", id: 2 },
      { type: "term", id: 11 },
      { type: "tool", id: 4 },
    ],
  },
  {
    id: "advanced",
    title: "高阶篇",
    subtitle: "融会贯通，自由创造",
    icon: "🌳",
    color: "from-green-500 to-emerald-600",
    items: [
      { type: "term", id: 9 },
      { type: "term", id: 11 },
      { type: "tool", id: 6 },
      { type: "template", id: 12 },
      { type: "term", id: 7 },
      { type: "tool", id: 5 },
    ],
  },
];

export function getLearningPathSection(level: LearningPathLevelId): LearningPathSection | null {
  return learningPathSections.find((s) => s.id === level) || null;
}

export function homeLearningPathPreviewCounts(): { level: string; items: number; icon: string; color: string }[] {
  return learningPathSections.map((s) => ({
    level: s.title.replace("篇", ""),
    items: s.items.length,
    icon: s.icon,
    color:
      s.id === "beginner"
        ? "bg-emerald-100 text-emerald-700"
        : s.id === "intermediate"
          ? "bg-teal-100 text-teal-700"
          : "bg-green-100 text-green-700",
  }));
}
