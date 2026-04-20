import { Card } from "../components/ui/card";
import { motion } from "motion/react";
import { PageMeta } from "../components/PageMeta";
import { siteConfig } from "@/lib/siteConfig";

const entries = [
  {
    version: siteConfig.appVersion,
    date: "2026-04-08",
    items: [
      "全站搜索高亮与历史、无障碍跳过链接与主内容锚点",
      "学习路线进度支持登录后云端同步（需部署 learning_progress 表）",
      "工具评分、词条内容有帮助反馈、客服工单入口",
      "内容导览页、工具对比与筛选增强",
    ],
  },
  {
    version: "1.0.0",
    date: "2026-04-01",
    items: ["首版会员售卖、收藏与订单列表", "名词 / 工具 / 模板统一内容目录"],
  },
];

export function Changelog() {
  return (
    <div className="figma-page py-12 bg-secondary/30">
      <PageMeta title="更新日志" description="版本与功能迭代记录，停机维护公告见顶栏（若配置）。" />
      <div className="figma-container max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-semibold text-foreground mb-2">更新日志</h1>
          <p className="text-sm text-muted-foreground mb-8">当前前端展示版本：{siteConfig.appVersion}</p>
        </motion.div>
        <div className="space-y-6">
          {entries.map((e, i) => (
            <motion.div key={e.version} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="rounded-3xl border-border p-6 bg-white">
                <div className="flex flex-wrap items-baseline gap-2 mb-3">
                  <h2 className="text-lg font-semibold text-foreground">{e.version}</h2>
                  <span className="text-xs text-muted-foreground">{e.date}</span>
                </div>
                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                  {e.items.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
