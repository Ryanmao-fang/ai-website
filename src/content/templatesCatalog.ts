export type TemplateRecord = {
  id: number;
  title: string;
  category: string;
  scenario: string;
  template: string;
  tags: string[];
};

export const templateCategories = [
  "全部",
  "日常对话",
  "写作创作",
  "编程开发",
  "数据分析",
  "学习教育",
  "营销推广",
] as const;

export function templateTierForId(id: number): "standard" | "pro" {
  return id >= 7 ? "pro" : "standard";
}

export const templatesCatalog: TemplateRecord[] = [
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

const mapById = new Map<number, TemplateRecord>(templatesCatalog.map((t) => [t.id, t]));

export function getTemplateById(id: number): TemplateRecord | null {
  return mapById.get(id) || null;
}
