import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import { Copy, Check, Star, Search, Lock } from "lucide-react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { AccessNoticeDialog } from "../components/AccessNoticeDialog";
import {
  templateCategories,
  templatesCatalog,
} from "@/content/templatesCatalog";
import { publicContentApi } from "@/lib/publicContentApi";
import { apiClient } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { trackEventSafe } from "@/lib/telemetry";

type TemplateTier = "free" | "standard" | "pro";
type ViewTemplate = {
  id: number;
  title: string;
  scenario: string;
  category: string;
  tags: string[];
  template: string;
  tier: TemplateTier;
};

export function Templates() {
  const { membershipTier, accessToken, userId } = useAuth();
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [copyHint, setCopyHint] = useState("");
  const [cmsTemplates, setCmsTemplates] = useState<ViewTemplate[] | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackTemplate, setFeedbackTemplate] = useState<ViewTemplate | null>(null);
  const [feedbackScore, setFeedbackScore] = useState(4);
  const [feedbackEffective, setFeedbackEffective] = useState(true);
  const [feedbackModel, setFeedbackModel] = useState("");
  const [feedbackIssueTags, setFeedbackIssueTags] = useState("");
  const [feedbackSummary, setFeedbackSummary] = useState("");
  const [feedbackHint, setFeedbackHint] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const location = useLocation();

  const categories = templateCategories;
  const localTemplates = useMemo<ViewTemplate[]>(
    () =>
      templatesCatalog.map((item) => ({
        id: item.id,
        title: item.title,
        scenario: item.scenario,
        category: item.category,
        tags: item.tags,
        template: item.template,
        tier: item.id >= 9000 ? "pro" : "standard",
      })),
    []
  );

  const templates = useMemo(() => {
    if (cmsTemplates && cmsTemplates.length > 0) {
      return cmsTemplates;
    }
    return localTemplates;
  }, [cmsTemplates, localTemplates]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await publicContentApi.listTemplates();
        if (cancelled || rows.length <= 0) {
          return;
        }
        const mapped = rows
          .map((row) => {
            const markdown = String(row.content_markdown || "").trim();
            const jsonTemplate =
              row.content_json && "object" === typeof row.content_json
                ? String((row.content_json as any).template || "").trim()
                : "";
            const body = markdown || jsonTemplate;
            if (!body) {
              return null;
            }
            const tierRaw = String(row.min_tier || "standard").toLowerCase();
            const tier: TemplateTier =
              "pro" === tierRaw ? "pro" : "free" === tierRaw ? "free" : "standard";
            return {
              id: Number(row.id || 0),
              title: row.title,
              scenario: row.scenario,
              category: row.category,
              tags: Array.isArray(row.tags) ? row.tags : [],
              template: body,
              tier,
            } as ViewTemplate;
          })
          .filter(Boolean) as ViewTemplate[];
        if (!cancelled && mapped.length > 0) {
          setCmsTemplates(mapped);
        }
      } catch {
        if (!cancelled) {
          setCmsTemplates(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (!hash.startsWith("t-")) {
      return;
    }
    const id = hash.slice(2);
    const el = document.getElementById(`template-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.scenario.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "全部" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = async (id: number, text: string) => {
    const current = templates.find((t) => t.id === id);
    if (current && "pro" === current.tier && "pro" !== membershipTier) {
      setUpgradeOpen(true);
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setCopyHint("");
      setTimeout(() => setCopiedId(null), 2000);
      if (current) {
        setFeedbackTemplate(current);
      }
    } catch {
      setCopyHint("复制被拒绝：请在浏览器设置中允许剪贴板权限，或手动选择文本复制。");
      setTimeout(() => setCopyHint(""), 4000);
    }
  };

  const submitTemplateFeedback = async () => {
    if (!accessToken || !feedbackTemplate) {
      setFeedbackHint("请先登录后提交模板反馈。");
      return;
    }
    if (!feedbackSummary.trim()) {
      setFeedbackHint("请填写结果描述，便于优化模板质量。");
      return;
    }
    setFeedbackSubmitting(true);
    setFeedbackHint("");
    try {
      await apiClient.submitTemplateFeedback(accessToken, {
        templateId: feedbackTemplate.id,
        templateTitle: feedbackTemplate.title,
        usedModel: feedbackModel.trim(),
        score: feedbackScore,
        effective: feedbackEffective,
        outcomeSummary: feedbackSummary.trim(),
        issueTags: feedbackIssueTags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 8),
      });
      await trackEventSafe({
        eventName: "template_feedback_submit",
        userId,
        payload: {
          templateId: feedbackTemplate.id,
          score: feedbackScore,
          effective: feedbackEffective,
        },
      });
      setFeedbackHint("感谢反馈，已进入模板质量改进队列。");
      setTimeout(() => {
        setFeedbackOpen(false);
      }, 800);
    } catch (e) {
      setFeedbackHint((e as Error)?.message || "提交失败，请稍后重试");
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  return (
    <>
      <AccessNoticeDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        variant="upgrade"
        onRequestLogin={() => setUpgradeOpen(false)}
      />
      <div className="figma-page py-12 bg-secondary/30">
        <div className="figma-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-semibold text-foreground mb-4">模板库</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              精心整理的提示词模板，复制即用，快速上手
            </p>
          </motion.div>

          {copyHint ? (
            <p className="text-center text-sm text-amber-700 mb-4 max-w-2xl mx-auto">{copyHint}</p>
          ) : null}

          <div className="mb-8 space-y-4">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="搜索模板..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 rounded-full border-border bg-white shadow-sm"
              />
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full ${
                    selectedCategory === category
                      ? "bg-primary hover:bg-accent"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <div className="mb-6 text-center text-muted-foreground">
            找到 {filteredTemplates.length} 个相关模板
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTemplates.map((template, index) => {
              const tier = template.tier;
              const lockedPro = "pro" === tier && "pro" !== membershipTier;

              return (
                <motion.div
                  key={template.id}
                  id={`template-${template.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="relative scroll-mt-24"
                >
                  <Card
                    className={`rounded-3xl border-border hover:shadow-lg transition-all p-6 bg-white ${
                      lockedPro ? "opacity-90" : ""
                    }`}
                  >
                    {lockedPro ? (
                      <div className="absolute inset-0 z-10 rounded-3xl bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 p-6">
                        <Lock className="w-8 h-8 text-primary" />
                        <p className="text-sm text-muted-foreground text-center">
                          企业级模板库 · 专业会员专享
                        </p>
                        <Button
                          type="button"
                          className="rounded-full bg-primary hover:bg-accent"
                          onClick={() => setUpgradeOpen(true)}
                        >
                          升级解锁
                        </Button>
                        <Link to="/membership" className="text-xs text-primary hover:underline">
                          了解专业会员
                        </Link>
                      </div>
                    ) : null}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge
                            variant="secondary"
                            className="rounded-full bg-primary/10 text-primary border-0"
                          >
                            {template.category}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className={`rounded-full border-0 ${
                              "pro" === tier
                                ? "bg-amber-500/15 text-amber-800"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {"pro" === tier ? "企业级" : "高级模板"}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">{template.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{template.scenario}</p>
                        <p className="text-xs text-muted-foreground">
                          版权与引用：模板仅供个人学习与非侵权合规场景；商业发布前请自行评估风险。
                        </p>
                      </div>
                    </div>

                    <div className="bg-muted/30 rounded-2xl p-4 mb-4 max-h-48 overflow-y-auto">
                      <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed">
                        {template.template}
                      </pre>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {template.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="rounded-full bg-muted text-muted-foreground border-0 text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        type="button"
                        onClick={() => void handleCopy(template.id, template.template)}
                        className="rounded-full bg-primary hover:bg-accent ml-4"
                        size="sm"
                        disabled={lockedPro}
                      >
                        {copiedId === template.id ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            已复制
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            复制
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-full ml-2"
                        disabled={lockedPro}
                        onClick={() => {
                          setFeedbackTemplate(template);
                          setFeedbackSummary("");
                          setFeedbackIssueTags("");
                          setFeedbackHint("");
                          setFeedbackOpen(true);
                        }}
                      >
                        使用反馈
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <Card className="rounded-3xl border-border p-12 bg-gradient-to-br from-primary/5 to-accent/5">
              <Star className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-3">有更好的模板？</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
                欢迎分享你的创意模板，帮助更多人高效使用AI
              </p>
              <Link to="/templates/submit">
                <Button className="rounded-full bg-primary hover:bg-accent px-8">提交模板</Button>
              </Link>
            </Card>
          </motion.div>
        </div>
      </div>
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle>模板使用反馈</DialogTitle>
            <DialogDescription>
              帮助我们判断模板是否真正可交付，避免“只可复制不可落地”。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              模板：{feedbackTemplate?.title || "-"}
            </div>
            <div className="space-y-2">
              <Label>评分（1-5）</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Button
                    key={n}
                    type="button"
                    variant={feedbackScore === n ? "default" : "outline"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => setFeedbackScore(n)}
                  >
                    {n}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>结果是否达到预期</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={feedbackEffective ? "default" : "outline"}
                  size="sm"
                  className="rounded-full"
                  onClick={() => setFeedbackEffective(true)}
                >
                  有效
                </Button>
                <Button
                  type="button"
                  variant={!feedbackEffective ? "default" : "outline"}
                  size="sm"
                  className="rounded-full"
                  onClick={() => setFeedbackEffective(false)}
                >
                  无效
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback-model">使用模型（可选）</Label>
              <Input
                id="feedback-model"
                value={feedbackModel}
                onChange={(e) => setFeedbackModel(e.target.value)}
                placeholder="如：GPT-4.1 / Claude 3.7 / 通义千问"
                className="rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback-tags">问题标签（可选）</Label>
              <Input
                id="feedback-tags"
                value={feedbackIssueTags}
                onChange={(e) => setFeedbackIssueTags(e.target.value)}
                placeholder="逗号分隔，如：幻觉,指令不稳,格式错乱"
                className="rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback-summary">结果描述</Label>
              <textarea
                id="feedback-summary"
                className="w-full min-h-[120px] rounded-2xl border border-border bg-input-background px-3 py-2 text-sm"
                value={feedbackSummary}
                onChange={(e) => setFeedbackSummary(e.target.value)}
                placeholder="简要描述输入内容、输出效果、是否可直接商用。"
              />
            </div>
            {feedbackHint ? <p className="text-xs text-muted-foreground">{feedbackHint}</p> : null}
            <Button
              type="button"
              className="w-full rounded-full bg-primary hover:bg-accent"
              onClick={() => void submitTemplateFeedback()}
              disabled={feedbackSubmitting}
            >
              {feedbackSubmitting ? "提交中..." : "提交反馈"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
