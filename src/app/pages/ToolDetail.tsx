import { useState } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Star, ExternalLink, BookOpen, Lightbulb, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { tierMeetsMin } from "@/lib/membershipTier";
import { AccessNoticeDialog } from "../components/AccessNoticeDialog";

export function ToolDetail() {
  const { id } = useParams();
  const { membershipTier } = useAuth();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const handleFavoriteClick = () => {
    if (!tierMeetsMin(membershipTier, "standard")) {
      setUpgradeOpen(true);
    }
  };

  // Mock data - in real app, fetch based on id
  const tool = {
    id,
    name: "ChatGPT",
    icon: "💬",
    description: "OpenAI开发的强大对话AI，能回答问题、写作、编程等",
    category: "对话助手",
    rating: 4.8,
    link: "https://chat.openai.com",
    fullDescription:
      "ChatGPT是OpenAI开发的革命性对话AI工具，基于GPT大语言模型。它可以理解自然语言，进行流畅对话，并在写作、编程、分析、创意等多个领域提供帮助。无论是日常问答、内容创作，还是复杂的技术问题，ChatGPT都能提供有价值的回答。",
    useCases: [
      {
        title: "内容创作",
        description: "写文章、博客、社交媒体内容、邮件等各类文本",
        icon: "✍️",
      },
      {
        title: "学习助手",
        description: "解释概念、辅导作业、提供学习建议",
        icon: "📚",
      },
      {
        title: "编程辅助",
        description: "写代码、调试、解释代码逻辑、学习新语言",
        icon: "💻",
      },
      {
        title: "数据分析",
        description: "处理数据、生成报告、提供洞察和建议",
        icon: "📊",
      },
      {
        title: "创意灵感",
        description: "头脑风暴、创意点子、故事构思",
        icon: "💡",
      },
      {
        title: "日常助手",
        description: "解答问题、制定计划、提供建议",
        icon: "🤝",
      },
    ],
    howToUse: [
      {
        step: 1,
        title: "注册账号",
        content: "访问 chat.openai.com，使用邮箱或Google账号注册",
      },
      {
        step: 2,
        title: "开始对话",
        content: "在对话框中输入你的问题或需求，尽量描述清晰",
      },
      {
        step: 3,
        title: "优化提示词",
        content: "如果回答不够理想，可以补充更多上下文或重新提问",
      },
      {
        step: 4,
        title: "持续对话",
        content: "ChatGPT会记住对话历史，你可以基于之前的内容继续讨论",
      },
    ],
    relatedTools: [
      { id: 3, name: "Claude", icon: "🤖", category: "对话助手" },
      { id: 4, name: "Notion AI", icon: "📝", category: "办公效率" },
      { id: 6, name: "GitHub Copilot", icon: "👨‍💻", category: "编程开发" },
    ],
    tags: ["对话", "写作", "编程", "学习", "创作"],
  };

  return (
    <>
      <AccessNoticeDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        variant="upgrade"
        onRequestLogin={() => setUpgradeOpen(false)}
      />
    <div className="min-h-screen py-12 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link to="/tools">
            <Button variant="ghost" className="rounded-full -ml-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回列表
            </Button>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="rounded-3xl border-border p-8 bg-white">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-5xl flex-shrink-0">
                {tool.icon}
              </div>
              <div className="flex-1">
                <Badge className="rounded-full bg-primary/10 text-primary border-0 mb-3">
                  {tool.category}
                </Badge>
                <h1 className="text-3xl font-semibold text-foreground mb-3">{tool.name}</h1>
                <p className="text-muted-foreground leading-relaxed mb-4">{tool.description}</p>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    <span className="font-medium text-foreground">{tool.rating}</span>
                    <span className="text-muted-foreground text-sm">评分</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <a href={tool.link} target="_blank" rel="noopener noreferrer">
                    <Button className="rounded-full bg-primary hover:bg-accent">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      访问官网
                    </Button>
                  </a>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full border-border"
                    onClick={handleFavoriteClick}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    收藏
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Full Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="rounded-3xl border-border p-8 bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">工具介绍</h2>
            </div>
            <p className="text-foreground leading-relaxed">{tool.fullDescription}</p>
          </Card>
        </motion.div>

        {/* Use Cases */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold text-foreground mb-6">使用场景</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tool.useCases.map((useCase, index) => (
              <Card
                key={index}
                className="rounded-3xl border-border p-6 bg-white hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-3">{useCase.icon}</div>
                <h3 className="font-semibold text-foreground mb-2">{useCase.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{useCase.description}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* How to Use */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold text-foreground mb-6">使用步骤</h2>
          <Card className="rounded-3xl border-border p-8 bg-white">
            <div className="space-y-6">
              {tool.howToUse.map((step) => (
                <div key={step.step} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {step.step}
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Related Tools */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-foreground mb-6">推荐工具</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {tool.relatedTools.map((relatedTool) => (
              <Link key={relatedTool.id} to={`/tools/${relatedTool.id}`}>
                <Card className="rounded-3xl border-border p-6 bg-white hover:shadow-md transition-all group">
                  <div className="text-3xl mb-3">{relatedTool.icon}</div>
                  <Badge className="rounded-full bg-accent/20 text-accent-foreground border-0 mb-3">
                    {relatedTool.category}
                  </Badge>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {relatedTool.name}
                  </h3>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
}
