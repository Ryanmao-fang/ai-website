import { Link } from "react-router";
import { motion } from "motion/react";
import { Card } from "../components/ui/card";
import { PageMeta } from "../components/PageMeta";

const rows = [
  {
    benefit: "专属学习计划",
    where: "/learning-path",
    note: "登录后按路线学习；勾选进度可与账号同步。",
  },
  {
    benefit: "高级模板",
    where: "/templates",
    note: "进阶及以上会员可用；具体以会员页档位为准。",
  },
  {
    benefit: "优先客服",
    where: "/support/tickets",
    note: "工单系统记录诉求；紧急可邮件或联系页并行。",
  },
  {
    benefit: "线下活动（如有）",
    where: "/contact",
    note: "活动开报时通过邮件/公告通知；此处为商务与合作入口。",
  },
  {
    benefit: "1 对 1 辅导（专业会员）",
    where: "/pro-booking",
    note: "提交预约工单，人工确认排期与交付方式。",
  },
];

/** 会员工具箱：把文案权益落到可点击路径，降低「宣传夸大」风险 */
export function MembershipBenefits() {
  return (
    <div className="min-h-screen py-12 bg-secondary/30">
      <PageMeta title="权益落地索引" description="会员权益对应的站内功能入口一览。" />
      <div className="max-w-3xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2">权益如何兑现</h1>
          <p className="text-sm text-muted-foreground">
            以下为站内已实现或可运营的履约入口索引；若某权益未上线，请勿在售卖页作肯定承诺。
          </p>
        </motion.div>
        <div className="space-y-4">
          {rows.map((r, i) => (
            <motion.div key={r.benefit} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="rounded-3xl border-border p-6 bg-white">
                <h2 className="font-semibold text-foreground mb-2">{r.benefit}</h2>
                <p className="text-sm text-muted-foreground mb-3">{r.note}</p>
                <Link to={r.where} className="text-sm text-primary hover:underline">
                  前往 {r.where} →
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-8">
          <Link to="/membership" className="text-primary hover:underline">
            返回会员售卖页
          </Link>
        </p>
      </div>
    </div>
  );
}
