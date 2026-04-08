import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Search as SearchIcon, ArrowRight, BookOpen, Wrench, FileText, Sparkles } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { motion } from "motion/react";
import { searchAllContent } from "@/lib/searchContent";
import { useAuth } from "../context/AuthContext";
import { useLoginDialog } from "../context/LoginDialogContext";
import { recordSearchQuery, listSearchHistory, clearSearchHistory } from "@/lib/searchHistory";
import { highlightTextParts } from "@/lib/textHighlight";
import { PageMeta } from "../components/PageMeta";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQ);
  const [history, setHistory] = useState<string[]>([]);
  const { userId } = useAuth();
  const { openLogin } = useLoginDialog();
  const navigate = useNavigate();

  useEffect(() => {
    setQuery(initialQ);
  }, [initialQ]);

  useEffect(() => {
    setHistory(listSearchHistory());
  }, []);

  const results = useMemo(() => searchAllContent(query || initialQ), [query, initialQ]);

  const effectiveQuery = (query || initialQ).trim();
  const total =
    results.terms.length + results.tools.length + results.templates.length;

  const runSearch = () => {
    const q = query.trim();
    if (q) {
      recordSearchQuery(q);
      setHistory(listSearchHistory());
    }
    setSearchParams(q ? { q } : {});
  };

  const requireLogin = (path: string) => {
    if (!userId) {
      openLogin();
      return;
    }
    navigate(path);
  };

  return (
    <div className="min-h-screen">
      <PageMeta
        title={effectiveQuery ? `搜索：${effectiveQuery}` : "全站搜索"}
        description={
          effectiveQuery
            ? `在 CommononesAI 中搜索「${effectiveQuery}」的结果：名词、工具与模板。`
            : "搜索 AI 名词、工具与模板。"
        }
      />
      <section className="relative overflow-hidden py-16 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
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
              搜索名词、工具与模板
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              与首页相同的检索范围，一次找到相关内容
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
                    setSearchParams({ q: h });
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!effectiveQuery ? (
            <p className="text-center text-muted-foreground">输入关键词后开始搜索，或使用上方「最近搜索」</p>
          ) : (
            <>
              <p className="text-center text-muted-foreground mb-8">
                关键词「{effectiveQuery}」共找到 {total} 条结果
              </p>

              {0 === total ? (
                <Card className="rounded-3xl border-border p-10 text-center text-muted-foreground">
                  暂无匹配内容，可尝试更短的关键词或切换到
                  <Link to="/terms" className="text-primary hover:underline mx-1">
                    名词库
                  </Link>
                  浏览。
                </Card>
              ) : null}

              {results.terms.length > 0 ? (
                <div className="mb-12">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">AI 名词</h2>
                    <Badge variant="secondary" className="rounded-full border-0">
                      {results.terms.length}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.terms.map((t, index) => (
                      <motion.div
                        key={t.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        {userId ? (
                          <Link to={`/terms/${t.id}`}>
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
                            </Card>
                          </Link>
                        ) : (
                          <button
                            type="button"
                            className="w-full text-left"
                            onClick={() => requireLogin(`/terms/${t.id}`)}
                          >
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
                              <p className="text-xs text-primary mt-2">登录后查看全文</p>
                            </Card>
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : null}

              {results.tools.length > 0 ? (
                <div className="mb-12">
                  <div className="flex items-center gap-2 mb-4">
                    <Wrench className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">工具</h2>
                    <Badge variant="secondary" className="rounded-full border-0">
                      {results.tools.length}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.tools.map((t, index) => (
                      <motion.div
                        key={t.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        {userId ? (
                          <Link to={`/tools/${t.id}`}>
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
                              </div>
                            </Card>
                          </Link>
                        ) : (
                          <button
                            type="button"
                            className="w-full text-left"
                            onClick={() => requireLogin(`/tools/${t.id}`)}
                          >
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
                                <p className="text-xs text-primary mt-2">登录后查看详情</p>
                              </div>
                            </Card>
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : null}

              {results.templates.length > 0 ? (
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
                            onClick={() => requireLogin(`/templates#t-${t.id}`)}
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
