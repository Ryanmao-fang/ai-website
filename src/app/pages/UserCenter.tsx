import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { User, Heart, History, Crown, Settings, LogOut, LifeBuoy } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { tierDisplayName } from "@/lib/membershipTier";
import { apiClient } from "@/lib/api";
import { listBrowseHistory, formatBrowseTime } from "@/lib/browseHistory";
import { learningPathSections } from "@/content/learningPathConfig";
import { countCompletedInLevel } from "@/lib/learningProgress";
import { getTermById } from "@/content/termsCatalog";
import { getToolById } from "@/content/toolsCatalog";

export function UserCenter() {
  const { email, membershipTier, signOut, accessToken } = useAuth();
  const displayName =
    email && email.includes("@") ? email.split("@")[0] : email || "学习者";

  const [favoriteCount, setFavoriteCount] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!accessToken) {
        return;
      }
      try {
        const payload = await apiClient.getFavorites(accessToken);
        const rows = (payload?.items || []) as unknown[];
        if (!cancelled) {
          setFavoriteCount(rows.length);
        }
      } catch {
        if (!cancelled) {
          setFavoriteCount(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!accessToken) {
        return;
      }
      try {
        const payload = await apiClient.listMyMessages(accessToken);
        if (!cancelled) {
          setMessages((payload?.items || []) as any[]);
        }
      } catch {
        if (!cancelled) {
          setMessages([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const recentViewed = useMemo(() => listBrowseHistory().slice(0, 5), []);

  const learningProgressCards = useMemo(
    () =>
      learningPathSections.map((section) => {
        const completed = countCompletedInLevel(section.id, section.items);
        const total = section.items.length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        return {
          path: section.title,
          progress,
          total,
          completed,
        };
      }),
    []
  );

  const stats = [
    {
      label: "收藏条目",
      value: null === favoriteCount ? "—" : String(favoriteCount),
      icon: "❤️",
    },
    {
      label: "最近浏览（本机）",
      value: String(listBrowseHistory().length),
      icon: "📚",
    },
    {
      label: "学习路线进度",
      value: `${learningProgressCards.reduce((a, b) => a + b.completed, 0)} 节`,
      icon: "✅",
    },
    {
      label: "当前方案",
      value: tierDisplayName(membershipTier),
      icon: "🏷️",
    },
  ];

  const resolveRecentLink = (item: (typeof recentViewed)[0]) => {
    if ("term" === item.type) {
      const t = getTermById(String(item.id));
      return t ? `/term/${t.slug}` : `/terms/${item.id}`;
    }
    if ("tool" === item.type) {
      const t = getToolById(String(item.id));
      return t ? `/tool/${t.slug}` : `/tools/${item.id}`;
    }
    return `/templates#t-${item.id}`;
  };

  return (
    <div className="figma-page py-12 bg-secondary/30">
      <div className="figma-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="rounded-3xl border-border p-8 bg-gradient-to-br from-primary/10 to-accent/10">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-5xl shadow-lg">
                👤
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-2xl font-semibold text-foreground">{displayName}</h1>
                  <Badge className="rounded-full bg-primary text-white border-0">
                    <Crown className="w-3 h-3 mr-1" />
                    {tierDisplayName(membershipTier)}
                  </Badge>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-4 text-muted-foreground text-sm">
                  <span>{email}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link to="/account/settings">
                  <Button variant="outline" className="rounded-full border-border">
                    <Settings className="w-4 h-4 mr-2" />
                    设置
                  </Button>
                </Link>
                <Link to="/membership">
                  <Button className="rounded-full bg-primary hover:bg-accent">
                    <Crown className="w-4 h-4 mr-2" />
                    {"pro" === membershipTier || "standard" === membershipTier
                      ? "续费 / 管理"
                      : "升级会员"}
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat, index) => (
            <Card key={index} className="rounded-3xl border-border p-6 bg-white text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-xl font-semibold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">学习进度（本机 + 登录同步）</h2>
                <Link to="/learning-path">
                  <Button variant="ghost" className="rounded-full text-primary">
                    查看全部 →
                  </Button>
                </Link>
              </div>
              <Card className="rounded-3xl border-border p-6 bg-white">
                <div className="space-y-6">
                  {learningProgressCards.map((item) => (
                    <div key={item.path}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">{item.path}</span>
                        <span className="text-sm text-muted-foreground">
                          {item.completed}/{item.total}
                        </span>
                      </div>
                      <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">最近浏览（本机）</h2>
              </div>
              <Card className="rounded-3xl border-border p-6 bg-white">
                {0 === recentViewed.length ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    尚未记录。访问名词/工具详情后会自动出现在此。
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recentViewed.map((item) => (
                      <Link key={`${item.type}-${item.id}-${item.at}`} to={resolveRecentLink(item)}>
                        <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted/50 transition-colors group">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                                {item.title}
                              </h3>
                              <Badge
                                variant="secondary"
                                className="rounded-full bg-muted text-muted-foreground border-0 text-xs shrink-0"
                              >
                                {item.type === "term"
                                  ? "名词"
                                  : item.type === "tool"
                                    ? "工具"
                                    : "模板"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{item.category}</p>
                          </div>
                          <span className="text-sm text-muted-foreground shrink-0 ml-3">
                            {formatBrowseTime(item.at)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <h2 className="text-xl font-semibold text-foreground mb-4">消息通知中心</h2>
              <Card className="rounded-3xl border-border p-6 bg-white">
                <div className="space-y-3">
                  {messages.map((m) => (
                    <div key={m.id} className={`rounded-2xl border p-4 ${m.is_read ? "border-border" : "border-primary/40 bg-primary/5"}`}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-foreground">{m.title}</p>
                        <span className="text-xs text-muted-foreground">{m.created_at ? new Date(m.created_at).toLocaleString() : "-"}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{m.body}</p>
                      {!m.is_read && accessToken ? (
                        <button
                          type="button"
                          className="text-xs text-primary hover:underline mt-2"
                          onClick={async () => {
                            try {
                              await apiClient.markMessageRead(accessToken, Number(m.id));
                              setMessages((prev) => prev.map((x) => (Number(x.id) === Number(m.id) ? { ...x, is_read: true } : x)));
                            } catch {
                              // 忽略错误，避免阻塞页面
                            }
                          }}
                        >
                          标记已读
                        </button>
                      ) : null}
                    </div>
                  ))}
                  {0 === messages.length ? <p className="text-sm text-muted-foreground">暂无消息。</p> : null}
                </div>
              </Card>
            </motion.div>
          </div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">我的收藏</h2>
              </div>
              <Card className="rounded-3xl border-border p-6 bg-white space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  收藏内容请在专属列表中管理与跳转；进阶会员及以上可使用收藏能力。
                </p>
                <Link to="/favorites">
                  <Button className="w-full rounded-full bg-primary hover:bg-accent">查看全部收藏</Button>
                </Link>
                <Link to="/orders">
                  <Button variant="outline" className="w-full rounded-full border-border">
                    订单记录
                  </Button>
                </Link>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-xl font-semibold text-foreground mb-4">快捷操作</h2>
              <Card className="rounded-3xl border-border p-6 bg-white space-y-3">
                <Link to="/account/settings">
                  <Button variant="ghost" className="w-full justify-start rounded-2xl hover:bg-muted">
                    <User className="w-4 h-4 mr-3" />
                    账号与隐私设置
                  </Button>
                </Link>
                <Link to="/help">
                  <Button variant="ghost" className="w-full justify-start rounded-2xl hover:bg-muted">
                    <Settings className="w-4 h-4 mr-3" />
                    帮助中心
                  </Button>
                </Link>
                <Link to="/membership">
                  <Button variant="ghost" className="w-full justify-start rounded-2xl hover:bg-muted">
                    <Crown className="w-4 h-4 mr-3" />
                    会员权益
                  </Button>
                </Link>
                <Link to="/membership/benefits">
                  <Button variant="ghost" className="w-full justify-start rounded-2xl hover:bg-muted">
                    <Crown className="w-4 h-4 mr-3" />
                    权益落地索引
                  </Button>
                </Link>
                <Link to="/support/tickets">
                  <Button variant="ghost" className="w-full justify-start rounded-2xl hover:bg-muted">
                    <LifeBuoy className="w-4 h-4 mr-3" />
                    客服工单
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-2xl hover:bg-destructive/10 text-destructive"
                  onClick={() => signOut()}
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  退出登录
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
