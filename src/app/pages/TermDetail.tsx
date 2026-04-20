import { useEffect, useState, useCallback } from "react";
import { useParams, Link, Navigate } from "react-router";
import { ArrowLeft, Heart, Share2, BookOpen, Sparkles, Clock, ThumbsUp, ThumbsDown, MessageSquare, Trash2 } from "lucide-react";
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
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentHint, setCommentHint] = useState("");

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

  const effectiveTerm = cmsTerm
    ? {
        id: -1,
        slug: String(cmsTerm.slug || id || ""),
        name: String(cmsTerm.name || ""),
        description: String(cmsTerm.description || ""),
        category: String(cmsTerm.category || ""),
        likes: 0,
        simpleExplanation: String(
          (cmsTerm.content_json && (cmsTerm.content_json as any).simpleExplanation) || cmsTerm.description || ""
        ),
        examples: ((cmsTerm.content_json && (cmsTerm.content_json as any).examples) || []) as {
          title: string;
          content: string;
        }[],
        relatedTermIds: [] as number[],
        image: String(cmsTerm.cover_image_url || ""),
        readingMinutes: Number(cmsTerm.reading_minutes || 5),
        aliases: ((cmsTerm.content_json && (cmsTerm.content_json as any).aliases) || []) as string[],
        contentVersion: String(cmsTerm.content_version || ""),
        references: ((cmsTerm.content_json && (cmsTerm.content_json as any).references) || []) as {
          title: string;
          url: string;
        }[],
      }
    : term || null;

  const cmsMarkdown = String(cmsTerm?.content_markdown || "");
  const previewLen = cmsMarkdown ? Math.min(1600, Math.max(600, Math.floor(cmsMarkdown.length * 0.3))) : 0;
  const cmsPreview = cmsMarkdown ? cmsMarkdown.slice(0, previewLen) : "";
  const cmsRest = cmsMarkdown ? cmsMarkdown.slice(previewLen) : "";

  useEffect(() => {
    if (!effectiveTerm) {
      return;
    }
    recordBrowseEntry({
      type: "term",
      id: effectiveTerm.slug || String(effectiveTerm.id),
      title: effectiveTerm.name,
      category: effectiveTerm.category,
    });
  }, [effectiveTerm]);

  useEffect(() => {
    let cancelled = false;
    if (!effectiveTerm) {
      return;
    }
    const targetId = effectiveTerm.id > 0 ? String(effectiveTerm.id) : String(effectiveTerm.slug || "");
    (async () => {
      try {
        const payload = await apiClient.listComments("term", targetId);
        if (!cancelled) {
          setComments((payload?.items || []) as any[]);
        }
      } catch {
        if (!cancelled) {
          setComments([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [effectiveTerm]);

  if (!effectiveTerm) {
    if (cmsLoading) {
      return (
        <div className="figma-page py-12 bg-background">
          <div className="figma-container max-w-4xl text-muted-foreground">加载中…</div>
        </div>
      );
    }
    return <Navigate to="/not-found" replace />;
  }

  const refreshFavorite = useCallback(async () => {
    if (!accessToken || !effectiveTerm || !tierMeetsMin(membershipTier, "standard")) {
      setIsFavorite(false);
      return;
    }
    const slugKey = String(effectiveTerm.slug || "").trim();
    const idKey = effectiveTerm.id > 0 ? String(effectiveTerm.id) : "";
    if (!slugKey && !idKey) {
      setIsFavorite(false);
      return;
    }
    try {
      const payload = await apiClient.getFavorites(accessToken);
      const rows = (payload?.items || []) as { target_type: string; target_id: string }[];
      const hit = rows.some((r) => {
        if ("term" !== r.target_type) {
          return false;
        }
        if (slugKey && r.target_id === slugKey) {
          return true;
        }
        if (idKey && r.target_id === idKey) {
          return true;
        }
        if (slugKey && /^\d+$/.test(r.target_id)) {
          const t = getTermById(r.target_id);
          return t ? t.slug === slugKey : false;
        }
        return false;
      });
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
    if (!effectiveTerm) {
      return;
    }
    const targetId =
      String(effectiveTerm.slug || "").trim() ||
      (effectiveTerm.id > 0 ? String(effectiveTerm.id) : "");
    if (!targetId) {
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
      await apiClient.toggleFavorite(accessToken, { targetType: "term", targetId });
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

  const postComment = async () => {
    if (!accessToken) {
      setCommentHint("请先登录后发表评论。");
      return;
    }
    const text = commentText.trim();
    if (!text) {
      setCommentHint("请输入评论内容。");
      return;
    }
    if (!effectiveTerm) {
      return;
    }
    const targetId = effectiveTerm.id > 0 ? String(effectiveTerm.id) : String(effectiveTerm.slug || "");
    try {
      await apiClient.postComment(accessToken, {
        targetType: "term",
        targetId,
        content: text,
      });
      const payload = await apiClient.listComments("term", targetId);
      setComments((payload?.items || []) as any[]);
      setCommentText("");
      setCommentHint("评论已发布。");
    } catch (e) {
      setCommentHint((e as Error).message || "发布失败");
    }
  };

  const removeComment = async (id: number) => {
    if (!accessToken) {
      return;
    }
    try {
      await apiClient.deleteComment(accessToken, id);
      setComments((prev) => prev.filter((x) => Number(x.id) !== Number(id)));
    } catch (e) {
      setCommentHint((e as Error).message || "删除失败");
    }
  };

  type PracticalActionT = { name: string; href: string; label: string };
  type RelatedTermCardT = { slug: string; name: string; category: string };

  const staticPracticalActions: PracticalActionT[] = [
    { name: "写周报", href: "/templates", label: "查看模板" },
    { name: "写代码", href: "/tools/compare", label: "查看工具" },
    { name: "学外语", href: "/templates", label: "查看模板" },
  ];
  const staticRelatedToolLinks = [
    { name: "ChatGPT", href: "/tool/chatgpt" },
    { name: "Claude", href: "/tool/claude" },
    { name: "Gemini", href: "/tool/gemini" },
  ];

  const cj = (cmsTerm?.content_json || {}) as Record<string, unknown>;
  const practicalActionsForDisplay: PracticalActionT[] = cmsTerm
    ? (Array.isArray(cj.practicalActions) ? cj.practicalActions : [])
        .filter((p: unknown) => {
          const x = p as PracticalActionT;
          return x && String(x.name || "").trim();
        })
        .map((p: unknown) => {
          const x = p as PracticalActionT;
          return {
            name: String(x.name || "").trim(),
            href: String(x.href || "/").trim(),
            label: String(x.label || "查看").trim(),
          };
        })
    : staticPracticalActions;

  const relatedToolLinksForDisplay =
    cmsTerm && Array.isArray(cj.relatedToolLinks) && (cj.relatedToolLinks as unknown[]).some((t: unknown) => t && String((t as { href?: string }).href || "").trim())
      ? (cj.relatedToolLinks as { name: string; href: string }[])
          .filter((t) => t && String(t.href || "").trim())
          .map((t) => ({ name: String(t.name || "").trim(), href: String(t.href || "").trim() }))
      : staticRelatedToolLinks;

  const cmsRelatedTermCards: RelatedTermCardT[] =
    cmsTerm && Array.isArray(cj.relatedTerms)
      ? (cj.relatedTerms as RelatedTermCardT[])
          .filter((r) => r && String(r.slug || "").trim())
          .map((r) => ({
            slug: String(r.slug || "").trim(),
            name: String(r.name || r.slug || "").trim(),
            category: String(r.category || "").trim(),
          }))
      : [];

  const catalogRelatedTerms = effectiveTerm.relatedTermIds
    .map((rid) => termsCatalog.find((t) => t.id === rid))
    .filter(Boolean) as typeof termsCatalog;

  const extendedReadList: RelatedTermCardT[] =
    cmsRelatedTermCards.length > 0
      ? cmsRelatedTermCards
      : catalogRelatedTerms.map((t) => ({
          slug: t.slug,
          name: t.name,
          category: t.category,
        }));

  return (
    <>
      <PageMeta title={effectiveTerm.name} description={effectiveTerm.description} />
      <AccessNoticeDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        variant="upgrade"
        onRequestLogin={() => setUpgradeOpen(false)}
      />
      <div className="figma-page py-12 bg-background">
        <div className="figma-container max-w-4xl">
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

          {effectiveTerm.image && /^https?:\/\//i.test(String(effectiveTerm.image).trim()) ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 }}
              className="mb-6"
            >
              <img
                src={effectiveTerm.image}
                alt=""
                className="w-full max-h-[min(420px,55vh)] object-cover rounded-3xl border border-border shadow-sm bg-muted/30"
                loading="eager"
              />
            </motion.div>
          ) : null}

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
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    约 {effectiveTerm.readingMinutes} 分钟
                  </span>
                </p>
                {effectiveTerm.aliases.length > 0 ? (
                  <p className="text-sm text-muted-foreground mt-2">
                    别名：{effectiveTerm.aliases.join("、")}
                  </p>
                ) : null}
                {effectiveTerm.contentVersion ? (
                  <p className="text-xs text-muted-foreground mt-2">内容版本：{effectiveTerm.contentVersion}</p>
                ) : null}
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
              <p className="text-xs text-muted-foreground mt-3">部分正文与案例需登录后查看。</p>
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
                <h2 className="text-xl font-semibold text-foreground">一句话理解</h2>
              </div>
              <p className="text-foreground leading-relaxed text-lg">{effectiveTerm.simpleExplanation}</p>
            </Card>
          </motion.div>

          {practicalActionsForDisplay.length > 0 ? (
            <Card className="rounded-3xl border-border p-6 mb-8 bg-white">
              <h2 className="text-xl font-semibold text-foreground mb-4">我能用它做什么？</h2>
              <div className="grid sm:grid-cols-3 gap-3">
                {practicalActionsForDisplay.map((item) => (
                  <div key={`${item.name}-${item.href}`} className="rounded-2xl border border-border p-4">
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <Link to={item.href} className="text-xs text-primary hover:underline mt-2 inline-block">
                      {item.label}
                    </Link>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          {cmsMarkdown ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }} className="mb-8">
              <Card className="rounded-3xl border-border p-8 bg-white">
                <h2 className="text-xl font-semibold text-foreground mb-4">深度解释</h2>
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

          {showFullContent && effectiveTerm.references && effectiveTerm.references.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="mb-8"
            >
              <h2 className="text-xl font-semibold text-foreground mb-3">参考链接</h2>
              <ul className="space-y-2 text-sm">
                {effectiveTerm.references.map((r) => (
                  <li key={r.url}>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {r.title}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ) : null}

          {effectiveTerm.examples.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-semibold text-foreground mb-6">实战案例</h2>
              {showFullContent ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {effectiveTerm.examples.map((example, index) => (
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
                    {effectiveTerm.examples.slice(0, 1).map((example, index) => (
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
                  {effectiveTerm.examples.length > 1 ? (
                    <ContentLock
                      unlocked={false}
                      message={`还有 ${effectiveTerm.examples.length - 1} 个案例，登录后可读全文。`}
                      actionLabel="登录 / 注册"
                      onAction={() => openLogin()}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-0 h-40" aria-hidden>
                        {effectiveTerm.examples.slice(1).map((example, index) => (
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
          ) : null}

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
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">词条讨论区</h2>
              </div>
              <div className="space-y-3 mb-4">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="欢迎补充你的理解、提问或案例..."
                  className="w-full min-h-24 rounded-2xl border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
                <div className="flex justify-end">
                  <Button type="button" className="rounded-full" onClick={() => void postComment()}>
                    发布评论
                  </Button>
                </div>
                {commentHint ? <p className="text-xs text-muted-foreground">{commentHint}</p> : null}
              </div>
              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="rounded-2xl border border-border p-3">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{String(c.content || "")}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{c.created_at ? new Date(c.created_at).toLocaleString() : "-"}</span>
                      {accessToken && String(c.user_id || "") === String(userId || "") ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-destructive hover:underline"
                          onClick={() => void removeComment(Number(c.id))}
                        >
                          <Trash2 className="w-3 h-3" />
                          删除
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
                {0 === comments.length ? <p className="text-sm text-muted-foreground">还没有评论，来抢沙发吧。</p> : null}
              </div>
            </Card>

            {relatedToolLinksForDisplay.length > 0 ? (
              <Card className="rounded-3xl border-border p-6 mb-6 bg-white">
                <h2 className="text-xl font-semibold text-foreground mb-3">相关工具</h2>
                <div className="flex flex-wrap gap-3">
                  {relatedToolLinksForDisplay.map((tool) => (
                    <Link key={`${tool.name}-${tool.href}`} to={tool.href} className="text-sm text-primary hover:underline">
                      {tool.name}
                    </Link>
                  ))}
                </div>
              </Card>
            ) : null}

            {extendedReadList.length > 0 ? (
              <>
                <h2 className="text-2xl font-semibold text-foreground mb-6">延伸阅读</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {extendedReadList.map((relatedTerm) => (
                    <Link key={relatedTerm.slug} to={`/term/${relatedTerm.slug}`}>
                      <Card className="rounded-3xl border-border p-6 bg-white hover:shadow-md transition-all group">
                        {relatedTerm.category ? (
                          <Badge className="rounded-full bg-accent/20 text-accent-foreground border-0 mb-3">
                            {relatedTerm.category}
                          </Badge>
                        ) : null}
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {relatedTerm.name}
                        </h3>
                      </Card>
                    </Link>
                  ))}
                </div>
              </>
            ) : null}
          </motion.div>
        </div>
      </div>
    </>
  );
}
