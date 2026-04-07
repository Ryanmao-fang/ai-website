import { Link } from "react-router";
import { Search, ArrowRight, Sparkles, BookOpen, Wrench, TrendingUp, Star } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { motion } from "motion/react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function Home() {
  const featuredTerms = [
    {
      id: 1,
      name: "大语言模型 (LLM)",
      description: "能够理解和生成人类语言的AI模型",
      category: "基础概念",
      image: "https://images.unsplash.com/photo-1719550371336-7bb64b5cacfa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFpbiUyMG5ldXJhbCUyMG5ldHdvcmslMjBkaWdpdGFsfGVufDF8fHx8MTc3NTU0OTA3OXww&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      id: 2,
      name: "神经网络",
      description: "模仿人脑结构的计算模型",
      category: "技术原理",
      image: "https://images.unsplash.com/photo-1775185172785-4bbd6b0fc8f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwYWJzdHJhY3QlMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc3NTQ3OTY0Mnww&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      id: 3,
      name: "Prompt Engineering",
      description: "与AI对话的艺术与技巧",
      category: "实用技能",
      image: "https://images.unsplash.com/photo-1762330467572-5199bc772a20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmFsJTIwbGFuZ3VhZ2UlMjBwcm9jZXNzaW5nJTIwdGV4dHxlbnwxfHx8fDE3NzU0NjEwNDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    },
  ];

  const featuredTools = [
    {
      id: 1,
      name: "ChatGPT",
      description: "OpenAI的对话式AI助手",
      tags: ["对话", "写作", "编程"],
      icon: "💬",
    },
    {
      id: 2,
      name: "Midjourney",
      description: "文字生成精美图片",
      tags: ["图像", "设计", "创作"],
      icon: "🎨",
    },
    {
      id: 3,
      name: "Claude",
      description: "Anthropic的智能助手",
      tags: ["分析", "写作", "翻译"],
      icon: "🤖",
    },
    {
      id: 4,
      name: "Notion AI",
      description: "智能笔记与写作助手",
      tags: ["笔记", "协作", "总结"],
      icon: "📝",
    },
  ];

  const learningPaths = [
    { level: "入门", items: 12, icon: "🌱", color: "bg-emerald-100 text-emerald-700" },
    { level: "进阶", items: 18, icon: "🌿", color: "bg-teal-100 text-teal-700" },
    { level: "高阶", items: 24, icon: "🌳", color: "bg-green-100 text-green-700" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">让AI学习变得简单愉快</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold text-foreground mb-6 leading-tight">
              探索AI世界
              <br />
              <span className="text-primary">从这里开始</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              最温暖的AI学习社区，用简单的语言解释AI概念，
              <br className="hidden sm:block" />
              发现最好用的AI工具，规划清晰的学习路线
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="搜索AI名词、工具..."
                  className="pl-12 h-14 rounded-full border-border bg-white shadow-sm"
                />
              </div>
              <Button className="rounded-full h-14 px-8 bg-primary hover:bg-accent shadow-sm">
                开始探索
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Terms */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-semibold text-foreground mb-2">热门名词</h2>
              <p className="text-muted-foreground">从基础概念开始，轻松入门AI</p>
            </div>
            <Link to="/terms">
              <Button variant="ghost" className="rounded-full">
                查看全部
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredTerms.map((term, index) => (
              <motion.div
                key={term.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link to={`/terms/${term.id}`}>
                  <Card className="overflow-hidden rounded-3xl border-border hover:shadow-lg transition-all group cursor-pointer">
                    <div className="relative h-48 overflow-hidden">
                      <ImageWithFallback
                        src={term.image}
                        alt={term.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <Badge className="absolute top-4 left-4 rounded-full bg-white/90 text-foreground border-0">
                        {term.category}
                      </Badge>
                    </div>
                    <div className="p-6">
                      <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {term.name}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">{term.description}</p>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      <section className="py-16 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-semibold text-foreground mb-2">精选工具</h2>
              <p className="text-muted-foreground">发现最好用的AI工具，提升工作效率</p>
            </div>
            <Link to="/tools">
              <Button variant="ghost" className="rounded-full">
                查看全部
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredTools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link to={`/tools/${tool.id}`}>
                  <Card className="rounded-3xl border-border hover:shadow-lg transition-all group cursor-pointer p-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                      {tool.icon}
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {tool.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {tool.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="rounded-full bg-muted text-muted-foreground border-0"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Path */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-foreground mb-2">学习路线</h2>
            <p className="text-muted-foreground">循序渐进，系统掌握AI知识</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {learningPaths.map((path, index) => (
              <motion.div
                key={path.level}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="rounded-3xl border-border hover:shadow-lg transition-all p-8 text-center group cursor-pointer">
                  <div className="text-5xl mb-4">{path.icon}</div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{path.level}</h3>
                  <p className="text-muted-foreground mb-4">{path.items} 个学习内容</p>
                  <Badge className={`rounded-full ${path.color} border-0`}>
                    {path.level === "入门" && "从零开始"}
                    {path.level === "进阶" && "深入理解"}
                    {path.level === "高阶" && "融会贯通"}
                  </Badge>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/learning-path">
              <Button className="rounded-full bg-primary hover:bg-accent px-8 h-12">
                <TrendingUp className="w-5 h-5 mr-2" />
                查看完整学习路线
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Templates CTA */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Star className="w-4 h-4" />
              <span className="text-sm">精心整理</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
              实用模板库
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
              从提示词模板到工作流程，帮你快速上手各类AI工具
            </p>
            <Link to="/templates">
              <Button className="rounded-full bg-primary hover:bg-accent px-8 h-14 text-lg">
                <BookOpen className="w-5 h-5 mr-2" />
                浏览模板库
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
