import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Sparkles, BookOpen, Wrench, FileText, CheckCircle2, Lock, Award, Users } from "lucide-react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { useLoginDialog } from "../context/LoginDialogContext";
import { tierMeetsMin } from "@/lib/membershipTier";
import { AccessNoticeDialog } from "../components/AccessNoticeDialog";
import { ContentLockInline } from "../components/ContentLock";
import { apiClient, ApiNetworkError } from "@/lib/api";
import {
  learningPathSections,
  type LearningPathLevelId,
} from "@/content/learningPathConfig";
import { getTermById } from "@/content/termsCatalog";
import { getToolById } from "@/content/toolsCatalog";
import { getTemplateById } from "@/content/templatesCatalog";
import {
  countCompletedInLevel,
  isPathItemCompleted,
  togglePathItemCompleted,
  mergeRemoteLearningRows,
} from "@/lib/learningProgress";

export function LearningPath() {
  const { membershipTier, accessToken, userId } = useAuth();
  const { openLogin } = useLoginDialog();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const location = useLocation();
  const [selectedLevel, setSelectedLevel] = useState<LearningPathLevelId>("beginner");
  const [progressTick, setProgressTick] = useState(0);

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if ("beginner" === hash || "intermediate" === hash || "advanced" === hash) {
      setSelectedLevel(hash);
    }
  }, [location.hash]);

  const proDeepItems: { title: string; description: string; href: string }[] = [
    {
      title: "1对1学习辅导",
      description: "预约导师进行个性化答疑、作业批改与学习规划（专业会员提交工单预约）。",
      href: "/pro-booking",
    },
    {
      title: "独家深度课程",
      description: "多模态、Agent、RAG 等专题以公告与模板库更新为准。",
      href: "/changelog",
    },
    {
      title: "企业级模板与案例",
      description: "模板库内企业向内容与投稿审核说明。",
      href: "/templates",
    },
    {
      title: "定制化学习方案",
      description: "联系客服登记需求，或提交工单说明背景。",
      href: "/contact",
    },
  ];

  const handleProItemClick = () => {
    if ("pro" !== membershipTier) {
      setUpgradeOpen(true);
    }
  };

  const currentSection =
    learningPathSections.find((s) => s.id === selectedLevel) || learningPathSections[0];

  const resolveTitle = (type: string, id: number) => {
    if ("term" === type) {
      return getTermById(String(id))?.name || `名词 #${id}`;
    }
    if ("tool" === type) {
      return getToolById(String(id))?.name || `工具 #${id}`;
    }
    return getTemplateById(id)?.title || `模板 #${id}`;
  };

  const resolveDescription = (type: string, id: number) => {
    if ("term" === type) {
      return getTermById(String(id))?.description || "";
    }
    if ("tool" === type) {
      return getToolById(String(id))?.description || "";
    }
    return getTemplateById(id)?.scenario || "";
  };

  const getItemLink = (type: string, id: number) => {
    if ("term" === type) {
      const t = getTermById(String(id));
      return t ? `/term/${t.slug}` : `/terms/${id}`;
    }
    if ("tool" === type) {
      const t = getToolById(String(id));
      return t ? `/tool/${t.slug}` : `/tools/${id}`;
    }
    return `/templates#t-${id}`;
  };

  const getItemIcon = (type: string) => {
    if ("term" === type) {
      return <BookOpen className="w-5 h-5" />;
    }
    if ("tool" === type) {
      return <Wrench className="w-5 h-5" />;
    }
    if ("template" === type) {
      return <FileText className="w-5 h-5" />;
    }
    return <Sparkles className="w-5 h-5" />;
  };

  const canAccessLevel = (id: LearningPathLevelId): boolean => {
    return "beginner" === id || tierMeetsMin(membershipTier, "standard");
  };

  const levelAllowed = canAccessLevel(selectedLevel);

  const completedCount = levelAllowed
    ? countCompletedInLevel(selectedLevel, currentSection.items)
    : 0;
  const total = currentSection.items.length;
  const progressPct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const bumpProgress = () => setProgressTick((n) => n + 1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!accessToken) {
        return;
      }
      try {
        const res = await apiClient.getLearningProgress(accessToken);
        const items = (res?.items || []) as {
          level: string;
          item_type: string;
          item_id: number;
          completed: boolean;
        }[];
        if (!cancelled) {
          mergeRemoteLearningRows(items);
          setProgressTick((n) => n + 1);
        }
      } catch {
        /* 表未创建或离线时沿用本机进度 */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  return (
    <>
      <AccessNoticeDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        variant="upgrade"
        onRequestLogin={() => setUpgradeOpen(false)}
      />
      <div className="min-h-screen py-12 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-semibold text-foreground mb-4">AI学习路线</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              已有 12,847 人学习 · 平均完成率 68%。按天推进，支持进度同步与阶段奖励。
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            {learningPathSections.map((section, index) => {
              const isSelected = selectedLevel === section.id;
              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLevel(section.id);
                      window.history.replaceState(null, "", `#${section.id}`);
                    }}
                    className="w-full text-left"
                  >
                    <Card
                      className={`rounded-3xl p-8 cursor-pointer transition-all ${
                        isSelected ? "border-primary shadow-lg scale-105" : "border-border hover:shadow-md"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-5xl mb-4">{section.icon}</div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">{section.title}</h3>
                        <p className="text-muted-foreground mb-4">{section.subtitle}</p>
                        <p className="text-sm text-muted-foreground mb-2">
                          {section.items.length} 个学习内容
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center mt-2">
                          {isSelected ? (
                            <Badge className="rounded-full bg-primary text-white border-0">当前选择</Badge>
                          ) : null}
                          {!canAccessLevel(section.id) ? (
                            <Badge variant="secondary" className="rounded-full border-0 text-xs">
                              进阶会员起
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </Card>
                  </button>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            key={`${selectedLevel}-${progressTick}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card
              className={`rounded-3xl border-border p-8 bg-gradient-to-br ${currentSection.color} bg-opacity-5 mb-8`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="text-4xl">{currentSection.icon}</div>
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">{currentSection.title}</h2>
                  <p className="text-muted-foreground">{currentSection.subtitle}</p>
                </div>
              </div>
              {levelAllowed ? (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    你的进度：{progressPct}%（已学 {completedCount}/{total}）
                  </p>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              ) : null}
            </Card>

            {!levelAllowed ? (
              <ContentLockInline
                unlocked={false}
                message={
                  userId
                    ? "进阶与高级路线为进阶会员专享，开通后可逐项打开链接、勾选完成度并云端同步。"
                    : "「入门」路线任意浏览；查看进阶/高级完整目录并同步进度请先登录，解锁全部需进阶会员。"
                }
                actionLabel={userId ? "了解会员方案" : "登录 / 注册"}
                onAction={() => {
                  if (userId) {
                    setUpgradeOpen(true);
                  } else {
                    openLogin();
                  }
                }}
              />
            ) : null}

            <div className="space-y-4">
              {levelAllowed
                ? currentSection.items.map((item, index) => {
                const title = resolveTitle(item.type, item.id);
                const desc = resolveDescription(item.type, item.id);
                const completed = isPathItemCompleted(selectedLevel, item.type, item.id);
                return (
                  <motion.div
                    key={`${item.type}-${item.id}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`rounded-3xl border-border p-6 transition-all ${
                        completed ? "bg-primary/5" : "bg-white"
                      }`}
                    >
                      <p className="text-xs text-muted-foreground mb-2">Day {index + 1}</p>
                      <div className="flex items-center gap-4">
                        <Link to={getItemLink(item.type, item.id)} className="flex-1 min-w-0 group">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              <div
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                  completed
                                    ? "bg-primary text-white"
                                    : "bg-muted text-muted-foreground"
                                } group-hover:scale-110 transition-transform`}
                              >
                                {completed ? <CheckCircle2 className="w-6 h-6" /> : getItemIcon(item.type)}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3
                                  className={`font-semibold ${
                                    completed
                                      ? "text-primary"
                                      : "text-foreground group-hover:text-primary"
                                  } transition-colors`}
                                >
                                  {title}
                                </h3>
                                <Badge
                                  variant="secondary"
                                  className="rounded-full bg-muted/50 text-muted-foreground border-0 text-xs"
                                >
                                  {item.type === "term" && "名词"}
                                  {item.type === "tool" && "工具"}
                                  {item.type === "template" && "模板"}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground text-sm line-clamp-2">{desc}</p>
                            </div>
                            {completed ? (
                              <Badge className="rounded-full bg-primary/10 text-primary border-0 shrink-0">
                                已完成
                              </Badge>
                            ) : null}
                          </div>
                        </Link>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-full shrink-0 border-border"
                          onClick={() => {
                            if (!userId) {
                              openLogin();
                              return;
                            }
                            const next = !completed;
                            togglePathItemCompleted(selectedLevel, item.type, item.id, next);
                            bumpProgress();
                            if (accessToken) {
                              void (async () => {
                                try {
                                  await apiClient.saveLearningProgress(accessToken, {
                                    level: selectedLevel,
                                    itemType: item.type,
                                    itemId: item.id,
                                    completed: next,
                                  });
                                } catch (e) {
                                  if (e instanceof ApiNetworkError) {
                                    alert(e.message);
                                  }
                                }
                              })();
                            }
                          }}
                        >
                          {completed ? "取消完成" : "标记完成"}
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
                : null}
            </div>

            {levelAllowed ? (
              <Card className="rounded-3xl border-border p-8 mt-8 bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">完成奖励</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  完成当前路线全部内容后，获得「AI入门者」学习证书与路线徽章。
                </p>
              </Card>
            ) : null}

            <Card className="rounded-3xl border-border p-8 mt-6 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">同期学习伙伴</h3>
              </div>
              <p className="text-sm text-muted-foreground">24 人正在学习本路线，小明刚刚完成了 Day 3。</p>
            </Card>

            <Card className="rounded-3xl border-border p-8 mt-10 bg-gradient-to-br from-amber-500/10 via-primary/5 to-transparent">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-amber-600" />
                <h3 className="text-xl font-semibold text-foreground">专业会员 · 深度与定制</h3>
                {"pro" === membershipTier ? (
                  <Badge className="rounded-full bg-amber-500/20 text-amber-900 border-0">已解锁</Badge>
                ) : (
                  <Badge variant="secondary" className="rounded-full border-0">
                    升级后可用
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                对应专业会员权益说明见会员页；具体履约（预约、开票、交付）以客服确认为准。
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {proDeepItems.map((item) =>
                  "pro" === membershipTier ? (
                    <Link
                      key={item.title}
                      to={item.href}
                      className="text-left rounded-3xl border border-border bg-white/80 p-5 hover:shadow-md transition-all block"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <button
                      key={item.title}
                      type="button"
                      className="text-left rounded-3xl border border-border bg-white/80 p-5 hover:shadow-md transition-all w-full"
                      onClick={handleProItemClick}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                        </div>
                        <Lock className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                      </div>
                    </button>
                  )
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}
