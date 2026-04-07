import { Link } from "react-router";
import { User, Heart, History, Crown, Settings, LogOut, TrendingUp } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { tierDisplayName } from "@/lib/membershipTier";

export function UserCenter() {
  const { email, membershipTier, signOut } = useAuth();
  const displayName =
    email && email.includes("@") ? email.split("@")[0] : email || "学习者";

  const user = {
    name: displayName,
    avatar: "👤",
    level: tierDisplayName(membershipTier),
    points: 2340,
    joinDate: "2025年3月",
  };

  const stats = [
    { label: "学习天数", value: 45, icon: "📅" },
    { label: "收藏内容", value: 23, icon: "❤️" },
    { label: "完成项目", value: 12, icon: "✅" },
    { label: "获得徽章", value: 8, icon: "🏆" },
  ];

  const recentViewed = [
    { id: 1, type: "term", title: "大语言模型", category: "基础概念", date: "今天" },
    { id: 2, type: "tool", title: "ChatGPT", category: "对话助手", date: "今天" },
    { id: 3, type: "template", title: "文章大纲生成", category: "写作创作", date: "昨天" },
  ];

  const favorites = [
    { id: 1, type: "term", title: "Prompt Engineering", category: "实用技能" },
    { id: 2, type: "tool", title: "Midjourney", category: "图像生成" },
    { id: 3, type: "term", title: "神经网络", category: "技术原理" },
    { id: 4, type: "tool", title: "Claude", category: "对话助手" },
  ];

  const learningProgress = [
    { path: "入门篇", progress: 100, total: 12, completed: 12 },
    { path: "进阶篇", progress: 45, total: 18, completed: 8 },
    { path: "高阶篇", progress: 0, total: 24, completed: 0 },
  ];

  return (
    <div className="min-h-screen py-12 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="rounded-3xl border-border p-8 bg-gradient-to-br from-primary/10 to-accent/10">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-5xl shadow-lg">
                {user.avatar}
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-2xl font-semibold text-foreground">{user.name}</h1>
                  <Badge className="rounded-full bg-primary text-white border-0">
                    <Crown className="w-3 h-3 mr-1" />
                    {user.level}
                  </Badge>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-4 text-muted-foreground">
                  <span>积分：{user.points}</span>
                  <span>·</span>
                  <span>加入于 {user.joinDate}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="rounded-full border-border">
                  <Settings className="w-4 h-4 mr-2" />
                  设置
                </Button>
                <Link to="/membership">
                  <Button className="rounded-full bg-primary hover:bg-accent">
                    <Crown className="w-4 h-4 mr-2" />
                    {"pro" === membershipTier ? "续费 / 管理" : "升级会员"}
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat, index) => (
            <Card key={index} className="rounded-3xl border-border p-6 bg-white text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-semibold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Learning Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">学习进度</h2>
                <Link to="/learning-path">
                  <Button variant="ghost" className="rounded-full text-primary">
                    查看全部 →
                  </Button>
                </Link>
              </div>
              <Card className="rounded-3xl border-border p-6 bg-white">
                <div className="space-y-6">
                  {learningProgress.map((item, index) => (
                    <div key={index}>
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

            {/* Recent Viewed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">最近浏览</h2>
              </div>
              <Card className="rounded-3xl border-border p-6 bg-white">
                <div className="space-y-4">
                  {recentViewed.map((item) => (
                    <Link
                      key={item.id}
                      to={`/${item.type === "term" ? "terms" : item.type === "tool" ? "tools" : "templates"}`}
                    >
                      <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted/50 transition-colors group">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                              {item.title}
                            </h3>
                            <Badge
                              variant="secondary"
                              className="rounded-full bg-muted text-muted-foreground border-0 text-xs"
                            >
                              {item.type === "term" ? "名词" : item.type === "tool" ? "工具" : "模板"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">{item.date}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Favorites */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">我的收藏</h2>
              </div>
              <Card className="rounded-3xl border-border p-6 bg-white">
                <div className="space-y-3">
                  {favorites.map((item) => (
                    <Link
                      key={item.id}
                      to={`/${item.type === "term" ? "terms" : "tools"}/${item.id}`}
                    >
                      <div className="p-4 rounded-2xl hover:bg-muted/50 transition-colors group">
                        <h3 className="font-medium text-foreground mb-1 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4 rounded-full border-border">
                  查看全部收藏
                </Button>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-xl font-semibold text-foreground mb-4">快捷操作</h2>
              <Card className="rounded-3xl border-border p-6 bg-white space-y-3">
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-2xl hover:bg-muted"
                >
                  <User className="w-4 h-4 mr-3" />
                  编辑个人资料
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-2xl hover:bg-muted"
                >
                  <Settings className="w-4 h-4 mr-3" />
                  账号设置
                </Button>
                <Link to="/membership">
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-2xl hover:bg-muted"
                  >
                    <Crown className="w-4 h-4 mr-3" />
                    会员权益
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
