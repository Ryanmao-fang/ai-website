import { useState } from "react";
import { Link } from "react-router";
import { Sparkles, BookOpen, Wrench, FileText, CheckCircle2 } from "lucide-react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { motion } from "motion/react";

export function LearningPath() {
  const [selectedLevel, setSelectedLevel] = useState<"beginner" | "intermediate" | "advanced">(
    "beginner"
  );

  const paths = {
    beginner: {
      title: "入门篇",
      subtitle: "从零开始，轻松入门AI",
      icon: "🌱",
      color: "from-emerald-500 to-teal-500",
      items: [
        {
          type: "term",
          id: 1,
          title: "什么是人工智能",
          description: "理解AI的基本概念",
          completed: true,
        },
        {
          type: "term",
          id: 2,
          title: "机器学习入门",
          description: "AI如何学习和进步",
          completed: true,
        },
        {
          type: "tool",
          id: 1,
          title: "ChatGPT使用指南",
          description: "第一个AI工具上手",
          completed: false,
        },
        {
          type: "term",
          id: 3,
          title: "Prompt是什么",
          description: "学会和AI对话",
          completed: false,
        },
        {
          type: "template",
          id: 1,
          title: "日常对话模板",
          description: "10个实用对话示例",
          completed: false,
        },
        {
          type: "tool",
          id: 2,
          title: "文心一言体验",
          description: "体验国产AI助手",
          completed: false,
        },
      ],
    },
    intermediate: {
      title: "进阶篇",
      subtitle: "深入理解，灵活应用",
      icon: "🌿",
      color: "from-teal-500 to-cyan-500",
      items: [
        {
          type: "term",
          id: 4,
          title: "大语言模型原理",
          description: "了解LLM的工作机制",
          completed: false,
        },
        {
          type: "term",
          id: 5,
          title: "Prompt Engineering",
          description: "高级提示词技巧",
          completed: false,
        },
        {
          type: "tool",
          id: 3,
          title: "Midjourney创作",
          description: "AI绘画工具实战",
          completed: false,
        },
        {
          type: "template",
          id: 2,
          title: "专业写作模板",
          description: "营销、文案、报告",
          completed: false,
        },
        {
          type: "term",
          id: 6,
          title: "向量数据库",
          description: "AI记忆的秘密",
          completed: false,
        },
        {
          type: "tool",
          id: 4,
          title: "Claude深度使用",
          description: "长文本分析专家",
          completed: false,
        },
      ],
    },
    advanced: {
      title: "高阶篇",
      subtitle: "融会贯通，自由创造",
      icon: "🌳",
      color: "from-green-500 to-emerald-600",
      items: [
        {
          type: "term",
          id: 7,
          title: "Fine-tuning实战",
          description: "定制你的AI模型",
          completed: false,
        },
        {
          type: "term",
          id: 8,
          title: "RAG技术详解",
          description: "检索增强生成",
          completed: false,
        },
        {
          type: "tool",
          id: 5,
          title: "API集成开发",
          description: "将AI集成到应用",
          completed: false,
        },
        {
          type: "template",
          id: 3,
          title: "企业级应用模板",
          description: "AI解决方案设计",
          completed: false,
        },
        {
          type: "term",
          id: 9,
          title: "多模态AI",
          description: "图文音视频理解",
          completed: false,
        },
        {
          type: "tool",
          id: 6,
          title: "Agent开发",
          description: "构建智能代理",
          completed: false,
        },
      ],
    },
  };

  const currentPath = paths[selectedLevel];

  const getItemIcon = (type: string) => {
    switch (type) {
      case "term":
        return <BookOpen className="w-5 h-5" />;
      case "tool":
        return <Wrench className="w-5 h-5" />;
      case "template":
        return <FileText className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const getItemLink = (type: string, id: number) => {
    switch (type) {
      case "term":
        return `/terms/${id}`;
      case "tool":
        return `/tools/${id}`;
      case "template":
        return `/templates`;
      default:
        return "#";
    }
  };

  return (
    <div className="min-h-screen py-12 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-semibold text-foreground mb-4">学习路线</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            循序渐进，系统掌握AI知识和技能
          </p>
        </motion.div>

        {/* Level Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {(["beginner", "intermediate", "advanced"] as const).map((level, index) => {
            const path = paths[level];
            const isSelected = selectedLevel === level;
            return (
              <motion.div
                key={level}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <Card
                  onClick={() => setSelectedLevel(level)}
                  className={`rounded-3xl p-8 cursor-pointer transition-all ${
                    isSelected
                      ? "border-primary shadow-lg scale-105"
                      : "border-border hover:shadow-md hover:scale-102"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-5xl mb-4">{path.icon}</div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{path.title}</h3>
                    <p className="text-muted-foreground mb-4">{path.subtitle}</p>
                    {isSelected && (
                      <Badge className="rounded-full bg-primary text-white border-0">
                        当前选择
                      </Badge>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Current Path Content */}
        <motion.div
          key={selectedLevel}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className={`rounded-3xl border-border p-8 bg-gradient-to-br ${currentPath.color} bg-opacity-5 mb-8`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="text-4xl">{currentPath.icon}</div>
              <div>
                <h2 className="text-2xl font-semibold text-foreground">{currentPath.title}</h2>
                <p className="text-muted-foreground">{currentPath.subtitle}</p>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            {currentPath.items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={getItemLink(item.type, item.id)}>
                  <Card
                    className={`rounded-3xl border-border p-6 hover:shadow-lg transition-all group ${
                      item.completed ? "bg-primary/5" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                            item.completed
                              ? "bg-primary text-white"
                              : "bg-muted text-muted-foreground"
                          } group-hover:scale-110 transition-transform`}
                        >
                          {item.completed ? (
                            <CheckCircle2 className="w-6 h-6" />
                          ) : (
                            getItemIcon(item.type)
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3
                            className={`font-semibold ${
                              item.completed
                                ? "text-primary"
                                : "text-foreground group-hover:text-primary"
                            } transition-colors`}
                          >
                            {item.title}
                          </h3>
                          <Badge
                            variant="secondary"
                            className="rounded-full bg-muted/50 text-muted-foreground border-0 text-xs"
                          >
                            {item.type === "term" && "名词"}
                            {item.type === "tool" && "工具"}
                            {item.type === "template" && "模板"}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{item.description}</p>
                      </div>
                      {item.completed && (
                        <Badge className="rounded-full bg-primary/10 text-primary border-0">
                          已完成
                        </Badge>
                      )}
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Progress */}
          <Card className="rounded-3xl border-border p-8 mt-8 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">学习进度</h3>
              <span className="text-muted-foreground">
                {currentPath.items.filter((item) => item.completed).length} /{" "}
                {currentPath.items.length}
              </span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                style={{
                  width: `${
                    (currentPath.items.filter((item) => item.completed).length /
                      currentPath.items.length) *
                    100
                  }%`,
                }}
              />
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
