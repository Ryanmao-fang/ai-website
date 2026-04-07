import { useState } from "react";
import { Link } from "react-router";
import { Search, Heart } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "@/lib/api";
import { tierMeetsMin } from "@/lib/membershipTier";
import { AccessNoticeDialog } from "../components/AccessNoticeDialog";

export function TermsList() {
  const { accessToken, membershipTier } = useAuth();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const categories = ["全部", "基础概念", "技术原理", "应用场景", "实用技能"];

  const terms = [
    {
      id: 1,
      name: "大语言模型 (LLM)",
      description: "能够理解和生成人类语言的AI模型，通过海量文本数据训练而成",
      category: "基础概念",
      likes: 1234,
      isLiked: false,
    },
    {
      id: 2,
      name: "神经网络",
      description: "模仿人脑神经元结构的计算模型，是深度学习的基础",
      category: "技术原理",
      likes: 982,
      isLiked: true,
    },
    {
      id: 3,
      name: "Prompt Engineering",
      description: "设计和优化提示词的技术，让AI更准确理解你的需求",
      category: "实用技能",
      likes: 2145,
      isLiked: false,
    },
    {
      id: 4,
      name: "机器学习",
      description: "让计算机通过数据学习和改进的技术",
      category: "基础概念",
      likes: 1567,
      isLiked: false,
    },
    {
      id: 5,
      name: "深度学习",
      description: "使用多层神经网络进行学习的机器学习方法",
      category: "技术原理",
      likes: 1423,
      isLiked: true,
    },
    {
      id: 6,
      name: "自然语言处理",
      description: "让计算机理解、解释和生成人类语言的技术",
      category: "应用场景",
      likes: 1189,
      isLiked: false,
    },
    {
      id: 7,
      name: "计算机视觉",
      description: "让计算机像人类一样理解和处理图像和视频",
      category: "应用场景",
      likes: 1056,
      isLiked: false,
    },
    {
      id: 8,
      name: "强化学习",
      description: "通过试错和奖励机制让AI学习最优策略",
      category: "技术原理",
      likes: 876,
      isLiked: false,
    },
    {
      id: 9,
      name: "Fine-tuning",
      description: "在预训练模型基础上针对特定任务进行微调",
      category: "实用技能",
      likes: 1734,
      isLiked: true,
    },
    {
      id: 10,
      name: "Token",
      description: "AI处理文本的基本单位，可以是一个字、词或符号",
      category: "基础概念",
      likes: 923,
      isLiked: false,
    },
    {
      id: 11,
      name: "RAG检索增强生成",
      description: "结合外部知识库提升AI回答准确性的技术",
      category: "技术原理",
      likes: 1645,
      isLiked: false,
    },
    {
      id: 12,
      name: "Few-shot Learning",
      description: "仅用少量样本就能让AI学习新任务的方法",
      category: "实用技能",
      likes: 1112,
      isLiked: false,
    },
  ];

  const filteredTerms = terms.filter((term) => {
    const matchesSearch = term.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "全部" || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = async (termId: number) => {
    if (!accessToken) {
      return;
    }
    if (!tierMeetsMin(membershipTier, "standard")) {
      setUpgradeOpen(true);
      return;
    }
    try {
      await apiClient.toggleFavorite(accessToken, { targetType: "term", targetId: String(termId) });
      setFavoriteIds((prev) => {
        const id = String(termId);
        if (prev.includes(id)) {
          return prev.filter((item) => item !== id);
        }
        return [...prev, id];
      });
    } catch (error) {
      alert((error as Error).message || "收藏失败");
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-semibold text-foreground mb-4">AI名词库</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            用最简单的语言，理解AI的每个概念
          </p>
        </motion.div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="搜索AI名词..."
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
          找到 {filteredTerms.length} 个相关名词
        </div>

        {/* Terms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTerms.map((term, index) => (
            <motion.div
              key={term.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="rounded-3xl border-border hover:shadow-lg transition-all p-6 bg-white group">
                <div className="flex justify-between items-start mb-4">
                  <Badge
                    variant="secondary"
                    className="rounded-full bg-primary/10 text-primary border-0"
                  >
                    {term.category}
                  </Badge>
                  <button
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    onClick={() => toggleFavorite(term.id)}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        term.isLiked || favoriteIds.includes(String(term.id)) ? "fill-destructive text-destructive" : ""
                      }`}
                    />
                  </button>
                </div>
                <Link to={`/terms/${term.id}`}>
                  <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {term.name}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                    {term.description}
                  </p>
                </Link>
                <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {term.likes}
                  </span>
                  <Link to={`/terms/${term.id}`}>
                    <Button variant="ghost" size="sm" className="rounded-full text-primary">
                      查看详情 →
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
