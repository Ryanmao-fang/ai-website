import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { motion } from "motion/react";
import { siteConfig } from "@/lib/siteConfig";

export function Feedback() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [hint, setHint] = useState("");

  const submit = () => {
    if (!body.trim()) {
      setHint("请先描述您遇到的问题或建议。");
      return;
    }
    const line =
      subject.trim() ||
      `用户反馈 ${new Date().toLocaleString("zh-CN", { hour12: false })}`;
    const href = `mailto:${siteConfig.supportEmail}?subject=${encodeURIComponent(
      line
    )}&body=${encodeURIComponent(body.trim())}`;
    setHint("已打开邮件客户端。若未自动跳转，请手动复制正文发送至客服邮箱。");
    window.location.href = href;
  };

  return (
    <div className="figma-page">
      <section className="relative overflow-hidden py-16 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent" />
        <div className="figma-container relative text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-5xl font-semibold text-foreground mb-4">意见反馈</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              您的每一条反馈都会进入客服邮箱。若涉及账号安全，请勿在明文中发送密码。
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20 bg-white">
        <div className="figma-container max-w-xl">
          <Card className="rounded-3xl border-border p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fb-subject">主题（可选）</Label>
              <Input
                id="fb-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="rounded-2xl border-border bg-input-background"
                placeholder="例如：名词页建议、支付失败…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fb-body">详细描述</Label>
              <textarea
                id="fb-body"
                className="w-full min-h-[160px] rounded-2xl border border-border bg-input-background px-3 py-2 text-sm"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="请描述复现步骤、期望行为、浏览器与大致时间，便于我们排查。"
              />
            </div>
            <Button type="button" className="w-full rounded-full bg-primary hover:bg-accent" onClick={submit}>
              通过邮件发送反馈
            </Button>
            {hint ? <p className="text-sm text-muted-foreground text-center">{hint}</p> : null}
            <p className="text-xs text-muted-foreground text-center">
              收件邮箱：{siteConfig.supportEmail}
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
