import { useEffect, useState, useCallback } from "react";
import { useParams, Link, Navigate } from "react-router";
import { ArrowLeft, Heart, Share2, BookOpen, Sparkles, Clock, ThumbsUp, ThumbsDown, MessageCircle, CircleHelp } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { useLoginDialog } from "../context/LoginDialogContext";
import { tierMeetsMin } from "@/lib/membershipTier";
import { AccessNoticeDialog } from "../components/AccessNoticeDialog";
import { ContentLock, ContentLockInline } from "../components/ContentLock";
import { getTermById, getTermBySlug, termsCatalog } from "@/content/termsCatalog";
import { recordBrowseEntry } from "@/lib/browseHistory";
import { apiClient } from "@/lib/api";
import { PageMeta } from "../components/PageMeta";
import { publicContentApi } from "@/lib/publicContentApi";
import { renderMarkdownBasic } from "@/lib/markdownBasic";

export function TermDetail() {
  const { id } = useParams();
  const term = getTermById(id) || getTermBySlug(id);
  const { membershipTier, accessToken, userId } = useAuth();
  const { openLogin } = useLoginDialog();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const showFullContent = Boolean(userId);
  const [isFavorite, setIsFavorite] = useState(false);
  const [shareHint, setShareHint] = useState("");
  const [helpfulStats, setHelpfulStats] = useState<{ yes: number; no: number } | null>(null);
  const [feedbackHint, setFeedbackHint] = useState("");
  const [cmsTerm, setCmsTerm] = useState<any | null>(null);
  const [cmsLoading, setCmsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) {
        setCmsTerm(null);
        return;
      }
      setCmsLoading(true);
      const row = await publicContentApi.getTerm(id);
      if (!cancelled) {
        setCmsTerm(row);
        setCmsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const effectiveTerm =
    term ||
    (cmsTerm
      ? {
          id: -1,
          slug: String(cmsTerm.slug || id || ""),
          name: String(cmsTerm.name || ""),
          description: String(cmsTerm.description || ""),
          category: String(cmsTerm.category || ""),
          likes: 0,
          simpleExplanation: String(cmsTerm.description || ""),
          examples: [] as { title: string; content: string }[],
          relatedTermIds: [] as number[],
          image: String(cmsTerm.cover_image_url || ""),
          readingMinutes: Number(cmsTerm.reading_minutes || 5),
          aliases: [] as string[],
          contentVersion: String(cmsTerm.content_version || ""),
          references: [] as { title: string; url: string }[],
        }
      : null);

  const cmsMarkdown = String(cmsTerm?.content_markdown || "");
  const previewLen = cmsMarkdown ? Math.min(1600, Math.max(600, Math.floor(cmsMarkdown.length * 0.3))) : 0;
  const cmsPreview = cmsMarkdown ? cmsMarkdown.slice(0, previewLen) : "";
  const cmsRest = cmsMarkdown ? cmsMarkdown.slice(previewLen) : "";

  if (!effectiveTerm) {
    if (cmsLoading) {
      return (
        <div className="min-h-screen py-12 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-muted-foreground">加载中…</div>
        </div>
      );
    }
    return <Navigate to="/not-found" replace />;
  }

  useEffect(() => {
    if (!term) {
      return;
    }
    recordBrowseEntry({
      type: "term",
      id: term.id,
      title: term.name,
      category: term.category,
    });
  }, [term]);

  const refreshFavorite = useCallback(async () => {
    if (!accessToken || !effectiveTerm || effectiveTerm.id <= 0 || !tierMeetsMin(membershipTier, "standard")) {
      setIsFavorite(false);
      return;
    }
    try {
      const payload = await apiClient.getFavorites(accessToken);
      const rows = (payload?.items || []) as { target_type: string; target_id: string }[];
      const hit = rows.some((r) => "term" === r.target_type && r.target_id === String(effectiveTerm.id));
      setIsFavorite(hit);
    } catch {
      setIsFavorite(false);
    }
  }, [accessToken, membershipTier, effectiveTerm]);

  useEffect(() => {
    void refreshFavorite();
  }, [refreshFavorite]);

  useEffect(() => {
    if (!effectiveTerm || effectiveTerm.id <= 0) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const s = await apiClient.getContentFeedbackStats("term", String(effectiveTerm.id));
        if (!cancelled) {
          setHelpfulStats({ yes: Number(s.yes) || 0, no: Number(s.no) || 0 });
        }
      } catch {
        if (!cancelled) {
          setHelpfulStats(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [effectiveTerm]);

  const handleFavoriteClick = async () => {
    if (!effectiveTerm || effectiveTerm.id <= 0) {
      return;
    }
    if (!accessToken) {
      openLogin();
      return;
    }
    if (!tierMeetsMin(membershipTier, "standard")) {
      setUpgradeOpen(true);
      return;
    }
    try {
      await apiClient.toggleFavorite(accessToken, { targetType: "term", targetId: String(effectiveTerm.id) });
      await refreshFavorite();
    } catch (e) {
      alert((e as Error).message || "操作失败");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setShareHint("链接已复制");
    } catch {
      setShareHint("复制失败，请手动复制地址栏链接");
    }
    setTimeout(() => setShareHint(""), 2400);
  };

  const relatedTerms = effectiveTerm.relatedTermIds
    .map((rid) => termsCatalog.find((t) => t.id === rid))
    .filter(Boolean) as typeof termsCatalog;
  const practicalActions = [
    { name: "写周报", href: "/templates", label: "查看模板" },
    { name: "写代码", href: "/tools/compare", label: "查看工具" },
    { name: "学外语", href: "/templates", label: "查看模板" },
  ];
  const relatedToolLinks = [
    { name: "ChatGPT", href: "/tool/chatgpt" },
    { name: "Claude", href: "/tool/claude" },
    { name: "Gemini", href: "/tool/gemini" },
  ];

  const postHelpful = async (helpful: boolean) => {
    if (!accessToken) {
      setFeedbackHint("请先登录再提交评价。");
      return;
    }
    if (effectiveTerm.id <= 0) {
      setFeedbackHint("该内容暂不支持评价，请先发布到正式词条库。");
      return;
    }
    setFeedbackHint("");
    try {
      await apiClient.postContentHelpful(accessToken, {
        targetType: "term",
        targetId: String(effectiveTerm.id),
        helpful,
      });
      const s = await apiClient.getContentFeedbackStats("term", String(effectiveTerm.id));
      setHelpfulStats({ yes: Number(s.yes) || 0, no: Number(s.no) || 0 });
      setFeedbackHint("感谢反馈，已记录。");
    } catch (e) {
      setFeedbackHint((e as Error).message || "提交失败");
    }
  };

  return (
    <>
      <PageMeta title={effectiveTerm.name} description={effectiveTerm.description} />
      <AccessNoticeDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        variant="upgrade"
        onRequestLogin={() => setUpgradeOpen(false)}
      />
      <div className="min-h-screen py-12 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link to="/terms">
              <Button variant="ghost" className="rounded-full -ml-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回列表
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <Badge className="rounded-full bg-primary/10 text-primary border-0 mb-4">
                  {effectiveTerm.category}
                </Badge>
                <h1 className="text-4xl font-semibold text-foreground mb-4">{effectiveTerm.name}</h1>
                <p className="text-lg text-muted-foreground">{effectiveTerm.description}</p>
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2 flex-wrap">
                  <span>⭐ 4.8 分</span>
                  <span>·</span>
                  <span>12,847 人学习</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" />预计 {effectiveTerm.readingMinutes} 分钟</span>
                </p>
                {effectiveTerm.aliases.length > 0 ? (
                  <p className="text-sm text-muted-foreground mt-2">
                    别名：{effectiveTerm.aliases.join("、")}
                  </p>
                ) : null}
                <p className="text-xs text-muted-foreground mt-2">
                  内容版本：{effectiveTerm.contentVersion || "2026-04（随站更新）"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                className="rounded-full bg-primary hover:bg-accent"
                onClick={() => void handleFavoriteClick()}
              >
                <Heart
                  className={`w-4 h-4 mr-2 ${isFavorite ? "fill-white" : ""}`}
                />
                {!userId ? "登录后收藏" : isFavorite ? "已收藏" : "收藏"}
                {userId && effectiveTerm.id > 0 ? `（${effectiveTerm.likes} 人喜欢）` : ""}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-border"
                onClick={() => void handleShare()}
              >
                <Share2 className="w-4 h-4 mr-2" />
                复制链接分享
              </Button>
            </div>
            {shareHint ? <p className="text-sm text-muted-foreground mt-2">{shareHint}</p> : null}
            {!showFullContent ? (
              <p className="text-xs text-muted-foreground mt-3">
                未登录访客可免费阅读「简单解释」与部分示例；登录后解锁举例全文、参考链接与评价。
              </p>
            ) : null}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
          >
            <Card className="rounded-3xl border-border p-8 mb-8 bg-gradient-to-br from-primary/5 to-accent/5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">一句话理解（免费）</h2>
              </div>
              <p className="text-foreground leading-relaxed text-lg">{effectiveTerm.simpleExplanation}</p>
            </Card>
          </motion.div>

          <Card className="rounded-3xl border-border p-6 mb-8 bg-white">
            <h2 className="text-xl font-semibold text-foreground mb-4">我能用它做什么？（免费）</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {practicalActions.map((item) => (
                <div key={item.name} className="rounded-2xl border border-border p-4">
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <Link to={item.href} className="text-xs text-primary hover:underline mt-2 inline-block">
                    {item.label}
                  </Link>
                </div>
              ))}
            </div>
          </Card>

          {cmsMarkdown ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }} className="mb-8">
              <Card className="rounded-3xl border-border p-8 bg-white">
                <h2 className="text-xl font-semibold text-foreground mb-4">深度解释（分层）</h2>
                <div className="mb-4 flex flex-wrap gap-2 text-xs">
                  <Badge className="rounded-full border-0 bg-emerald-100 text-emerald-700">小白版：免费</Badge>
                  <Badge className="rounded-full border-0 bg-blue-100 text-blue-700">进阶版：登录解锁</Badge>
                  <Badge className="rounded-full border-0 bg-amber-100 text-amber-700">专业版：会员解锁</Badge>
                </div>
                {renderMarkdownBasic(cmsPreview || cmsMarkdown)}
                {!showFullContent && cmsRest ? (
                  <div className="mt-6">
                    <ContentLockInline
                      unlocked={false}
                      message="登录后继续阅读完整内容"
                      actionLabel="登录 / 注册"
                      onAction={() => openLogin()}
                    >
                      <div />
                    </ContentLockInline>
                  </div>
                ) : null}
                {showFullContent && cmsRest ? <div className="mt-6">{renderMarkdownBasic(cmsRest)}</div> : null}
              </Card>
            </motion.div>
          ) : null}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            {showFullContent ? (
              <Card className="rounded-3xl border-border p-6 bg-white">
                <p className="text-sm font-medium text-foreground mb-3">这篇内容有帮助吗？</p>
                <div className="flex flex-wrap gap-2 items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full border-border"
                    onClick={() => void postHelpful(true)}
                  >
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    有帮助
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full border-border"
                    onClick={() => void postHelpful(false)}
                  >
                    <ThumbsDown className="w-4 h-4 mr-1" />
                    需改进
                  </Button>
                  {helpfulStats ? (
                    <span className="text-xs text-muted-foreground">
                      反馈统计：有帮助 {helpfulStats.yes} · 待改进 {helpfulStats.no}
                    </span>
                  ) : null}
                </div>
                {feedbackHint ? <p className="text-xs text-muted-foreground mt-2">{feedbackHint}</p> : null}
              </Card>
            ) : (
              <ContentLockInline
                unlocked={false}
                message="登录后可提交「有帮助 / 需改进」，帮助我们改进词条。"
                actionLabel="去登录"
                onAction={() => openLogin()}
              />
            )}
          </motion.div>

          {showFullContent && term.references && term.references.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="mb-8"
            >
              <h2 className="text-xl font-semibold text-foreground mb-3">参考链接（第三方，非背书）</h2>
              <ul className="space-y-2 text-sm">
                {term.references.map((r) => (
                  <li key={r.url}>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {r.title}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ) : null}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-semibold text-foreground mb-6">实战案例（会员优先）</h2>
            {showFullContent ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {term.examples.map((example, index) => (
                  <Card
                    key={index}
                    className="rounded-3xl border-border p-6 bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{example.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{example.content}</p>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {term.examples.slice(0, 1).map((example, index) => (
                    <Card
                      key={index}
                      className="rounded-3xl border-border p-6 bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{example.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{example.content}</p>
                    </Card>
                  ))}
                </div>
                {term.examples.length > 1 ? (
                  <ContentLock
                    unlocked={false}
                    message={`还有 ${term.examples.length - 1} 个示例与详解，登录后即可阅读。`}
                    actionLabel="登录 / 注册"
                    onAction={() => openLogin()}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-0 h-40" aria-hidden>
                      {term.examples.slice(1).map((example, index) => (
                        <Card key={index} className="rounded-3xl border-border p-6 bg-white">
                          <h3 className="font-semibold text-foreground mb-2">{example.title}</h3>
                          <p className="text-muted-foreground leading-relaxed">{example.content}</p>
                        </Card>
                      ))}
                    </div>
                  </ContentLock>
                ) : null}
              </>
            )}
          </motion.div>

          {showFullContent ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-semibold text-foreground mb-4">内容纠错</h2>
              <Card className="rounded-3xl border-border p-6 bg-white text-sm text-muted-foreground leading-relaxed">
                发现事实错误或过时表述？请通过
                <Link to="/feedback" className="text-primary hover:underline mx-1">
                  意见反馈
                </Link>
                附上词条名称与参考资料链接，我们会在审核后更新。
              </Card>
            </motion.div>
          ) : null}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <Card className="rounded-3xl border-border p-6 mb-6 bg-white">
              <h2 className="text-xl font-semibold text-foreground mb-3">相关工具</h2>
              <div className="flex flex-wrap gap-3">
                {relatedToolLinks.map((tool) => (
                  <Link key={tool.name} to={tool.href} className="text-sm text-primary hover:underline">
                    {tool.name}
                  </Link>
                ))}
              </div>
            </Card>

            <h2 className="text-2xl font-semibold text-foreground mb-6">延伸阅读</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedTerms.map((relatedTerm) => (
                <Link key={relatedTerm.id} to={`/term/${relatedTerm.slug}`}>
                  <Card className="rounded-3xl border-border p-6 bg-white hover:shadow-md transition-all group">
                    <Badge className="rounded-full bg-accent/20 text-accent-foreground border-0 mb-3">
                      {relatedTerm.category}
                    </Badge>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {relatedTerm.name}
                    </h3>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.div>

          <Card className="rounded-3xl border-border p-6 mt-8 bg-white">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">学员讨论（示例）</h2>
            </div>
            <p className="text-sm text-muted-foreground">“终于搞懂 LLM 和 GPT 的区别了，原来核心是能力边界和应用方式。”</p>
          </Card>

          <Card className="rounded-3xl border-border p-6 mt-6 bg-white mb-10">
            <div className="flex items-center gap-2 mb-3">
              <CircleHelp className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">学习检测（3题）</h2>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
              <li>LLM 与传统搜索引擎在输出方式上最大的差异是什么？</li>
              <li>你会把这个名词用于哪类工作流？请给出一个场景。</li>
              <li>学习后你还想继续关联哪个名词？</li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
