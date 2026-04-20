import { Link, useNavigate } from "react-router";
import { Search, ArrowRight, Sparkles, BookOpen, TrendingUp, Star } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { motion } from "motion/react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useAuth } from "../context/AuthContext";
import { useLoginDialog } from "../context/LoginDialogContext";
import { termsCatalog } from "@/content/termsCatalog";
import { toolsCatalog } from "@/content/toolsCatalog";
import { homeLearningPathPreviewCounts } from "@/content/learningPathConfig";
import { featuredTermIds, featuredToolIds } from "@/content/featured";
import { useEffect, useMemo, useState } from "react";
import { PageMeta } from "../components/PageMeta";
import { siteConfig } from "@/lib/siteConfig";
import { publicContentApi } from "@/lib/publicContentApi";
import { trackEventSafe } from "@/lib/telemetry";

const featuredTerms = featuredTermIds
  .map((id) => termsCatalog.find((t) => t.id === id))
  .filter(Boolean) as typeof termsCatalog;
const featuredTools = featuredToolIds
  .map((id) => toolsCatalog.find((t) => t.id === id))
  .filter(Boolean) as typeof toolsCatalog;
const learningPaths = homeLearningPathPreviewCounts();

export function Home() {
  const { userId } = useAuth();
  const { openLogin } = useLoginDialog();
  const navigate = useNavigate();
  const [heroQuery, setHeroQuery] = useState("");
  const [cmsTerms, setCmsTerms] = useState<{ slug: string; name: string; description: string; category: string }[] | null>(null);
  const [cmsTools, setCmsTools] = useState<{ slug: string; name: string; description: string; category: string; icon: string; tags: string[] }[] | null>(null);

  useEffect(() => {
    void trackEventSafe({ eventName: "home_view", userId });
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [terms, tools] = await Promise.all([
          publicContentApi.listTerms(),
          publicContentApi.listTools(),
        ]);
        if (cancelled) {
          return;
        }
        if (terms.length > 0) {
          setCmsTerms(
            terms.slice(0, 6).map((t) => ({
              slug: t.slug,
              name: t.name,
              description: t.description,
              category: t.category,
            }))
          );
        }
        if (tools.length > 0) {
          setCmsTools(
            tools.slice(0, 8).map((t) => ({
              slug: t.slug,
              name: t.name,
              description: t.description,
              category: t.category,
              icon: t.icon || "🧰",
              tags: t.tags || [],
            }))
          );
        }
      } catch {
        if (!cancelled) {
          setCmsTerms(null);
          setCmsTools(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleTerms = useMemo(() => {
    if (cmsTerms && cmsTerms.length > 0) {
      return cmsTerms;
    }
    return featuredTerms.map((term) => ({
      slug: term.slug,
      name: term.name,
      description: term.description,
      category: term.category,
    }));
  }, [cmsTerms]);

  const visibleTools = useMemo(() => {
    if (cmsTools && cmsTools.length > 0) {
      return cmsTools;
    }
    return featuredTools.map((tool) => ({
      slug: tool.slug,
      name: tool.name,
      description: tool.description,
      category: tool.category,
      icon: tool.icon,
      tags: tool.tags,
    }));
  }, [cmsTools]);

  const termCard = (term: { slug: string; name: string; description: string; category: string }, index: number) => (
    <Card className="overflow-hidden rounded-3xl border-border hover:shadow-lg transition-all group cursor-pointer">
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={term.image}
          alt={term.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Badge className="absolute top-4 left-4 rounded-full bg-white/90 text-foreground border-0">
          {term.category}
        </Badge>
      </div>
      <div className="p-6">
        <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {term.name}
        </h3>
        <p className="text-muted-foreground leading-relaxed">{term.description}</p>
      </div>
    </Card>
  );

  const toolCard = (tool: { slug: string; name: string; description: string; category: string; icon: string; tags: string[] }, index: number) => (
    <Card className="rounded-3xl border-border hover:shadow-lg transition-all group cursor-pointer p-6">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
        {tool.icon}
      </div>
      <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
        {tool.name}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{tool.description}</p>
      <div className="flex flex-wrap gap-2">
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
    </Card>
  );

  const goSearchOrExplore = () => {
    const q = heroQuery.trim();
    if (q) {
      void trackEventSafe({ eventName: "search_submit", userId, payload: { query: q.slice(0, 80), entry: "home_hero" } });
      navigate(`/search?q=${encodeURIComponent(q)}`);
      return;
    }
    navigate("/explore");
  };

  return (
    <div className="figma-page">
      <PageMeta title="首页" description={`${siteConfig.tagline}——AI 名词、工具与学习路线。`} />
      <section className="figma-hero py-20 md:py-32">
        <div className="figma-hero-bg" />
        <div className="figma-container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">让AI学习变得简单愉快</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold text-foreground mb-6 leading-tight">
              探索AI世界
              <br />
              <span className="text-primary">从这里开始</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              最温暖的AI学习社区，用简单的语言解释AI概念，
              <br className="hidden sm:block" />
              发现最好用的AI工具，规划清晰的学习路线
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={heroQuery}
                  onChange={(e) => setHeroQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      goSearchOrExplore();
                    }
                  }}
                  placeholder="搜索AI名词、工具..."
                  className="pl-12 h-14 rounded-full border-border bg-white shadow-sm"
                />
              </div>
              <Button
                type="button"
                className="rounded-full h-14 px-8 bg-primary hover:bg-accent shadow-sm"
                onClick={goSearchOrExplore}
              >
                {heroQuery.trim() ? "搜索" : "开始探索"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="figma-container">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-semibold text-foreground mb-2">热门名词</h2>
              <p className="text-muted-foreground">从基础概念开始，轻松入门AI</p>
            </div>
            <Link to="/terms">
              <Button variant="ghost" className="rounded-full">
                查看全部
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleTerms.map((term, index) => (
              <motion.div
                key={term.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link to={`/term/${term.slug}`}>{termCard(term, index)}</Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary/30">
        <div className="figma-container">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-semibold text-foreground mb-2">精选工具</h2>
              <p className="text-muted-foreground">发现最好用的AI工具，提升工作效率</p>
            </div>
            <Link to="/tools">
              <Button variant="ghost" className="rounded-full">
                查看全部
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleTools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link to={`/tool/${tool.slug}`}>{toolCard(tool, index)}</Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-foreground mb-2">学习路线</h2>
            <p className="text-muted-foreground">循序渐进，系统掌握AI知识</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {learningPaths.map((path, index) => (
              <motion.div
                key={path.level}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link
                  to={`/learning-path#${path.level === "入门" ? "beginner" : path.level === "进阶" ? "intermediate" : "advanced"}`}
                >
                  <Card className="rounded-3xl border-border hover:shadow-lg transition-all p-8 text-center group cursor-pointer">
                    <div className="text-5xl mb-4">{path.icon}</div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{path.level}</h3>
                    <p className="text-muted-foreground mb-4">{path.items} 个学习内容</p>
                    <Badge className={`rounded-full ${path.color} border-0`}>
                      {path.level === "入门" && "从零开始"}
                      {path.level === "进阶" && "深入理解"}
                      {path.level === "高阶" && "融会贯通"}
                    </Badge>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/learning-path">
              <Button className="rounded-full bg-primary hover:bg-accent px-8 h-12">
                <TrendingUp className="w-5 h-5 mr-2" />
                查看完整学习路线
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Star className="w-4 h-4" />
              <span className="text-sm">精心整理</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
              实用模板库
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
              从提示词模板到工作流程，帮你快速上手各类AI工具
            </p>
            {!userId ? (
              <Button
                className="rounded-full bg-primary hover:bg-accent px-8 h-14 text-lg"
                onClick={() => openLogin()}
              >
                <BookOpen className="w-5 h-5 mr-2" />
                浏览模板库
              </Button>
            ) : (
              <Link to="/templates">
                <Button className="rounded-full bg-primary hover:bg-accent px-8 h-14 text-lg">
                  <BookOpen className="w-5 h-5 mr-2" />
                  浏览模板库
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-white border-t border-border">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-muted-foreground space-y-3 leading-relaxed">
          <p className="font-medium text-foreground">信任与合规</p>
          <p>
            运营主体：{siteConfig.companyLegalName} · 客服：{siteConfig.supportEmail} · {siteConfig.businessHours}
          </p>
          <p>站内不展示未经核实的用户数、评价或媒体报道；商务合作与资质材料请通过联系页面沟通。</p>
          <div className="flex flex-wrap justify-center gap-4 text-primary">
            <Link to="/legal/user-agreement" className="hover:underline">
              用户协议
            </Link>
            <Link to="/legal/privacy-policy" className="hover:underline">
              隐私政策
            </Link>
            <Link to="/contact" className="hover:underline">
              联系我们
            </Link>
            <Link to="/changelog" className="hover:underline">
              更新日志
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
