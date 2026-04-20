import { Link } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { motion } from "motion/react";
import { clearBrowseHistory } from "@/lib/browseHistory";
import { siteConfig } from "@/lib/siteConfig";
import { useState } from "react";

export function AccountSettings() {
  const [cleared, setCleared] = useState(false);

  return (
    <div className="figma-page py-12 bg-secondary/30">
      <div className="figma-container max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-2">账号与隐私</h1>
          <p className="text-muted-foreground">管理本机浏览痕迹与查阅合规说明</p>
        </motion.div>

        <div className="space-y-6">
          <Card className="rounded-3xl border-border p-8 bg-white space-y-3">
            <h2 className="font-semibold text-foreground">密码与安全</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              修改密码、邮箱验证等由登录服务提供商完成。若忘记密码，可在登录窗口使用「忘记密码」通过邮件重置（需已可收信）。
            </p>
            <Link to="/help">
              <Button variant="outline" className="rounded-full border-border">
                查看帮助中心
              </Button>
            </Link>
          </Card>

          <Card className="rounded-3xl border-border p-8 bg-white space-y-3">
            <h2 className="font-semibold text-foreground">本机浏览记录</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              「最近浏览」暂存在此浏览器中，清除后不影响账号与收藏数据。
            </p>
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-border"
              onClick={() => {
                clearBrowseHistory();
                setCleared(true);
              }}
            >
              清除本机最近浏览
            </Button>
            {cleared ? <p className="text-sm text-emerald-600">已清除。</p> : null}
          </Card>

          <Card className="rounded-3xl border-border p-8 bg-white space-y-3">
            <h2 className="font-semibold text-foreground">数据与删除账号</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              如需删除账号与相关数据，请发邮件至 {siteConfig.supportEmail}，我们将在核验身份后处理。详见
              <Link to="/legal/privacy-policy" className="text-primary hover:underline mx-1">
                隐私政策
              </Link>
              。
            </p>
          </Card>

          <Card className="rounded-3xl border-border p-8 bg-white space-y-3">
            <h2 className="font-semibold text-foreground">会员与发票</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              订单与支付记录可在「订单记录」查看。企业发票与对公转账规则上线前，请邮件联系客服人工处理。
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/orders">
                <Button className="rounded-full bg-primary hover:bg-accent">订单记录</Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" className="rounded-full border-border">
                  联系客服
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
