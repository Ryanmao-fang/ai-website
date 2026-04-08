import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Copy, Check, Star, Search, Lock } from "lucide-react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { AccessNoticeDialog } from "../components/AccessNoticeDialog";
import {
  templateCategories,
  templatesCatalog,
  templateTierForId,
} from "@/content/templatesCatalog";

export function Templates() {
  const { membershipTier } = useAuth();
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [copyHint, setCopyHint] = useState("");
  const location = useLocation();

  const categories = templateCategories;
  const templates = templatesCatalog;

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
    if ("pro" === templateTierForId(id) && "pro" !== membershipTier) {
      setUpgradeOpen(true);
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setCopyHint("");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setCopyHint("复制被拒绝：请在浏览器设置中允许剪贴板权限，或手动选择文本复制。");
      setTimeout(() => setCopyHint(""), 4000);
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
      <div className="min-h-screen py-12 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              const tier = templateTierForId(template.id);
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
    </>
  );
}
