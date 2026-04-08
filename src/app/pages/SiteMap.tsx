import { Link } from "react-router";
import { Card } from "../components/ui/card";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { useLoginDialog } from "../context/LoginDialogContext";

type LinkItem = { name: string; path: string; needsLogin?: boolean };

const groups: { title: string; links: LinkItem[] }[] = [
  {
    title: "学习",
    links: [
      { name: "首页", path: "/" },
      { name: "内容导览", path: "/explore" },
      { name: "AI 名词", path: "/terms" },
      { name: "工具库", path: "/tools" },
      { name: "学习路线", path: "/learning-path" },
      { name: "模板库", path: "/templates", needsLogin: true },
      { name: "全站搜索", path: "/search" },
      { name: "工具对比", path: "/tools/compare" },
    ],
  },
  {
    title: "账户与会员",
    links: [
      { name: "会员方案", path: "/membership" },
      { name: "权益落地索引", path: "/membership/benefits" },
      { name: "个人中心", path: "/user", needsLogin: true },
      { name: "我的收藏", path: "/favorites", needsLogin: true },
      { name: "订单记录", path: "/orders", needsLogin: true },
      { name: "账号与隐私设置", path: "/account/settings", needsLogin: true },
      { name: "1 对 1 预约（专业会员）", path: "/pro-booking", needsLogin: true },
      { name: "邀请码占位", path: "/referral" },
    ],
  },
  {
    title: "关于与合规",
    links: [
      { name: "关于我们", path: "/about" },
      { name: "联系我们", path: "/contact" },
      { name: "帮助中心", path: "/help" },
      { name: "客服工单", path: "/support/tickets", needsLogin: true },
      { name: "更新日志", path: "/changelog" },
      { name: "意见反馈", path: "/feedback" },
      { name: "提交模板", path: "/templates/submit", needsLogin: true },
      { name: "用户协议", path: "/legal/user-agreement" },
      { name: "隐私政策", path: "/legal/privacy-policy" },
    ],
  },
];

export function SiteMap() {
  const { userId } = useAuth();
  const { openLogin } = useLoginDialog();

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden py-16 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-5xl font-semibold text-foreground mb-4">站点地图</h1>
            <p className="text-muted-foreground">快速找到常用页面</p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
          {groups.map((g, gi) => (
            <motion.div key={g.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.05 }}>
              <Card className="rounded-3xl border-border p-6">
                <h2 className="font-semibold text-foreground mb-4">{g.title}</h2>
                <ul className="space-y-3">
                  {g.links.map((l) => (
                    <li key={l.path}>
                      {l.needsLogin && !userId ? (
                        <button
                          type="button"
                          className="text-left text-primary hover:underline text-sm"
                          onClick={() => openLogin()}
                        >
                          {l.name}
                          <span className="text-muted-foreground">（登录）</span>
                        </button>
                      ) : (
                        <Link to={l.path} className="text-sm text-primary hover:underline">
                          {l.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
