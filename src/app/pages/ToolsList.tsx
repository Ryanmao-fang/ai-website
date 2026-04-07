import { useState } from "react";
import { Link } from "react-router";
import { Search, Star, ExternalLink } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { motion } from "motion/react";

export function ToolsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");

  const categories = ["全部", "对话助手", "图像生成", "视频创作", "写作辅助", "编程开发", "办公效率"];

  const tools = [
    {
      id: 1,
      name: "ChatGPT",
      description: "OpenAI开发的强大对话AI，能回答问题、写作、编程等",
      icon: "💬",
      category: "对话助手",
      tags: ["对话", "写作", "编程"],
      rating: 4.8,
      link: "https://chat.openai.com",
    },
    {
      id: 2,
      name: "Midjourney",
      description: "顶级AI绘画工具，输入文字即可生成精美艺术作品",
      icon: "🎨",
      category: "图像生成",
      tags: ["图像", "设计", "创作"],
      rating: 4.9,
      link: "https://midjourney.com",
    },
    {
      id: 3,
      name: "Claude",
      description: "Anthropic的AI助手，擅长长文本分析和对话",
      icon: "🤖",
      category: "对话助手",
      tags: ["分析", "写作", "翻译"],
      rating: 4.7,
      link: "https://claude.ai",
    },
    {
      id: 4,
      name: "Notion AI",
      description: "集成在Notion中的AI助手，提升笔记和协作效率",
      icon: "📝",
      category: "办公效率",
      tags: ["笔记", "协作", "总结"],
      rating: 4.6,
      link: "https://notion.so",
    },
    {
      id: 5,
      name: "Stable Diffusion",
      description: "开源的AI绘画模型，可本地部署和自定义",
      icon: "🖼️",
      category: "图像生成",
      tags: ["开源", "图像", "定制"],
      rating: 4.5,
      link: "https://stability.ai",
    },
    {
      id: 6,
      name: "GitHub Copilot",
      description: "AI编程助手，在你写代码时提供智能建议",
      icon: "👨‍💻",
      category: "编程开发",
      tags: ["编程", "代码", "自动补全"],
      rating: 4.7,
      link: "https://github.com/copilot",
    },
    {
      id: 7,
      name: "Runway",
      description: "AI视频创作平台，轻松制作专业级视频内容",
      icon: "🎬",
      category: "视频创作",
      tags: ["视频", "剪辑", "特效"],
      rating: 4.6,
      link: "https://runwayml.com",
    },
    {
      id: 8,
      name: "Jasper",
      description: "营销文案AI写作工具，快速生成高质量内容",
      icon: "✍️",
      category: "写作辅助",
      tags: ["营销", "文案", "SEO"],
      rating: 4.5,
      link: "https://jasper.ai",
    },
    {
      id: 9,
      name: "DALL·E 3",
      description: "OpenAI的图像生成模型，创造力和准确度兼具",
      icon: "🌈",
      category: "图像生成",
      tags: ["图像", "创意", "精准"],
      rating: 4.8,
      link: "https://openai.com/dall-e-3",
    },
  ];

  const filteredTools = tools.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "全部" || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen py-12 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-semibold text-foreground mb-4">AI工具库</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            发现最好用的AI工具，让工作和创作更高效
          </p>
        </motion.div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="搜索AI工具..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 rounded-full border-border bg-white shadow-sm"
            />
          </div>

          {/* Category Filter */}
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

        {/* Results Count */}
        <div className="mb-6 text-center text-muted-foreground">
          找到 {filteredTools.length} 个相关工具
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="rounded-3xl border-border hover:shadow-lg transition-all p-6 bg-white group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                    {tool.icon}
                  </div>
                  <a
                    href={tool.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>

                <Link to={`/tools/${tool.id}`}>
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                    {tool.description}
                  </p>
                </Link>

                <div className="flex items-center gap-1 mb-4">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium text-foreground">{tool.rating}</span>
                  <span className="text-sm text-muted-foreground ml-1">· {tool.category}</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
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

                <Link to={`/tools/${tool.id}`}>
                  <Button variant="outline" className="w-full rounded-full border-border">
                    查看详情
                  </Button>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
