import { useState } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Heart, Share2, BookOpen, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { tierMeetsMin } from "@/lib/membershipTier";
import { AccessNoticeDialog } from "../components/AccessNoticeDialog";

export function TermDetail() {
  const { id } = useParams();
  const { membershipTier } = useAuth();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const handleFavoriteClick = () => {
    if (!tierMeetsMin(membershipTier, "standard")) {
      setUpgradeOpen(true);
      return;
    }
  };

  // Mock data - in real app, fetch based on id
  const term = {
    id,
    name: "大语言模型 (LLM)",
    category: "基础概念",
    description: "Large Language Model，一种基于深度学习的自然语言处理模型",
    simpleExplanation:
      "想象一下，大语言模型就像一个读过海量书籍的超级学霸。它通过学习互联网上数以亿计的文本，掌握了语言的规律和知识。当你向它提问时，它能理解你的意思，并用自然的语言回答你。就像ChatGPT、Claude这些AI助手，背后都是大语言模型在工作。",
    examples: [
      {
        title: "日常对话",
        content: "你可以像和朋友聊天一样，问它任何问题，从天气到哲学，它都能给出合理的回答。",
      },
      {
        title: "写作助手",
        content: "帮你写邮件、报告、文章，甚至是诗歌和故事。只需要告诉它你的需求，它就能帮你完成。",
      },
      {
        title: "代码编程",
        content: "描述你想要实现的功能，它能帮你写代码，甚至解释代码的原理。",
      },
      {
        title: "知识问答",
        content: "遇到不懂的概念？问它！它会用简单易懂的方式解释给你听。",
      },
    ],
    relatedTerms: [
      { id: 2, name: "神经网络", category: "技术原理" },
      { id: 3, name: "Prompt Engineering", category: "实用技能" },
      { id: 6, name: "自然语言处理", category: "应用场景" },
    ],
    likes: 1234,
    isLiked: false,
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
          <Link to="/terms">
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
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <Badge className="rounded-full bg-primary/10 text-primary border-0 mb-4">
                {term.category}
              </Badge>
              <h1 className="text-4xl font-semibold text-foreground mb-4">{term.name}</h1>
              <p className="text-lg text-muted-foreground">{term.description}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              className="rounded-full bg-primary hover:bg-accent"
              onClick={handleFavoriteClick}
            >
              <Heart className="w-4 h-4 mr-2" />
              收藏 ({term.likes})
            </Button>
            <Button variant="outline" className="rounded-full border-border">
              <Share2 className="w-4 h-4 mr-2" />
              分享
            </Button>
          </div>
        </motion.div>

        {/* Simple Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="rounded-3xl border-border p-8 mb-8 bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">简单解释</h2>
            </div>
            <p className="text-foreground leading-relaxed text-lg">{term.simpleExplanation}</p>
          </Card>
        </motion.div>

        {/* Examples */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold text-foreground mb-6">举例说明</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {term.examples.map((example, index) => (
              <Card
                key={index}
                className="rounded-3xl border-border p-6 bg-white hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{example.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{example.content}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Related Terms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-semibold text-foreground mb-6">延伸阅读</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {term.relatedTerms.map((relatedTerm) => (
              <Link key={relatedTerm.id} to={`/terms/${relatedTerm.id}`}>
                <Card className="rounded-3xl border-border p-6 bg-white hover:shadow-md transition-all group">
                  <Badge className="rounded-full bg-accent/20 text-accent-foreground border-0 mb-3">
                    {relatedTerm.category}
                  </Badge>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {relatedTerm.name}
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
