import { useState } from "react";
import { Copy, Check, Star, Search } from "lucide-react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { motion } from "motion/react";

export function Templates() {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");

  const categories = ["全部", "日常对话", "写作创作", "编程开发", "数据分析", "学习教育", "营销推广"];

  const templates = [
    {
      id: 1,
      title: "角色扮演对话",
      category: "日常对话",
      scenario: "让AI扮演特定角色进行对话",
      template:
        "你是一位经验丰富的[职业/角色]，请用[语气/风格]的方式帮我[具体需求]。\n\n例如：你是一位经验丰富的产品经理，请用专业且易懂的方式帮我分析这个功能的可行性。",
      tags: ["角色", "对话", "情境"],
    },
    {
      id: 2,
      title: "文章大纲生成",
      category: "写作创作",
      scenario: "快速生成文章结构和要点",
      template:
        "请为主题「[文章主题]」生成一个详细的文章大纲。\n\n目标读者：[读者群体]\n文章风格：[正式/轻松/学术等]\n字数要求：约[字数]字\n\n请包含：\n- 引人入胜的标题\n- 3-5个主要章节\n- 每个章节的关键要点",
      tags: ["写作", "大纲", "结构"],
    },
    {
      id: 3,
      title: "代码调试助手",
      category: "编程开发",
      scenario: "帮助定位和修复代码问题",
      template:
        "我的代码遇到了以下问题：\n\n```[编程语言]\n[粘贴代码]\n```\n\n错误信息：[错误提示]\n\n期望行为：[描述预期结果]\n实际行为：[描述实际情况]\n\n请帮我：\n1. 找出问题所在\n2. 解释为什么会出现这个问题\n3. 提供修复方案",
      tags: ["编程", "调试", "修复"],
    },
    {
      id: 4,
      title: "数据可视化建议",
      category: "数据分析",
      scenario: "选择合适的图表展示数据",
      template:
        "我有以下数据需要可视化：\n\n数据类型：[描述数据]\n数据量：[样本数量]\n展示目的：[想要传达的信息]\n\n请推荐：\n1. 最适合的图表类型\n2. 为什么选择这种图表\n3. 需要注意的设计要点",
      tags: ["数据", "可视化", "图表"],
    },
    {
      id: 5,
      title: "概念学习框架",
      category: "学习教育",
      scenario: "系统学习新概念或知识",
      template:
        "我想学习：[概念/主题]\n\n我的背景：[相关背景知识]\n学习目标：[想要达到的水平]\n\n请帮我：\n1. 用简单的语言解释这个概念\n2. 提供3个生活中的类比或例子\n3. 列出相关的延伸知识\n4. 给出学习建议和资源",
      tags: ["学习", "概念", "教育"],
    },
    {
      id: 6,
      title: "社交媒体文案",
      category: "营销推广",
      scenario: "创作吸引人的社交媒体内容",
      template:
        "为[产品/服务/活动]创作社交媒体文案：\n\n平台：[微博/微信/小红书/抖音等]\n目标受众：[描述目标用户]\n核心卖点：[1-3个关键点]\n风格：[活泼/专业/温馨等]\n\n请生成：\n- 3个版本的文案\n- 合适的话题标签\n- 互动引导语",
      tags: ["营销", "文案", "社交"],
    },
    {
      id: 7,
      title: "邮件撰写助手",
      category: "写作创作",
      scenario: "撰写各类专业邮件",
      template:
        "帮我写一封[类型]邮件：\n\n收件人：[对方身份/关系]\n目的：[邮件目的]\n关键信息：[需要传达的要点]\n语气：[正式/友好/急迫等]\n\n请确保邮件：\n- 简洁明了\n- 礼貌得体\n- 行动号召清晰",
      tags: ["邮件", "商务", "沟通"],
    },
    {
      id: 8,
      title: "头脑风暴引导",
      category: "日常对话",
      scenario: "激发创意和新想法",
      template:
        "我需要为[项目/问题]进行头脑风暴：\n\n背景情况：[描述背景]\n目标：[期望达成的目标]\n限制条件：[时间/预算/资源等]\n\n请通过以下方式引导：\n1. 提出10个初步想法\n2. 对每个想法进行优缺点分析\n3. 推荐最有潜力的3个方向",
      tags: ["创意", "头脑风暴", "规划"],
    },
    {
      id: 9,
      title: "API文档解读",
      category: "编程开发",
      scenario: "理解和使用API接口",
      template:
        "请帮我理解这个API：\n\n```\n[粘贴API文档]\n```\n\n我想要：\n1. 用简单的语言解释这个API的作用\n2. 提供一个完整的调用示例（[编程语言]）\n3. 列出常见的使用场景\n4. 提醒需要注意的事项",
      tags: ["API", "文档", "编程"],
    },
    {
      id: 10,
      title: "数据清洗指南",
      category: "数据分析",
      scenario: "处理和清理数据",
      template:
        "我有一批数据需要清洗：\n\n数据来源：[描述来源]\n数据问题：[缺失值/重复/格式不统一等]\n处理工具：[Excel/Python/SQL等]\n\n请提供：\n1. 详细的清洗步骤\n2. 对应的代码或公式\n3. 清洗后的数据质量检查方法",
      tags: ["数据", "清洗", "处理"],
    },
    {
      id: 11,
      title: "学习计划制定",
      category: "学习教育",
      scenario: "制定系统的学习计划",
      template:
        "帮我制定[技能/知识]的学习计划：\n\n当前水平：[描述现状]\n目标水平：[期望达到的程度]\n可用时间：[每天/每周时间]\n学习周期：[总共多少时间]\n\n请提供：\n- 分阶段的学习路线\n- 每个阶段的具体内容和时长\n- 学习资源推荐\n- 检验学习成果的方式",
      tags: ["计划", "学习", "规划"],
    },
    {
      id: 12,
      title: "产品描述优化",
      category: "营销推广",
      scenario: "优化产品说明文案",
      template:
        "优化以下产品描述：\n\n产品：[产品名称]\n当前描述：[现有文案]\n目标用户：[用户画像]\n差异化优势：[与竞品的区别]\n\n请重写为：\n- 吸引人的标题\n- 突出核心价值\n- 解决用户痛点\n- 激发购买欲望\n- 长度控制在[字数]字以内",
      tags: ["产品", "文案", "营销"],
    },
  ];

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.scenario.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "全部" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen py-12 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
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

        {/* Search and Filter */}
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
          找到 {filteredTemplates.length} 个相关模板
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="rounded-3xl border-border hover:shadow-lg transition-all p-6 bg-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Badge
                      variant="secondary"
                      className="rounded-full bg-primary/10 text-primary border-0 mb-3"
                    >
                      {template.category}
                    </Badge>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {template.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">{template.scenario}</p>
                  </div>
                </div>

                {/* Template Content */}
                <div className="bg-muted/30 rounded-2xl p-4 mb-4 max-h-48 overflow-y-auto">
                  <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed">
                    {template.template}
                  </pre>
                </div>

                {/* Tags and Actions */}
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
                    onClick={() => handleCopy(template.id, template.template)}
                    className="rounded-full bg-primary hover:bg-accent ml-4"
                    size="sm"
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
          ))}
        </div>

        {/* CTA */}
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
            <Button className="rounded-full bg-primary hover:bg-accent px-8">提交模板</Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
