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

export function ToolDetail() {
  const { id } = useParams();
  const tool = getToolById(id) || getToolBySlug(id);
  const { membershipTier, accessToken, userId } = useAuth();
  const { openLogin } = useLoginDialog();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const showFullTutorial = Boolean(userId);
  const [isFavorite, setIsFavorite] = useState(false);
  const [shareHint, setShareHint] = useState("");
  const [avgRating, setAvgRating] = useState<{ count: number; average: number } | null>(null);
  const [myStars, setMyStars] = useState<number | null>(null);
  const [rateHint, setRateHint] = useState("");

  useEffect(() => {
    if (!tool) {
      return;
    }
    recordBrowseEntry({
      type: "tool",
      id: tool.id,
      title: tool.name,
      category: tool.category,
    });
  }, [tool]);

  const refreshFavorite = useCallback(async () => {
    if (!accessToken || !tool || !tierMeetsMin(membershipTier, "standard")) {
      setIsFavorite(false);
      return;
    }
    try {
      const payload = await apiClient.getFavorites(accessToken);
      const rows = (payload?.items || []) as { target_type: string; target_id: string }[];
      const hit = rows.some((r) => "tool" === r.target_type && r.target_id === String(tool.id));
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

  const handleFavoriteClick = async () => {
    if (!tool) {
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
      await apiClient.toggleFavorite(accessToken, { targetType: "tool", targetId: String(tool.id) });
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

  if (!tool) {
    return <Navigate to="/not-found" replace />;
  }

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

  const displayAvg =
    avgRating && avgRating.count > 0 ? avgRating.average.toFixed(1) : String(tool.rating);

  return (
    <>
      <PageMeta title={tool.name} description={tool.description} />
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
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-5xl flex-shrink-0">
                  {tool.icon}
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
                        {avgRating && avgRating.count > 0
                          ? `用户评分（${avgRating.count} 人）`
                          : "目录参考分 · 登录后参与打分"}
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
                      <p className="text-xs text-muted-foreground">登录后可参与星级评分</p>
                    )}
                  </div>
                  {tool.suitableFor ? (
                    <p className="text-sm text-muted-foreground mb-2">适合人群：{tool.suitableFor}</p>
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
                <h2 className="text-2xl font-semibold text-foreground mb-6">使用场景</h2>
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
                <h2 className="text-2xl font-semibold text-foreground mb-6">使用步骤</h2>
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
