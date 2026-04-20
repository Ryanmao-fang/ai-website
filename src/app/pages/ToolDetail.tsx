import { useEffect, useState, useCallback } from "react";
import { useParams, Link, Navigate } from "react-router";
import {
  ArrowLeft,
  Star,
  ExternalLink,
  BookOpen,
  Lightbulb,
  CheckCircle2,
  Share2,
  Film,
  Swords,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { useLoginDialog } from "../context/LoginDialogContext";
import { tierMeetsMin } from "@/lib/membershipTier";
import { AccessNoticeDialog } from "../components/AccessNoticeDialog";
import { ContentLockInline } from "../components/ContentLock";
import { getToolById, getToolBySlug, toolsCatalog } from "@/content/toolsCatalog";
import { recordBrowseEntry } from "@/lib/browseHistory";
import { apiClient } from "@/lib/api";
import { PageMeta } from "../components/PageMeta";
import { publicContentApi } from "@/lib/publicContentApi";
import {
  extractBilibiliEmbedFromMarkdown,
  extractFirstVideoUrlFromMarkdown,
  extractYoutubeIdFromMarkdown,
  renderMarkdownBasic,
} from "@/lib/markdownBasic";

export function ToolDetail() {
  const { id } = useParams();
  const localTool = getToolById(id) || getToolBySlug(id);
  const { membershipTier, accessToken, userId } = useAuth();
  const { openLogin } = useLoginDialog();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const showFullTutorial = Boolean(userId);
  const [isFavorite, setIsFavorite] = useState(false);
  const [shareHint, setShareHint] = useState("");
  const [avgRating, setAvgRating] = useState<{ count: number; average: number } | null>(null);
  const [myStars, setMyStars] = useState<number | null>(null);
  const [rateHint, setRateHint] = useState("");
  const [cmsTool, setCmsTool] = useState<any | null>(null);
  const [cmsLoading, setCmsLoading] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentHint, setCommentHint] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) {
        setCmsTool(null);
        return;
      }
      setCmsLoading(true);
      const row = await publicContentApi.getTool(id);
      if (!cancelled) {
        setCmsTool(row);
        setCmsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const tool = cmsTool
    ? {
        id: -1,
        slug: String(cmsTool.slug || id || ""),
        name: String(cmsTool.name || ""),
        description: String(cmsTool.description || ""),
        icon: String(cmsTool.icon || "🧰"),
        category: String(cmsTool.category || ""),
        tags: (cmsTool.tags || []) as string[],
        rating: Number(cmsTool.rating || 0),
        link: String(cmsTool.link || ""),
        platform: String(cmsTool.platform || ""),
        openSource: Boolean(cmsTool.open_source),
        priceTier: cmsTool.price_tier || "freemium",
        suitableFor: String(cmsTool.suitable_for || ""),
        disclaimer: String(cmsTool.disclaimer || ""),
        fullDescription: String(cmsTool.description || ""),
        useCases: ((cmsTool.content_json && (cmsTool.content_json as any).useCases) || []) as any[],
        howToUse: ((cmsTool.content_json && (cmsTool.content_json as any).howToUse) || []) as any[],
        relatedToolIds: ((cmsTool.content_json && (cmsTool.content_json as any).relatedToolIds) || []) as number[],
      }
    : localTool || null;

  const cmsMarkdown = String(cmsTool?.content_markdown || "");
  const previewLen = cmsMarkdown ? Math.min(1800, Math.max(700, Math.floor(cmsMarkdown.length * 0.25))) : 0;
  const cmsPreview = cmsMarkdown ? cmsMarkdown.slice(0, previewLen) : "";
  const cmsRest = cmsMarkdown ? cmsMarkdown.slice(previewLen) : "";
  const heroBilibili = cmsMarkdown ? extractBilibiliEmbedFromMarkdown(cmsMarkdown) : null;
  const heroBilibiliPlayerSrc =
    heroBilibili && "bvid" in heroBilibili
      ? `https://player.bilibili.com/player.html?bvid=${encodeURIComponent(heroBilibili.bvid)}&high_quality=1&danmaku=0&autoplay=0`
      : heroBilibili && "aid" in heroBilibili
        ? `https://player.bilibili.com/player.html?aid=${encodeURIComponent(heroBilibili.aid)}&high_quality=1&danmaku=0&autoplay=0&page=1`
        : "";
  const heroVideoFileUrl = cmsMarkdown ? extractFirstVideoUrlFromMarkdown(cmsMarkdown) : null;
  const heroYoutubeId = cmsMarkdown ? extractYoutubeIdFromMarkdown(cmsMarkdown) : null;

  useEffect(() => {
    if (!tool) {
      return;
    }
    recordBrowseEntry({
      type: "tool",
      id: tool.slug || String(tool.id),
      title: tool.name,
      category: tool.category,
    });
  }, [tool]);

  if (!tool) {
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
    if (!accessToken || !tool || !tierMeetsMin(membershipTier, "standard")) {
      setIsFavorite(false);
      return;
    }
    const slugKey = String(tool.slug || "").trim();
    const idKey = tool.id > 0 ? String(tool.id) : "";
    if (!slugKey && !idKey) {
      setIsFavorite(false);
      return;
    }
    try {
      const payload = await apiClient.getFavorites(accessToken);
      const rows = (payload?.items || []) as { target_type: string; target_id: string }[];
      const hit = rows.some((r) => {
        if ("tool" !== r.target_type) {
          return false;
        }
        if (slugKey && r.target_id === slugKey) {
          return true;
        }
        if (idKey && r.target_id === idKey) {
          return true;
        }
        if (slugKey && /^\d+$/.test(r.target_id)) {
          const t = getToolById(r.target_id);
          return t ? t.slug === slugKey : false;
        }
        return false;
      });
      setIsFavorite(hit);
    } catch {
      setIsFavorite(false);
    }
  }, [accessToken, membershipTier, tool]);

  useEffect(() => {
    void refreshFavorite();
  }, [refreshFavorite]);

  useEffect(() => {
    if (!tool) {
      return;
    }
    if (tool.id <= 0) {
      // CMS-only 工具不参与评分体系（评分表以本地目录 id 为 key）
      return;
    }
    let cancelled = false;
    const tid = String(tool.id);
    (async () => {
      try {
        const s = await apiClient.getToolRatingSummary(tid);
        if (!cancelled) {
          setAvgRating({
            count: Number(s.count) || 0,
            average: Number(s.average) || 0,
          });
        }
      } catch {
        if (!cancelled) {
          setAvgRating(null);
        }
      }
      if (accessToken) {
        try {
          const m = await apiClient.getMyToolRating(accessToken, tid);
          if (!cancelled && m.rating) {
            setMyStars(Number((m.rating as { stars: number }).stars) || null);
          }
        } catch {
          if (!cancelled) {
            setMyStars(null);
          }
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tool, accessToken]);

  useEffect(() => {
    let cancelled = false;
    if (!tool) {
      return;
    }
    const targetId = tool.id > 0 ? String(tool.id) : String(tool.slug || "");
    (async () => {
      try {
        const payload = await apiClient.listComments("tool", targetId);
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
  }, [tool]);

  const handleFavoriteClick = async () => {
    if (!tool) {
      return;
    }
    const targetId = String(tool.slug || "").trim() || (tool.id > 0 ? String(tool.id) : "");
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
      await apiClient.toggleFavorite(accessToken, { targetType: "tool", targetId });
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

  // tool 可能来自 CMS，因此此处不再强制 NotFound

  const related = tool.relatedToolIds
    .map((rid) => toolsCatalog.find((t) => t.id === rid))
    .filter(Boolean) as typeof toolsCatalog;

  const submitStars = async (stars: number) => {
    if (!accessToken) {
      setRateHint("登录后可打分。");
      return;
    }
    setRateHint("");
    try {
      await apiClient.rateTool(accessToken, { toolId: String(tool.id), stars });
      setMyStars(stars);
      const s = await apiClient.getToolRatingSummary(String(tool.id));
      setAvgRating({
        count: Number(s.count) || 0,
        average: Number(s.average) || 0,
      });
      setRateHint("评分已保存。");
    } catch (e) {
      setRateHint((e as Error).message || "评分失败");
    }
  };

  const postComment = async () => {
    if (!accessToken) {
      setCommentHint("请先登录后发表评论。");
      return;
    }
    if (!tool) {
      return;
    }
    const text = commentText.trim();
    if (!text) {
      setCommentHint("请输入评论内容。");
      return;
    }
    const targetId = tool.id > 0 ? String(tool.id) : String(tool.slug || "");
    try {
      await apiClient.postComment(accessToken, { targetType: "tool", targetId, content: text });
      const payload = await apiClient.listComments("tool", targetId);
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

  const displayAvg =
    avgRating && avgRating.count > 0 ? avgRating.average.toFixed(1) : String(tool.rating);
  const promptTemplates = [
    "小红书文案生成器",
    "周报生成器",
    "代码解释助手",
  ];

  return (
    <>
      <PageMeta title={tool.name} description={tool.description} />
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
            <Link to="/tools">
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
            <Card className="rounded-3xl border-border p-8 bg-white">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-5xl flex-shrink-0 overflow-hidden">
                  {String(tool.icon || "").startsWith("http") ? (
                    <img src={tool.icon} alt={tool.name} className="w-full h-full object-cover" />
                  ) : (
                    tool.icon
                  )}
                </div>
                <div className="flex-1">
                  <Badge className="rounded-full bg-primary/10 text-primary border-0 mb-3">
                    {tool.category}
                  </Badge>
                  <h1 className="text-3xl font-semibold text-foreground mb-3">{tool.name}</h1>
                  <p className="text-muted-foreground leading-relaxed mb-4">{tool.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4 text-xs text-muted-foreground">
                    {tool.platform ? <span>平台：{tool.platform}</span> : null}
                    {tool.openSource ? <Badge className="rounded-full border-0 bg-emerald-100 text-emerald-800">开源</Badge> : null}
                  </div>
                  <div className="flex flex-col gap-2 mb-4">
                    <div className="flex items-center gap-1 flex-wrap">
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                      <span className="font-medium text-foreground">{displayAvg}</span>
                      <span className="text-muted-foreground text-sm">
                        {avgRating && avgRating.count > 0 ? `评分（${avgRating.count} 人）` : "评分"}
                      </span>
                    </div>
                    {showFullTutorial ? (
                      <>
                        <div className="flex flex-wrap items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              className={`rounded-md p-1 ${myStars && s <= myStars ? "text-amber-500" : "text-muted-foreground"}`}
                              aria-label={`${s} 星`}
                              onClick={() => void submitStars(s)}
                            >
                              <Star className={`w-5 h-5 ${myStars && s <= myStars ? "fill-amber-400" : ""}`} />
                            </button>
                          ))}
                          <span className="text-xs text-muted-foreground ml-2">
                            {myStars ? `我的 ${myStars} 星` : "点击星星提交"}
                          </span>
                        </div>
                        {rateHint ? <p className="text-xs text-muted-foreground">{rateHint}</p> : null}
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">登录后可评分</p>
                    )}
                  </div>
                  {tool.suitableFor ? (
                    <p className="text-sm text-muted-foreground mb-3">适合：{tool.suitableFor}</p>
                  ) : null}
                  <div className="flex flex-wrap gap-3">
                    <a href={tool.link} target="_blank" rel="noopener noreferrer">
                      <Button className="rounded-full bg-primary hover:bg-accent">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        访问官网
                      </Button>
                    </a>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full border-border"
                      onClick={() => void handleFavoriteClick()}
                    >
                      <Star className={`w-4 h-4 mr-2 ${isFavorite ? "fill-amber-400 text-amber-400" : ""}`} />
                      {!userId ? "登录后收藏" : isFavorite ? "已收藏" : "收藏"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full border-border"
                      onClick={() => void handleShare()}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      复制链接
                    </Button>
                  </div>
                  {shareHint ? <p className="text-sm text-muted-foreground mt-2">{shareHint}</p> : null}
                </div>
              </div>
            </Card>
          </motion.div>

          {tool.disclaimer ? (
            <Card className="rounded-3xl border-border p-6 mb-8 bg-amber-50/80 border-amber-200/60 text-sm text-amber-950">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{tool.disclaimer}</p>
              </div>
            </Card>
          ) : null}

          <Card className="rounded-3xl border-border p-6 mb-8 bg-white">
            <h2 className="text-xl font-semibold text-foreground mb-4">快速信息</h2>
            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-2xl border border-border p-4">价格：{tool.priceTier || "freemium"}</div>
              <div className="rounded-2xl border border-border p-4">平台：{tool.platform || "Web"}</div>
              <div className="rounded-2xl border border-border p-4">中文支持：优秀</div>
            </div>
          </Card>

          <Card className="rounded-3xl border-border p-6 mb-8 bg-white">
            <div className="flex items-center gap-2 mb-3">
              <Film className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">5分钟上手视频</h2>
            </div>
            {heroBilibili && heroBilibiliPlayerSrc ? (
              <div className="aspect-video w-full max-w-3xl rounded-2xl overflow-hidden border border-border bg-black/90">
                <iframe
                  className="w-full h-full"
                  title={`${tool.name} 上手视频`}
                  src={heroBilibiliPlayerSrc}
                  allow="fullscreen; autoplay; clipboard-write"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : heroVideoFileUrl ? (
              <video
                className="w-full max-w-3xl rounded-2xl border border-border bg-black/80"
                controls
                playsInline
                preload="metadata"
                src={heroVideoFileUrl}
              >
                您的浏览器不支持视频播放
              </video>
            ) : heroYoutubeId ? (
              <div className="aspect-video w-full max-w-3xl rounded-2xl overflow-hidden border border-border bg-black/90">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube-nocookie.com/embed/${heroYoutubeId}`}
                  title={`${tool.name} 上手视频（YouTube）`}
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-8 text-sm text-muted-foreground">
                在后台「工具 → 正文 Markdown」中：优先单独一行粘贴
                <strong className="font-medium text-foreground"> B 站视频页链接</strong>
                ，或上传 .mp4 等直链视频；YouTube 仅作可选（境内多数网络无法播放）。
              </div>
            )}
          </Card>

          {cmsMarkdown ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="mb-8">
              <Card className="rounded-3xl border-border p-8 bg-white">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">教程与说明</h2>
                </div>
                {renderMarkdownBasic(cmsPreview || cmsMarkdown)}
                {!showFullTutorial && cmsRest ? (
                  <div className="mt-6">
                    <ContentLockInline
                      unlocked={false}
                      message="登录后查看完整教程与合规说明"
                      actionLabel="登录 / 注册"
                      onAction={() => openLogin()}
                    >
                      <div />
                    </ContentLockInline>
                  </div>
                ) : null}
                {showFullTutorial && cmsRest ? <div className="mt-6">{renderMarkdownBasic(cmsRest)}</div> : null}
              </Card>
            </motion.div>
          ) : null}

          {!showFullTutorial ? (
            <ContentLockInline
              unlocked={false}
              message="登录后查看完整工具介绍、典型使用场景与分步上手说明。"
              actionLabel="登录 / 注册"
              onAction={() => openLogin()}
            />
          ) : null}

          {showFullTutorial ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <Card className="rounded-3xl border-border p-8 bg-gradient-to-br from-primary/5 to-accent/5">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">工具介绍</h2>
                  </div>
                  <p className="text-foreground leading-relaxed">{tool.fullDescription}</p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-semibold text-foreground mb-6">核心功能</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tool.useCases.map((useCase, index) => (
                    <Card
                      key={index}
                      className="rounded-3xl border-border p-6 bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="text-3xl mb-3">{useCase.icon}</div>
                      <h3 className="font-semibold text-foreground mb-2">{useCase.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{useCase.description}</p>
                    </Card>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-semibold text-foreground mb-6">快速开始步骤</h2>
                <Card className="rounded-3xl border-border p-8 bg-white">
                  <div className="space-y-6">
                    {tool.howToUse.map((step) => (
                      <div key={step.step} className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {step.step}
                        </div>
                        <div className="flex-1 pt-1">
                          <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                          <p className="text-muted-foreground leading-relaxed">{step.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="mb-10"
              >
                <Card className="rounded-3xl border-border p-6 bg-white mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">工具讨论区</h2>
                  </div>
                  <div className="space-y-3 mb-4">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="分享你的实战经验、参数配置或避坑建议..."
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
                    {0 === comments.length ? <p className="text-sm text-muted-foreground">还没有评论，来分享你的经验。</p> : null}
                  </div>
                </Card>

                <Card className="rounded-3xl border-border p-6 bg-white mb-6">
                  <h2 className="text-xl font-semibold text-foreground mb-3">Prompt 模板库（工具专用）</h2>
                  <div className="space-y-2">
                    {promptTemplates.map((p) => (
                      <div key={p} className="rounded-2xl border border-border p-3 text-sm">
                        {p}
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="rounded-3xl border-border p-6 bg-white mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Swords className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">同类工具对比</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    可前往
                    <Link to="/tools/compare" className="text-primary hover:underline mx-1">
                      工具对比
                    </Link>
                    查看详细对比表。
                  </p>
                </Card>

                <Card className="rounded-3xl border-border p-6 bg-white text-sm text-muted-foreground leading-relaxed flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span>
                    外链跳转仅为您提供方便，不代表本平台与第三方存在商业合作；价格、地区可用性与数据处理方式以对方官网为准。
                  </span>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-2xl font-semibold text-foreground mb-6">推荐工具</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {related.map((relatedTool) => (
                    <Link key={relatedTool.id} to={`/tool/${relatedTool.slug}`}>
                      <Card className="rounded-3xl border-border p-6 bg-white hover:shadow-md transition-all group">
                        <div className="text-3xl mb-3">{relatedTool.icon}</div>
                        <Badge className="rounded-full bg-accent/20 text-accent-foreground border-0 mb-3">
                          {relatedTool.category}
                        </Badge>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {relatedTool.name}
                        </h3>
                      </Card>
                    </Link>
                  ))}
                </div>
              </motion.div>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
