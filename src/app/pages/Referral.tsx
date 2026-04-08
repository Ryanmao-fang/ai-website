import { Card } from "../components/ui/card";
import { motion } from "motion/react";
import { PageMeta } from "../components/PageMeta";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { useLoginDialog } from "../context/LoginDialogContext";

/** 邀请与渠道统计占位：后续可接独立 referral 表或第三方归因 */
export function Referral() {
  const { userId, email } = useAuth();
  const { openLogin } = useLoginDialog();
  const code = userId ? `INV-${String(userId).slice(0, 8).toUpperCase()}` : "";

  return (
    <div className="min-h-screen py-12 bg-secondary/30">
      <PageMeta title="邀请好友" description="邀请与活动统计能力建设中，可先保存您的展示用邀请码。" />
      <div className="max-w-xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-semibold text-foreground mb-2">邀请与渠道</h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            完整裂变规则、奖励结算与防作弊需后台与法务评审。当前页面提供登录用户的临时展示码，便于运营活动手动登记。
          </p>
          <Card className="rounded-3xl border-border p-6 bg-white space-y-4">
            {!userId ? (
              <>
                <p className="text-sm text-muted-foreground">登录后查看与您账号关联的邀请码。</p>
                <Button type="button" className="rounded-full bg-primary" onClick={() => openLogin()}>
                  登录
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">注册邮箱：{email}</p>
                <p className="text-lg font-mono font-semibold text-foreground">{code}</p>
                <p className="text-xs text-muted-foreground">
                  分享站点时可在末尾附带 ?ref=
                  {encodeURIComponent(code)}（落地页读取参数为后续迭代预留）。
                </p>
              </>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
