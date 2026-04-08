import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Search, Star, ExternalLink } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { motion } from "motion/react";
import { listToolsSummary, toolsCatalog } from "@/content/toolsCatalog";
import { publicContentApi } from "@/lib/publicContentApi";

export function ToolsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [platformFilter, setPlatformFilter] = useState("全部");
  const [priceTierFilter, setPriceTierFilter] = useState("全部");
  const [cmsList, setCmsList] = useState<
    | {
        id: string;
        slug: string;
        name: string;
        description: string;
        icon: string;
        category: string;
        tags: string[];
        rating: number;
        link: string;
        openSource?: boolean;
        priceTier?: "free" | "freemium" | "paid";
      }[]
    | null
  >(null);

  const categories = ["全部", "对话助手", "图像生成", "视频创作", "写作辅助", "编程开发", "办公效率"];
  const platforms = ["全部", "开源", "商业"];
  const priceTiers = ["全部", "以免费为主", "免费+增值", "多数付费"];

  const localList = listToolsSummary().map((t) => {
    const full = toolsCatalog.find((x) => x.id === t.id);
    return {
      id: String(t.id),
      slug: (full?.slug || t.slug) as string,
      name: t.name,
      description: t.description,
      icon: t.icon,
      category: t.category,
      tags: t.tags,
      rating: t.rating,
      link: t.link,
      openSource: Boolean(full?.openSource),
      priceTier: (full?.priceTier || "freemium") as "free" | "freemium" | "paid",
    };
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const items = await publicContentApi.listTools();
        if (cancelled) {
          return;
        }
        if (items && items.length > 0) {
          setCmsList(
            items.map((t) => ({
              id: t.slug,
              slug: t.slug,
              name: t.name,
              description: t.description,
              icon: t.icon,
              category: t.category,
              tags: t.tags || [],
              rating: Number(t.rating || 0),
              link: t.link,
              openSource: Boolean(t.open_source),
              priceTier: (t.price_tier || "freemium") as any,
            }))
          );
        } else {
          setCmsList(null);
        }
      } catch {
        setCmsList(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const mergedList = useMemo(() => {
    if (cmsList && cmsList.length > 0) {
      return cmsList;
    }
    return localList;
  }, [cmsList, localList]);

  const filteredTools = mergedList.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "全部" || tool.category === selectedCategory;
    const matchesPlatform =
      platformFilter === "全部" ||
      ("开源" === platformFilter && Boolean(tool.openSource)) ||
      ("商业" === platformFilter && !tool.openSource);
    const tier = tool.priceTier || "freemium";
    const tierLabel =
      "free" === tier ? "以免费为主" : "paid" === tier ? "多数付费" : "免费+增值";
    const matchesPrice = priceTierFilter === "全部" || tierLabel === priceTierFilter;
    return matchesSearch && matchesCategory && matchesPlatform && matchesPrice;
  });

  const compareHref = useMemo(() => {
    const ids = filteredTools.slice(0, 3).map((t: any) => t.id).join(",");
    return `/tools/compare?ids=${ids}`;
  }, [filteredTools]);

  return (
    <div className="min-h-screen py-12 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-semibold text-foreground mb-4">AI工具库</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            发现最好用的AI工具，让工作和创作更高效
          </p>
        </motion.div>

        <div className="mb-8 space-y-4">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="搜索AI工具..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 rounded-full border-border bg-white shadow-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full ${
                  selectedCategory === category
                    ? "bg-primary hover:bg-accent"
                    : "border-border hover:bg-muted"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 justify-center items-center">
            <span className="text-sm text-muted-foreground">授权类型</span>
            {platforms.map((p) => (
              <Button
                key={p}
                variant={platformFilter === p ? "default" : "outline"}
                onClick={() => setPlatformFilter(p)}
                className={`rounded-full text-sm ${
                  platformFilter === p ? "bg-primary hover:bg-accent" : "border-border hover:bg-muted"
                }`}
                size="sm"
              >
                {p}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 justify-center items-center">
            <span className="text-sm text-muted-foreground">付费模式</span>
            {priceTiers.map((p) => (
              <Button
                key={p}
                variant={priceTierFilter === p ? "default" : "outline"}
                onClick={() => setPriceTierFilter(p)}
                className={`rounded-full text-sm ${
                  priceTierFilter === p ? "bg-primary hover:bg-accent" : "border-border hover:bg-muted"
                }`}
                size="sm"
              >
                {p}
              </Button>
            ))}
          </div>

          <div className="flex justify-center">
            <Link
              to={compareHref}
              className="text-sm text-primary hover:underline"
            >
              对比当前列表前 3 款工具 →
            </Link>
          </div>
        </div>

        <div className="mb-6 text-center text-muted-foreground">
          找到 {filteredTools.length} 个相关工具
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool, index) => {
            const full = toolsCatalog.find((x) => x.id === tool.id);
            return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="rounded-3xl border-border hover:shadow-lg transition-all p-6 bg-white group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform overflow-hidden">
                    {String(tool.icon || "").startsWith("http") ? (
                      <img src={tool.icon} alt={tool.name} className="w-full h-full object-cover" />
                    ) : (
                      tool.icon
                    )}
                  </div>
                  <a
                    href={tool.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label="访问官网"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>

                <Link to={`/tool/${tool.slug}`}>
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                    {tool.description}
                  </p>
                </Link>
                {full?.suitableFor ? (
                  <p className="text-xs text-muted-foreground mb-2">适合：{full.suitableFor}</p>
                ) : null}

                <div className="flex items-center gap-1 mb-4">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium text-foreground">{tool.rating}</span>
                  <span className="text-sm text-muted-foreground ml-1">· {tool.category}</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {tool.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="rounded-full bg-muted text-muted-foreground border-0"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                <Link to={`/tool/${tool.slug}`}>
                  <Button variant="outline" className="w-full rounded-full border-border">
                    查看详情
                  </Button>
                </Link>
              </Card>
            </motion.div>
          );
          })}
        </div>

        {0 === filteredTools.length ? (
          <Card className="rounded-3xl border-border p-10 text-center text-muted-foreground mt-8">
            没有匹配的工具，试试
            <Link to="/search" className="text-primary hover:underline mx-1">
              全站搜索
            </Link>
            。
          </Card>
        ) : null}
      </div>
    </div>
  );
}
