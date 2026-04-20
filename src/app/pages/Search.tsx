import { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { Search as SearchIcon, ArrowRight, BookOpen, Wrench, FileText, Sparkles } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { motion } from "motion/react";
import { searchAllContent, type SearchResults } from "@/lib/searchContent";
import { publicContentApi } from "@/lib/publicContentApi";
import { useAuth } from "../context/AuthContext";
import { useLoginDialog } from "../context/LoginDialogContext";
import { recordSearchQuery, listSearchHistory, clearSearchHistory } from "@/lib/searchHistory";
import { highlightTextParts } from "@/lib/textHighlight";
import { PageMeta } from "../components/PageMeta";
import { getTermById } from "@/content/termsCatalog";
import { getToolById } from "@/content/toolsCatalog";
import { trackEventSafe } from "@/lib/telemetry";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQ);
  const [history, setHistory] = useState<string[]>([]);
  const [remoteResults, setRemoteResults] = useState<SearchResults | null>(null);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const { userId } = useAuth();
  const { openLogin } = useLoginDialog();

  const resultTab = (() => {
    const t = searchParams.get("type") || "all";
    if ("terms" === t || "tools" === t || "templates" === t || "paths" === t || "all" === t) {
      return t;
    }
    return "all";
  })();

  useEffect(() => {
    setQuery(initialQ);
  }, [initialQ]);

  useEffect(() => {
    setHistory(listSearchHistory());
  }, []);

  const effectiveQuery = (query || initialQ).trim();

  useEffect(() => {
    if (!effectiveQuery) {
      setRemoteResults(null);
      return;
    }
    let cancelled = false;
    setRemoteLoading(true);
    publicContentApi
      .search(effectiveQuery, 60)
      .then((raw) => {
        if (cancelled) {
          return;
        }
        setRemoteResults({
          terms: raw.terms.map((t, i) => ({
            kind: "term",
            id: t.slug || `t-${i}`,
            slug: t.slug,
            name: t.name,
            description: t.description,
            category: t.category,
          })),
          tools: raw.tools.map((t, i) => ({
            kind: "tool",
            id: t.slug || `tl-${i}`,
            slug: t.slug,
            name: t.name,
            description: t.description,
            category: t.category,
            icon: t.icon || "🧰",
          })),
          templates: raw.templates.map((tm) => ({
            kind: "template",
            id: tm.id,
            title: tm.title,
            scenario: tm.scenario,
            category: tm.category,
          })),
          learningPaths: raw.learningPaths.map((p) => ({
            kind: "learningPath",
            slug: p.slug,
            title: p.title,
            description: p.description,
          })),
        });
      })
      .catch(() => {
        if (!cancelled) {
          setRemoteResults(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setRemoteLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [effectiveQuery]);

  const staticResults = useMemo(() => searchAllContent(query || initialQ), [query, initialQ]);
  const results = remoteResults ?? staticResults;

  const showTermsBlock = "all" === resultTab || "terms" === resultTab;
  const showToolsBlock = "all" === resultTab || "tools" === resultTab;
  const showTemplatesBlock = "all" === resultTab || "templates" === resultTab;
  const showPathsBlock = "all" === resultTab || "paths" === resultTab;
  const total =
    results.terms.length +
    results.tools.length +
    results.templates.length +
    (results.learningPaths?.length || 0);
  const filteredTotal =
    (showTermsBlock ? results.terms.length : 0) +
    (showToolsBlock ? results.tools.length : 0) +
    (showTemplatesBlock ? results.templates.length : 0) +
    (showPathsBlock ? results.learningPaths?.length || 0 : 0);

  const setResultTab = (t: "all" | "terms" | "tools" | "templates" | "paths") => {
    const q = (query || initialQ).trim();
    if (!q) {
      return;
    }
    if ("all" === t) {
      setSearchParams({ q });
    }
    else {
      setSearchParams({ q, type: t });
    }
  };

  const runSearch = () => {
    const q = query.trim();
    if (q) {
      void trackEventSafe({
        eventName: "search_submit",
        userId,
        payload: { query: q.slice(0, 80), entry: "search_page" },
      });
      recordSearchQuery(q);
      setHistory(listSearchHistory());
      const ty = searchParams.get("type");
      if (ty && "all" !== ty) {
        setSearchParams({ q, type: ty });
      }
      else {
        setSearchParams({ q });
      }
    }
    else {
      setSearchParams({});
    }
  };

  const requireLoginForTemplate = () => {
    openLogin();
  };

  return (
    <div className="figma-page">
      <PageMeta
        title={effectiveQuery ? `搜索：${effectiveQuery}` : "全站搜索"}
        description={
          effectiveQuery
            ? `在 CommononesAI 中搜索「${effectiveQuery}」的结果：名词、工具与模板。`
            : "搜索 AI 名词、工具与模板。"
        }
      />
      <section className="figma-hero">
        <div className="figma-hero-bg" />
        <div className="figma-container relative">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">全站搜索</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-semibold text-foreground mb-4 leading-tight">
              搜索名词、工具、模板与路线
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              主结果来自 CMS 已发布内容；网络异常时回退本地词库
            </p>
          </motion.div>

          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    runSearch();
                  }
                }}
                placeholder="输入关键词，如：提示词、ChatGPT、模板…"
                className="pl-12 h-14 rounded-full border-border bg-white shadow-sm"
              />
            </div>
            <Button
              type="button"
              className="rounded-full h-14 px-8 bg-primary hover:bg-accent shadow-sm"
              onClick={runSearch}
            >
              搜索
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
          {history.length > 0 ? (
            <div className="max-w-2xl mx-auto mt-6 flex flex-wrap items-center gap-2 justify-center">
              <span className="text-xs text-muted-foreground">最近搜索：</span>
              {history.map((h) => (
                <button
                  key={h}
                  type="button"
                  className="text-xs rounded-full border border-border px-3 py-1 text-primary hover:bg-muted/60"
                  onClick={() => {
                    setQuery(h);
                    const ty = searchParams.get("type");
                    if (ty && "all" !== ty) {
                      setSearchParams({ q: h, type: ty });
                    }
                    else {
                      setSearchParams({ q: h });
                    }
                    recordSearchQuery(h);
                    setHistory(listSearchHistory());
                  }}
                >
                  {h}
                </button>
              ))}
              <button
                type="button"
                className="text-xs text-muted-foreground underline"
                onClick={() => {
                  clearSearchHistory();
                  setHistory([]);
                }}
              >
                清空
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <section className="pb-20 bg-white">
        <div className="figma-container">
          {!effectiveQuery ? (
            <p className="text-center text-muted-foreground">输入关键词后开始搜索，或使用上方「最近搜索」</p>
          ) : (
            <>
              <p className="text-center text-muted-foreground mb-2">
                关键词「{effectiveQuery}」共找到 {total} 条结果
                {"all" !== resultTab ? `，当前分类 ${filteredTotal} 条` : ""}
                {remoteLoading ? "（同步 CMS…）" : remoteResults ? "（CMS）" : "（本地）"}
              </p>

              <div className="flex flex-wrap justify-center gap-2 mb-10">
                {(
                  [
                    { id: "all" as const, label: "全部" },
                    { id: "terms" as const, label: "名词" },
                    { id: "tools" as const, label: "工具" },
                    { id: "templates" as const, label: "模板" },
                    { id: "paths" as const, label: "学习路线" },
                  ] as const
                ).map((tab) => (
                  <Button
                    key={tab.id}
                    type="button"
                    variant={resultTab === tab.id ? "default" : "outline"}
                    size="sm"
                    className={`rounded-full ${resultTab === tab.id ? "bg-primary hover:bg-accent" : ""}`}
                    onClick={() => setResultTab(tab.id)}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>

              {0 === total ? (
                <Card className="rounded-3xl border-border p-10 text-center text-muted-foreground">
                  暂无匹配内容，可尝试更短的关键词或切换到
                  <Link to="/terms" className="text-primary hover:underline mx-1">
                    名词库
                  </Link>
                  浏览。
                </Card>
              ) : null}

              {0 < total && 0 === filteredTotal ? (
                <Card className="rounded-3xl border-border p-10 text-center text-muted-foreground mb-8">
                  当前分类下没有匹配项，请切换到「全部」或其它类型。
                </Card>
              ) : null}

              {results.terms.length > 0 && showTermsBlock ? (
                <div className="mb-12">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">AI 名词</h2>
                    <Badge variant="secondary" className="rounded-full border-0">
                      {results.terms.length}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.terms.map((t, index) => {
                      const termRow = t.slug ? null : getTermById(String(t.id));
                      const termTo = t.slug
                        ? `/terms/${t.slug}`
                        : termRow
                          ? `/term/${termRow.slug}`
                          : `/terms/${t.id}`;
                      return (
                      <motion.div
                        key={`term-${t.slug || t.id}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <Link to={termTo}>
                          <Card className="rounded-3xl border-border p-6 hover:shadow-md transition-shadow h-full">
                            <Badge className="rounded-full bg-primary/10 text-primary border-0 mb-2">
                              {t.category}
                            </Badge>
                            <h3 className="font-semibold text-foreground mb-2">
                              {highlightTextParts(t.name, effectiveQuery)}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {highlightTextParts(t.description, effectiveQuery)}
                            </p>
                            {!userId ? (
                              <p className="text-xs text-muted-foreground mt-2">登录可解锁全文与纠错</p>
                            ) : null}
                          </Card>
                        </Link>
                      </motion.div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {results.tools.length > 0 && showToolsBlock ? (
                <div className="mb-12">
                  <div className="flex items-center gap-2 mb-4">
                    <Wrench className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">工具</h2>
                    <Badge variant="secondary" className="rounded-full border-0">
                      {results.tools.length}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.tools.map((t, index) => {
                      const toolRow = t.slug ? null : getToolById(String(t.id));
                      const toolTo = t.slug
                        ? `/tools/${t.slug}`
                        : toolRow
                          ? `/tool/${toolRow.slug}`
                          : `/tools/${t.id}`;
                      return (
                      <motion.div
                        key={`tool-${t.slug || t.id}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <Link to={toolTo}>
                          <Card className="rounded-3xl border-border p-6 hover:shadow-md transition-shadow h-full flex gap-4">
                            <div className="text-4xl">{t.icon}</div>
                            <div>
                              <Badge className="rounded-full bg-muted text-muted-foreground border-0 mb-2">
                                {t.category}
                              </Badge>
                              <h3 className="font-semibold text-foreground mb-1">
                                {highlightTextParts(t.name, effectiveQuery)}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {highlightTextParts(t.description, effectiveQuery)}
                              </p>
                              {!userId ? (
                                <p className="text-xs text-muted-foreground mt-2">登录可查看教程与合规说明</p>
                              ) : null}
                            </div>
                          </Card>
                        </Link>
                      </motion.div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {results.learningPaths && results.learningPaths.length > 0 && showPathsBlock ? (
                <div className="mb-12">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">学习路线</h2>
                    <Badge variant="secondary" className="rounded-full border-0">
                      {results.learningPaths.length}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.learningPaths.map((p, index) => (
                      <motion.div
                        key={p.slug}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <Link to={`/learning-path?cmsSlug=${encodeURIComponent(p.slug)}`}>
                          <Card className="rounded-3xl border-border p-6 hover:shadow-md transition-shadow h-full">
                            <h3 className="font-semibold text-foreground mb-2">
                              {highlightTextParts(p.title, effectiveQuery)}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {highlightTextParts(p.description, effectiveQuery)}
                            </p>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : null}

              {results.templates.length > 0 && showTemplatesBlock ? (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">模板</h2>
                    <Badge variant="secondary" className="rounded-full border-0">
                      {results.templates.length}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.templates.map((t, index) => (
                      <motion.div
                        key={t.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        {userId ? (
                          <Link to={`/templates#t-${t.id}`}>
                            <Card className="rounded-3xl border-border p-6 hover:shadow-md transition-shadow h-full">
                              <Badge className="rounded-full bg-primary/10 text-primary border-0 mb-2">
                                {t.category}
                              </Badge>
                              <h3 className="font-semibold text-foreground mb-2">
                                {highlightTextParts(t.title, effectiveQuery)}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {highlightTextParts(t.scenario, effectiveQuery)}
                              </p>
                            </Card>
                          </Link>
                        ) : (
                          <button
                            type="button"
                            className="w-full text-left"
                            onClick={() => requireLoginForTemplate()}
                          >
                            <Card className="rounded-3xl border-border p-6 hover:shadow-md transition-shadow h-full">
                              <Badge className="rounded-full bg-primary/10 text-primary border-0 mb-2">
                                {t.category}
                              </Badge>
                              <h3 className="font-semibold text-foreground mb-2">
                                {highlightTextParts(t.title, effectiveQuery)}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {highlightTextParts(t.scenario, effectiveQuery)}
                              </p>
                              <p className="text-xs text-primary mt-2">登录后复制模板</p>
                            </Card>
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
