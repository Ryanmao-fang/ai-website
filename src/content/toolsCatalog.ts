export type ToolUseCase = {
  title: string;
  description: string;
  icon: string;
};

export type ToolHowToStep = {
  step: number;
  title: string;
  content: string;
};

export type ToolRecord = {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  tags: string[];
  rating: number;
  link: string;
  fullDescription: string;
  useCases: ToolUseCase[];
  howToUse: ToolHowToStep[];
  relatedToolIds: number[];
  /** 商用提示：外链以官方为准 */
  disclaimer?: string;
  platform?: string;
  openSource?: boolean;
  /** 价格模式，用于列表筛选 */
  priceTier?: "free" | "freemium" | "paid";
  /** 适合人群一句话 */
  suitableFor?: string;
};

export const toolsCatalog: ToolRecord[] = [
  {
    id: 1,
    name: "ChatGPT",
    icon: "💬",
    description: "OpenAI 的对话式助手，适合写作、编程与日常问答。",
    category: "对话助手",
    tags: ["对话", "写作", "编程"],
    rating: 4.8,
    link: "https://chat.openai.com",
    platform: "Web / iOS / Android",
    openSource: false,
    priceTier: "freemium",
    suitableFor: "知识工作者、开发者、写作者",
    disclaimer: "服务条款、可用地区与定价以 OpenAI 官网为准。",
    fullDescription:
      "ChatGPT 基于 GPT 系列大语言模型，支持多轮对话、工具调用与插件生态（视账号类型而定）。适合快速原型、学习与办公辅助，请注意核对事实与隐私信息。",
    useCases: [
      { title: "内容创作", description: "邮件、报告、社媒、演讲稿等文本产出。", icon: "✍️" },
      { title: "学习与答疑", description: "拆解概念、出测验题、解释错题。", icon: "📚" },
      { title: "编程协作", description: "生成代码草案、单元测试思路、Review 建议。", icon: "💻" },
      { title: "数据分析", description: "表格清洗思路、SQL/Python 片段与可视化建议。", icon: "📊" },
      { title: "头脑风暴", description: "卖点、标题、活动脚本的多方案对比。", icon: "💡" },
      { title: "日常助手", description: "行程草拟、翻译、摘要与清单管理。", icon: "🤝" },
    ],
    howToUse: [
      { step: 1, title: "注册与登录", content: "访问官网，使用邮箱或第三方账号完成注册。" },
      { step: 2, title: "明确目标", content: "一次对话聚焦一个任务，补充背景与约束。" },
      { step: 3, title: "迭代提示", content: "若答案不理想，补充反例、格式或分步要求。" },
      { step: 4, title: "核对与引用", content: "对关键事实交叉验证，涉密信息勿粘贴。" },
    ],
    relatedToolIds: [3, 4, 6],
  },
  {
    id: 2,
    name: "Midjourney",
    icon: "🎨",
    description: "高质量文生图工具，适合视觉概念与美术参考。",
    category: "图像生成",
    tags: ["图像", "设计", "创作"],
    rating: 4.9,
    link: "https://midjourney.com",
    platform: "Discord / Web",
    openSource: false,
    priceTier: "paid",
    suitableFor: "设计师、视觉创意、营销素材",
    disclaimer: "商用授权、会员档位与使用政策以 Midjourney 官方说明为准。",
    fullDescription:
      "Midjourney 以审美风格见长，适合插画、海报、品牌视觉探索。可通过提示词权重、版本参数与参考图控制画面。",
    useCases: [
      { title: "概念草图", description: "为产品、角色或场景快速出多方案。", icon: "🖼️" },
      { title: "广告创意", description: "主视觉、Banner 与社媒素材探索。", icon: "📣" },
      { title: "服装/室内", description: "材质与氛围参考（注意与实景落地差距）。", icon: "🏠" },
      { title: "风格迁移", description: "指定艺术家风格需谨慎评估版权与平台规则。", icon: "🎭" },
      { title: "分镜参考", description: "影视前期气氛图与镜头语言尝试。", icon: "🎬" },
      { title: "品牌探索", description: "Logo 形态与配色的头脑风暴（需法务复核）。", icon: "🏷️" },
    ],
    howToUse: [
      { step: 1, title: "加入服务", content: "按官方指引绑定 Discord 或 Web 入口。" },
      { step: 2, title: "写提示词", content: "描述主体、风格、光线、镜头与负面提示。" },
      { step: 3, title: "挑选与放大", content: "从四格初稿选择，再高清化与微调。" },
      { step: 4, title: "出稿规范", content: "确认分辨率、版权与是否需人工精修。" },
    ],
    relatedToolIds: [5, 9, 1],
  },
  {
    id: 3,
    name: "Claude",
    icon: "🤖",
    description: "Anthropic 的长上下文助手，擅长大文档阅读与结构化输出。",
    category: "对话助手",
    tags: ["分析", "写作", "翻译"],
    rating: 4.7,
    link: "https://claude.ai",
    platform: "Web",
    openSource: false,
    priceTier: "freemium",
    suitableFor: "长文写作、分析与安全敏感场景",
    disclaimer: "功能与地区策略以 Anthropic 官方为准。",
    fullDescription:
      "Claude 在长文本摘要、合规改写、对照表格与多文件分析场景表现突出，可与 ChatGPT 形成互补。",
    useCases: [
      { title: "合同/论文阅读", content: "提取条款、风险点与摘要。" },
      { title: "多语言校对", content: "统一术语表与语气。" },
      { title: "知识库问答", content: "把长篇资料分段提问（亦可结合 RAG）。" },
      { title: "代码理解", content: "模块说明、依赖梳理与重构建议。" },
      { title: "表格推理", content: "解释统计结果并生成汇报段落。" },
      { title: "教学辅导", content: "把讲解拆成分级难度。" },
    ],
    howToUse: [
      { step: 1, title: "准备材料", content: "长文档可先提要再分段粘贴。" },
      { step: 2, title: "指定结构", content: "要求输出目录、表格或检查清单。" },
      { step: 3, title: "引用要求", content: "让其标注段落依据，便于复核。" },
      { step: 4, title: "版本对比", content: "对同一任务与竞品模型交叉验证。" },
    ],
    relatedToolIds: [1, 4, 6],
  },
  {
    id: 4,
    name: "Notion AI",
    icon: "📝",
    description: "集成在 Notion 中的 AI，用于笔记总结、行动项与模板化写作。",
    category: "办公效率",
    tags: ["笔记", "协作", "总结"],
    rating: 4.6,
    link: "https://www.notion.so",
    platform: "Web / 桌面 / 移动端",
    openSource: false,
    priceTier: "freemium",
    suitableFor: "团队知识管理、项目协作",
    disclaimer: "AI 功能可用性与计费以 Notion 官方为准。",
    fullDescription:
      "适合团队知识库：在页面内直接生成摘要、待办、会议纪要与数据库字段填充建议。" ,
    useCases: [
      { title: "会议纪要", content: "由速记稿生成决议与负责人。" },
      { title: "项目看板", content: "把需求描述改写成可执行任务。" },
      { title: "Wiki 维护", content: "补齐缺失章节提示与术语表。" },
      { title: "招聘/PR", content: "JD 与新闻稿草拟。" },
      { title: "个人复盘", content: "周报月报复盘模板。" },
      { title: "数据库清理", content: "标签归一与字段建议。" },
    ],
    howToUse: [
      { step: 1, title: "开启 AI", content: "在支持的工作区启用 Notion AI。" },
      { step: 2, title: "选中段落", content: "用快捷指令改写、加长或缩短。" },
      { step: 3, title: "数据库场景", content: "批量生成属性说明与摘要。" },
      { step: 4, title: "权限", content: "注意共享页面中的敏感信息。" },
    ],
    relatedToolIds: [1, 3, 8],
  },
  {
    id: 5,
    name: "Stable Diffusion",
    icon: "🖼️",
    description: "开源文生图生态，可本地部署与二次开发。",
    category: "图像生成",
    tags: ["开源", "图像", "定制"],
    rating: 4.5,
    link: "https://stability.ai",
    platform: "本地 / 云端",
    openSource: true,
    priceTier: "free",
    suitableFor: "技术极客、本地部署与实验",
    disclaimer: "模型许可、成人内容与商用条款请阅读对应 Checkpoint 的 License。",
    fullDescription:
      "社区模型与 LoRA 丰富，适合需要可控管线、批量生成或私有化部署的团队。" ,
    useCases: [
      { title: "私有化出图", content: "内网部署满足合规与低延迟。" },
      { title: "可控生成", content: "ControlNet、Inpaint 等插件精细改图。" },
      { title: "训练 LoRA", content: "针对人物/产品风格轻量适配。" },
      { title: "批量素材", content: "电商主图与广告尺寸扩展。" },
      { title: "数据合成", content: "仿真数据扩充（注意偏置）。" },
      { title: "教学实验", content: "理解扩散模型与采样器差异。" },
    ],
    howToUse: [
      { step: 1, title: "选发行版", content: "WebUI、ComfyUI 或云服务商。" },
      { step: 2, title: "选模型", content: "按写实/动漫/产品选择 Checkpoint。" },
      { step: 3, title: "写提示与参数", content: "分辨率、步数、调度器影响质量与速度。" },
      { step: 4, title: "后处理", content: "放大、修脸与色彩管理。" },
    ],
    relatedToolIds: [2, 9, 7],
  },
  {
    id: 6,
    name: "GitHub Copilot",
    icon: "👨‍💻",
    description: "面向 IDE 的代码补全与对话助手，提升日常开发效率。",
    category: "编程开发",
    tags: ["编程", "代码", "自动补全"],
    rating: 4.7,
    link: "https://github.com/features/copilot",
    platform: "VS Code / JetBrains 等",
    openSource: false,
    priceTier: "paid",
    suitableFor: "软件工程师、日常补全与评审",
    disclaimer: "组织策略、代码隐私与许可以 GitHub 政策为准。",
    fullDescription:
      "基于上下文预测下一行或多行代码，支持注释驱动生成、测试骨架与简单重构。" ,
    useCases: [
      { title: "样板代码", content: "CRUD、DTO、校验器快速搭建。" },
      { title: "单测生成", content: "边界条件与 Mock 提示。" },
      { title: "报错辅助", content: "解释栈追踪并给修改建议。" },
      { title: "文档注释", content: "函数注释与 README 草案。" },
      { title: "SQL/正则", content: "复杂查询与模式编写。" },
      { title: "学习新框架", content: "对照示例理解 API。" },
    ],
    howToUse: [
      { step: 1, title: "安装插件", content: "在 IDE 登录并授权。" },
      { step: 2, title: "小步验证", content: "生成后运行测试再合并。" },
      { step: 3, title: "提供上下文", content: "打开相关文件，补全更准。" },
      { step: 4, title: "安全审查", content: "避免泄露密钥与内网地址。" },
    ],
    relatedToolIds: [1, 3, 9],
  },
  {
    id: 7,
    name: "Runway",
    icon: "🎬",
    description: "AI 视频生成与编辑工具链，覆盖抠像、补帧与短片生成。",
    category: "视频创作",
    tags: ["视频", "剪辑", "特效"],
    rating: 4.6,
    link: "https://runwayml.com",
    platform: "Web",
    openSource: false,
    priceTier: "paid",
    suitableFor: "短视频、广告与视觉叙事",
    disclaimer: "导出规格、版权与订阅档位以 Runway 官方为准。",
    fullDescription:
      "适合短视频团队探索镜头语言与视觉特效，仍建议与传统剪辑软件搭配完成精剪。" ,
    useCases: [
      { title: "文生视频", content: "生成氛围短片或动画草案。" },
      { title: "抠像与去背景", content: "降低绿幕门槛。" },
      { title: "风格化", content: "画面重绘与艺术化滤镜。" },
      { title: "广告样片", content: "快速 A/B 视觉方向。" },
      { title: "教育演示", content: "动态图解与分镜。" },
      { title: "素材修复", content: "分辨率提升与简单去噪。" },
    ],
    howToUse: [
      { step: 1, title: "注册项目", content: "创建 Workspace 与成员权限。" },
      { step: 2, title: "选模型/管线", content: "按分辨率与时长权衡成本。" },
      { step: 3, title: "提示与参考", content: "用关键帧或参考图稳定主体。" },
      { step: 4, title: "后期合成", content: "导出到剪辑软件调色与配音。" },
    ],
    relatedToolIds: [2, 5, 1],
  },
  {
    id: 8,
    name: "Jasper",
    icon: "✍️",
    description: "面向营销团队的文案生成平台，模板化程度高。",
    category: "写作辅助",
    tags: ["营销", "文案", "SEO"],
    rating: 4.5,
    link: "https://www.jasper.ai",
    platform: "Web",
    openSource: false,
    priceTier: "paid",
    suitableFor: "营销文案、增长与电商团队",
    disclaimer: "功能模块与计费以 Jasper 官方为准。",
    fullDescription:
      "适合多渠道营销排期：广告标题、落地页、邮件序列与博客纲要，可与品牌声音（Tone）配置结合。" ,
    useCases: [
      { title: "广告文案", description: "多版本标题与描述测试。", icon: "📣" },
      { title: "SEO 博客", description: "纲要、段落扩展与元描述。", icon: "🔎" },
      { title: "邮件营销", description: "培育序列与节日活动稿。", icon: "✉️" },
      { title: "社交矩阵", description: "一键拆分长短帖。", icon: "📱" },
      { title: "多语言投放", description: "本地化口号与禁忌词检查。", icon: "🌍" },
      { title: "竞品话术", description: "SWOT 式对比（需人工复核真实性）。", icon: "📈" },
    ],
    howToUse: [
      { step: 1, title: "品牌档案", content: "录入受众、卖点与禁用词。" },
      { step: 2, title: "选模板", content: "按渠道选择workflow。" },
      { step: 3, title: "迭代评分", content: "用团队打分沉淀最佳提示。" },
      { step: 4, title: "合规", content: "医疗、金融等垂直领域需法务审阅。" },
    ],
    relatedToolIds: [1, 4, 2],
  },
  {
    id: 9,
    name: "DALL·E 3",
    icon: "🌈",
    description: "OpenAI 的文生图模型，强调提示遵循与可读文字绘制。",
    category: "图像生成",
    tags: ["图像", "创意", "精准"],
    rating: 4.8,
    link: "https://openai.com/dall-e-3",
    platform: "ChatGPT Plus / API",
    openSource: false,
    priceTier: "paid",
    suitableFor: "品牌视觉、社交配图快速出稿",
    disclaimer: "使用渠道、版权政策与内容安全规则以 OpenAI 为准。",
    fullDescription:
      "对自然语言指令的理解较好，适合需要「把话说明白就能出图」的流程；复杂后期仍建议配合 Photoshop 等工具。" ,
    useCases: [
      { title: "海报文字", description: "生成含标题的视觉（需抽查拼写）。", icon: "🪧" },
      { title: "产品摄影风", description: "白底/棚拍风格参考。", icon: "📷" },
      { title: "故事板", description: "连环画式分格探索。", icon: "📖" },
      { title: "营销节日", description: "节气与活动主视觉草案。", icon: "🎉" },
      { title: "儿童读物", description: "插画风探索（注意平台未成年内容政策）。", icon: "🧒" },
      { title: "API 批量", description: "结合自有系统批量生成缩略图。", icon: "🧩" },
    ],
    howToUse: [
      { step: 1, title: "选入口", content: "在 ChatGPT 或 API 中启用 DALL·E 3。" },
      { step: 2, title: "描述画面", content: "写明主体、背景、光线、视角、色调。" },
      { step: 3, title: "审安全拦截", content: "对敏感题材准备替代描述。" },
      { step: 4, title: "精修", content: "导出后在设计软件微调构图与文字。" },
    ],
    relatedToolIds: [1, 2, 5],
  },
];

const toolMap = new Map<number, ToolRecord>(toolsCatalog.map((t) => [t.id, t]));

export function getToolById(id: string | undefined): ToolRecord | null {
  if (!id) {
    return null;
  }
  const n = Number(id);
  if (Number.isNaN(n)) {
    return null;
  }
  return toolMap.get(n) || null;
}

export function listToolsSummary(): Pick<
  ToolRecord,
  "id" | "name" | "description" | "icon" | "category" | "tags" | "rating" | "link"
>[] {
  return toolsCatalog.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    icon: t.icon,
    category: t.category,
    tags: t.tags,
    rating: t.rating,
    link: t.link,
  }));
}
