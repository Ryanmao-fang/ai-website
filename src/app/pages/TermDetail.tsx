import { useEffect, useState, useCallback } from "react";
import { useParams, Link, Navigate } from "react-router";
import { ArrowLeft, Heart, Share2, BookOpen, Sparkles, Clock, ThumbsUp, ThumbsDown } from "lucide-react";
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
    if (!accessToken || !term || !tierMeetsMin(membershipTier, "standard")) {
      setIsFavorite(false);
      return;
    }
    try {
      const payload = await apiClient.getFavorites(accessToken);
      const rows = (payload?.items || []) as { target_type: string; target_id: string }[];
      const hit = rows.some((r) => "term" === r.target_type && r.target_id === String(term.id));
      setIsFavorite(hit);
    } catch {
      setIsFavorite(false);
    }
  }, [accessToken, membershipTier, term]);

  useEffect(() => {
    void refreshFavorite();
  }, [refreshFavorite]);

  useEffect(() => {
    if (!term) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const s = await apiClient.getContentFeedbackStats("term", String(term.id));
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
  }, [term]);

  const handleFavoriteClick = async () => {
    if (!term) {
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
      await apiClient.toggleFavorite(accessToken, { targetType: "term", targetId: String(term.id) });
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

  if (!term) {
    return <Navigate to="/not-found" replace />;
  }

  const relatedTerms = term.relatedTermIds
    .map((rid) => termsCatalog.find((t) => t.id === rid))
    .filter(Boolean) as typeof termsCatalog;

  const postHelpful = async (helpful: boolean) => {
    if (!accessToken) {
      setFeedbackHint("请先登录再提交评价。");
      return;
    }
    setFeedbackHint("");
    try {
      await apiClient.postContentHelpful(accessToken, {
        targetType: "term",
        targetId: String(term.id),
        helpful,
      });
      const s = await apiClient.getContentFeedbackStats("term", String(term.id));
      setHelpfulStats({ yes: Number(s.yes) || 0, no: Number(s.no) || 0 });
      setFeedbackHint("感谢反馈，已记录。");
    } catch (e) {
      setFeedbackHint((e as Error).message || "提交失败");
    }
  };

  return (
    <>
      <PageMeta title={term.name} description={term.description} />
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
                  {term.category}
                </Badge>
                <h1 className="text-4xl font-semibold text-foreground mb-4">{term.name}</h1>
                <p className="text-lg text-muted-foreground">{term.description}</p>
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  预计阅读约 {term.readingMinutes} 分钟
                </p>
                {term.aliases.length > 0 ? (
                  <p className="text-sm text-muted-foreground mt-2">
                    别名：{term.aliases.join("、")}
                  </p>
                ) : null}
                <p className="text-xs text-muted-foreground mt-2">
                  内容版本：{term.contentVersion || "2026-04（随站更新）"}
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
                {userId ? `（${term.likes} 人喜欢）` : ""}
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
                <h2 className="text-xl font-semibold text-foreground">简单解释</h2>
              </div>
              <p className="text-foreground leading-relaxed text-lg">{term.simpleExplanation}</p>
            </Card>
          </motion.div>

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
            <h2 className="text-2xl font-semibold text-foreground mb-6">举例说明</h2>
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
        </div>
      </div>
    </>
  );
}
