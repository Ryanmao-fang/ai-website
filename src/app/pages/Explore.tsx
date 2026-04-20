import { Link } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Sparkles, BookOpen, Wrench } from "lucide-react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { termsCatalog } from "@/content/termsCatalog";
import { toolsCatalog } from "@/content/toolsCatalog";
import { PageMeta } from "../components/PageMeta";
import { publicContentApi } from "@/lib/publicContentApi";

/** 未登录用户可浏览的内容导览（与详情页登录门槛配合） */
export function Explore() {
  const [cmsTerms, setCmsTerms] = useState<{ slug: string; name: string; description: string; category: string }[] | null>(null);
  const [cmsTools, setCmsTools] = useState<{ slug: string; name: string; description: string; category: string; icon: string; suitableFor?: string }[] | null>(null);

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
          setCmsTerms(terms.slice(0, 6).map((t) => ({
            slug: t.slug,
            name: t.name,
            description: t.description,
            category: t.category,
          })));
        }
        if (tools.length > 0) {
          setCmsTools(tools.slice(0, 6).map((t) => ({
            slug: t.slug,
            name: t.name,
            description: t.description,
            category: t.category,
            icon: t.icon || "🧰",
            suitableFor: t.suitable_for,
          })));
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

  const showTerms = useMemo(() => {
    if (cmsTerms && cmsTerms.length > 0) {
      return cmsTerms;
    }
    return termsCatalog.slice(0, 6).map((t) => ({
      slug: t.slug,
      name: t.name,
      description: t.description,
      category: t.category,
    }));
  }, [cmsTerms]);

  const showTools = useMemo(() => {
    if (cmsTools && cmsTools.length > 0) {
      return cmsTools;
    }
    return toolsCatalog.slice(0, 6).map((t) => ({
      slug: t.slug,
      name: t.name,
      description: t.description,
      category: t.category,
      icon: t.icon,
      suitableFor: t.suitableFor,
    }));
  }, [cmsTools]);

  return (
    <div className="figma-page">
      <PageMeta
        title="内容导览"
        description="先睹为快：AI 名词与工具简介，登录后查看全文与收藏。"
      />
      <section className="figma-hero">
        <div className="figma-hero-bg" />
        <div className="figma-container relative text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">内容导览</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-semibold text-foreground mb-4">先了解，再注册</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              以下为站内词条与工具摘要。可直接
              <Link to="/terms" className="text-primary hover:underline mx-1">
                进入名词库
              </Link>
              或通过上方搜索查找；收藏保存与学习进度同步需在登录后使用会员功能。
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <Link to="/search">
                <Button className="rounded-full bg-primary hover:bg-accent">全站搜索</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="pb-20 bg-white space-y-16">
        <div className="figma-container">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold text-foreground">AI 名词预览</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {showTerms.map((t, i) => (
              <motion.div key={t.slug} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="rounded-3xl border-border p-6 h-full">
                  <Badge className="rounded-full bg-primary/10 text-primary border-0 mb-2">{t.category}</Badge>
                  <h3 className="font-semibold text-foreground mb-2">{t.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{t.description}</p>
                  <Link to={`/term/${t.slug}`} className="text-sm text-primary hover:underline">
                    查看全文 →
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="figma-container">
          <div className="flex items-center gap-2 mb-6">
            <Wrench className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold text-foreground">工具库预览</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {showTools.map((t, i) => (
              <motion.div key={t.slug} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="rounded-3xl border-border p-6 h-full flex gap-4">
                  <div className="text-4xl shrink-0">{t.icon}</div>
                  <div>
                    <Badge className="rounded-full bg-muted text-muted-foreground border-0 mb-2">{t.category}</Badge>
                    <h3 className="font-semibold text-foreground mb-1">{t.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{t.description}</p>
                    {t.suitableFor ? (
                      <p className="text-xs text-muted-foreground mb-2">适合：{t.suitableFor}</p>
                    ) : null}
                    <Link to={`/tool/${t.slug}`} className="text-sm text-primary hover:underline">
                      查看详情 →
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
