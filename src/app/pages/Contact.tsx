import { Mail, Clock, MessageCircle } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { motion } from "motion/react";
import { siteConfig } from "@/lib/siteConfig";
import { Link } from "react-router";

export function Contact() {
  const mailHref = `mailto:${siteConfig.supportEmail}?subject=${encodeURIComponent(
    "【CommononesAI】用户咨询"
  )}`;

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">联系我们</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-semibold text-foreground mb-4">取得联系与客服</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              支付、账号、内容与功能建议均可联系；{siteConfig.businessHours}。
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          <Card className="rounded-3xl border-border p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground mb-1">邮箱</h2>
                <p className="text-muted-foreground text-sm mb-3">
                  统一客服与商务入口（请将问题描述、账号邮箱、截图一并附上）。
                </p>
                <a href={mailHref} className="text-primary font-medium hover:underline">
                  {siteConfig.supportEmail}
                </a>
              </div>
            </div>
          </Card>

          <Card className="rounded-3xl border-border p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground mb-1">服务时间</h2>
                <p className="text-muted-foreground text-sm">{siteConfig.businessHours}</p>
                <p className="text-muted-foreground text-sm mt-2">
                  非工作时间可发邮件，通常会在下一个工作日优先处理支付与账号安全类问题。
                </p>
              </div>
            </div>
          </Card>

          <div className="text-center">
            <Link to="/feedback">
              <Button variant="outline" className="rounded-full border-border">
                填写意见反馈表单
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
