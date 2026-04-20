import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { motion } from "motion/react";
import { Link } from "react-router";
import { siteConfig } from "@/lib/siteConfig";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "@/lib/api";

export function TemplateSubmit() {
  const { accessToken } = useAuth();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [author, setAuthor] = useState("");
  const [scenario, setScenario] = useState("");
  const [hint, setHint] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!title.trim() || !summary.trim()) {
      setHint("请填写模板标题与正文要点。");
      return;
    }
    if (!accessToken) {
      setHint("请先登录后提交模板需求。");
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.submitCustomTemplateRequest(accessToken, {
        title: title.trim(),
        summary: summary.trim(),
        contact: author.trim(),
        scenario: scenario.trim(),
      });
      setHint("提交成功，运营会在审核后通过站内消息反馈进度。");
      setTitle("");
      setSummary("");
      setAuthor("");
      setScenario("");
    } catch (e) {
      setHint((e as Error).message || "提交失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="figma-page py-12 bg-secondary/30">
      <div className="figma-container max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-2">提交模板</h1>
          <p className="text-muted-foreground">
            采用邮件审稿：请勿在正文中包含密码或机密信息。
            <Link to="/legal/user-agreement" className="text-primary hover:underline ml-1">
              用户协议
            </Link>
          </p>
        </motion.div>

        <Card className="rounded-3xl border-border p-8 space-y-6 bg-white">
          <div className="space-y-2">
            <Label htmlFor="ts-title">模板标题</Label>
            <Input
              id="ts-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-2xl border-border bg-input-background"
              placeholder="例如：会议纪要坚持问题导向 - 提示词"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ts-author">署名 / 联系方式（可选）</Label>
            <Input
              id="ts-author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="rounded-2xl border-border bg-input-background"
              placeholder="昵称或邮箱，便于署名与致谢"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ts-scenario">适用场景（可选）</Label>
            <Input
              id="ts-scenario"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="rounded-2xl border-border bg-input-background"
              placeholder="如：电商详情页、短视频脚本、AI绘图提示词"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ts-body">模板正文</Label>
            <textarea
              id="ts-body"
              className="w-full min-h-[200px] rounded-2xl border border-border bg-input-background px-3 py-2 text-sm"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="粘贴完整可用提示词；可说明适用场景、模型与注意事项。"
            />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            运营团队会在审核后择期入库；若涉及侵权或违规内容将不予收录。侵权投诉请同样发至 {siteConfig.supportEmail} 。
          </p>
          <Button
            type="button"
            className="w-full rounded-full bg-primary hover:bg-accent"
            onClick={() => void submit()}
            disabled={submitting}
          >
            {submitting ? "提交中..." : "提交到模板审核中心"}
          </Button>
          {hint ? <p className="text-sm text-muted-foreground text-center">{hint}</p> : null}
        </Card>
      </div>
    </div>
  );
}
