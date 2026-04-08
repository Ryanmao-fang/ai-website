export type TermExample = {
  title: string;
  content: string;
};

export type TermRecord = {
  id: number;
  name: string;
  description: string;
  category: string;
  likes: number;
  simpleExplanation: string;
  examples: TermExample[];
  relatedTermIds: number[];
  image: string;
  readingMinutes: number;
  aliases: string[];
  /** 词条正文版本标识，便于运营修订留痕 */
  contentVersion?: string;
  /** 第三方参考链接（非背书） */
  references?: { title: string; url: string }[];
};

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=max&w=1080&q=80`;

export const termsCatalog: TermRecord[] = [
  {
    id: 1,
    name: "大语言模型 (LLM)",
    description: "Large Language Model：基于深度学习的自然语言处理模型，能读会写、推理与对话。",
    category: "基础概念",
    likes: 1234,
    readingMinutes: 6,
    contentVersion: "2026-04",
    references: [
      {
        title: "维基百科：大型语言模型",
        url: "https://en.wikipedia.org/wiki/Large_language_model",
      },
      {
        title: "入门综述（第三方科普，仅供参考）",
        url: "https://arxiv.org/list/cs.CL/recent",
      },
    ],
    aliases: ["LLM", "大模型"],
    image: unsplash("photo-1719550371336-7bb64b5cacfa"),
    simpleExplanation:
      "可以把大语言模型理解成「读万卷书」的语言通才：在海量文本上学会拆句、续写、总结、翻译和举一反三。你在 ChatGPT、Claude 等产品里对话，背后往往就是这样的模型。",
    examples: [
      {
        title: "日常问答",
        content: "用口语提问，模型结合上下文给出解释，适合快速了解概念或列步骤。",
      },
      {
        title: "写作与改写",
        content: "把要点扩写成邮件、把长文压缩成摘要，或统一语气与格式。",
      },
      {
        title: "编程辅助",
        content: "根据自然语言需求生成示例代码、补充注释、解释报错日志。",
      },
      {
        title: "知识与学习",
        content: "把难点拆成小步骤，配合比喻与练习建议，适合自学补充材料。",
      },
    ],
    relatedTermIds: [2, 3, 6],
  },
  {
    id: 2,
    name: "神经网络",
    description: "由多层神经元连接构成的计算结构，是深度学习的核心载体。",
    category: "技术原理",
    likes: 982,
    readingMinutes: 7,
    aliases: ["Neural Network", "NN"],
    image: unsplash("photo-1775185172785-4bbd6b0fc8f5"),
    simpleExplanation:
      "神经网络像一张可训练的「函数网」：输入数据，逐层抽象出特征，最后输出预测。层数加深、数据与算力跟上，就出现了我们说的深度学习。",
    examples: [
      { title: "图像识别", content: "从边缘、纹理到物体部件，层层组合判断图像类别。" },
      { title: "语音识别", content: "把声波转成特征序列，再映射为文字。" },
      { title: "推荐排序", content: "把用户与物品Embedding化，估计点击或停留概率。" },
      { title: "大模型底座", content: "Transformer 也是神经网络的一种结构，用于处理序列。" },
    ],
    relatedTermIds: [1, 5, 8],
  },
  {
    id: 3,
    name: "Prompt Engineering",
    description: "通过措辞、结构与示例，引导模型稳定输出高质量结果的方法论。",
    category: "实用技能",
    likes: 2145,
    readingMinutes: 6,
    aliases: ["提示词工程", "PE"],
    image: unsplash("photo-1762330467572-5199bc772a20"),
    simpleExplanation:
      "模型很强，但需要明确角色、目标、约束与输出格式。写好提示词，就像给一个靠谱同事写「需求单」：越清楚，返工越少。",
    examples: [
      { title: "角色 + 任务", content: "「你是资深编辑，请把下文改为新闻口吻，保持事实不变。」" },
      { title: "Few-shot 示例", content: "先给两三个输入输出样例，再让模型照猫画虎。" },
      { title: "分步推理", content: "要求「先列提纲再写正文」可降低跑题。" },
      { title: "安全与边界", content: "声明不得泄露隐私、不得编造引用，可降低胡编风险。" },
    ],
    relatedTermIds: [1, 12, 11],
  },
  {
    id: 4,
    name: "机器学习",
    description: "让系统从数据中学习规律，并在新样本上泛化预测或决策。",
    category: "基础概念",
    likes: 1567,
    readingMinutes: 5,
    aliases: ["Machine Learning", "ML"],
    image: unsplash("photo-1555949963-aa79dcee981c"),
    simpleExplanation:
      "机器学习把「写死规则」换成「用数据调参数」：给定样本与目标，算法寻找能最小化误差的模型；常见范式包括监督、无监督与强化学习。",
    examples: [
      { title: "垃圾邮件检测", content: "用标注邮件训练分类器，新邮件自动判别。" },
      { title: "房价预测", content: "用面积、地段等特征回归估价。" },
      { title: "聚类分群", content: "没有标签也能发现用户簇，用于运营策略。" },
      { title: "模型评估", content: "用验证集与指标（准确率、AUC 等）比较泛化能力。" },
    ],
    relatedTermIds: [5, 8, 10],
  },
  {
    id: 5,
    name: "深度学习",
    description: "以多层神经网络表示复杂函数，适合图像、语音、文本等高维数据。",
    category: "技术原理",
    likes: 1423,
    readingMinutes: 6,
    aliases: ["Deep Learning", "DL"],
    image: unsplash("photo-1635070041078-e363dbe005cb"),
    simpleExplanation:
      "深度学习是机器学习的子集：靠「深」层网络自动学特征，减少手工特征工程。CNN、RNN、Transformer 各自擅长不同模态。" ,
    examples: [
      { title: "计算机视觉", content: "检测、分割、生成图像的常用技术栈。" },
      { title: "自然语言处理", content: "语义向量、翻译、摘要、对话等都受益于此。" },
      { title: "训练要素", content: "需要数据、算力、正则化与学习率策略。" },
      { title: "部署关注", content: "延迟、成本、量化与边缘端适配。" },
    ],
    relatedTermIds: [2, 1, 7],
  },
  {
    id: 6,
    name: "自然语言处理",
    description: "使计算机理解、生成与加工人类语言文字的技术集合。",
    category: "应用场景",
    likes: 1189,
    readingMinutes: 5,
    aliases: ["Natural Language Processing", "NLP"],
    image: unsplash("photo-1546412414-8035e1776c9a"),
    simpleExplanation:
      "NLP 连接人类语言与机器：分词、句法、语义、对话、检索与生成。如今大模型把许多子任务统一到了同一套生成框架中。" ,
    examples: [
      { title: "情感分析", content: "判断评论正负面，用于舆情与客服。" },
      { title: "检索问答", content: "结合文档库回答事实性问题，常与 RAG 搭配。" },
      { title: "机器翻译", content: "跨语言沟通与本地化内容生产。" },
      { title: "文本摘要", content: "长文提炼要点，辅助阅读效率。" },
    ],
    relatedTermIds: [1, 3, 11],
  },
  {
    id: 7,
    name: "计算机视觉",
    description: "让机器从图像或视频中理解与重建视觉世界。",
    category: "应用场景",
    likes: 1056,
    readingMinutes: 5,
    aliases: ["Computer Vision", "CV"],
    image: unsplash("photo-1516117172878-fd2c41f4a759"),
    simpleExplanation:
      "视觉任务包括分类、检测、分割、跟踪、三维重建与生成。产业里常见于质检、安防、医疗影像与自动驾驶感知。" ,
    examples: [
      { title: "物体检测", content: "框出图像里的目标类别与位置。" },
      { title: "OCR", content: "把票据、表格与证件文字结构化。" },
      { title: "人脸识别", content: "门禁与身份核验（需注意合规与告知）。" },
      { title: "内容审核", content: "识别违规图像与视频帧。" },
    ],
    relatedTermIds: [5, 2, 1],
  },
  {
    id: 8,
    name: "强化学习",
    description: "智能体在环境中通过试错与奖励信号学习长期最优策略。",
    category: "技术原理",
    likes: 876,
    readingMinutes: 7,
    aliases: ["Reinforcement Learning", "RL"],
    image: unsplash("photo-1555949963-aa79dcee981c"),
    simpleExplanation:
      "想象训练宠物：做对了给零食。强化学习用价值函数或策略网络，在探索与利用之间平衡，适合博弈、机器人与资源调度。" ,
    examples: [
      { title: "游戏 AI", content: "在复杂动作空间中学习制胜策略。" },
      { title: "推荐系统探索", content: "在不确定用户兴趣时做试探性推荐。" },
      { title: "资源编排", content: "调度机柜、车队或算力以长期成本最优。" },
      { title: "仿真先行", content: "真实世界样本昂贵，常在仿真中预训练再迁移。" },
    ],
    relatedTermIds: [4, 5, 2],
  },
  {
    id: 9,
    name: "Fine-tuning",
    description: "在通用预训练模型之上，用领域数据继续训练以适配任务。",
    category: "实用技能",
    likes: 1734,
    readingMinutes: 6,
    aliases: ["微调", "SFT"],
    image: unsplash("photo-1620712943543-bcc4688e7485"),
    simpleExplanation:
      "通用模型懂语言，但不一定懂你的术语与口径。微调用小而精的数据Teaching模型「按你们行业说话」，常比单纯提示词更稳。" ,
    examples: [
      { title: "客服话术", content: "学习工单分类与标准答复风格。" },
      { title: "代码助手", content: "对齐内部框架与命名规范。" },
      { title: "安全对齐", content: "人类反馈对齐（RLHF）也是一种微调思路。" },
      { title: "成本控制", content: "小模型+微调有时优于超大模型+长提示。" },
    ],
    relatedTermIds: [1, 12, 11],
  },
  {
    id: 10,
    name: "Token",
    description: "模型处理文本时的最小有意义的切分单位，计费与长度限制常以 Token 计。",
    category: "基础概念",
    likes: 923,
    readingMinutes: 4,
    aliases: ["词元", "标记"],
    image: unsplash("photo-1455390582262-044c14827760"),
    simpleExplanation:
      "中英混合文本会被切成子词级片语，这些片语就是 Token。上下文窗口、价格与延迟都与 Token 数量强相关。" ,
    examples: [
      { title: "上下文预算", content: "长对话要把历史摘要或截断策略做好。" },
      { title: "计费理解", content: "同样字数，中英文 Token 数可能不同。" },
      { title: "提示压缩", content: "删掉冗余示例可换更长答案空间。" },
      { title: "多模态扩展", content: "图像块有时也会当成序列 Token 输入。" },
    ],
    relatedTermIds: [1, 3, 6],
  },
  {
    id: 11,
    name: "RAG检索增强生成",
    description: "检索外部知识片段拼入提示词，再让模型基于证据生成答案。",
    category: "技术原理",
    likes: 1645,
    readingMinutes: 7,
    aliases: ["RAG", "检索增强"],
    image: unsplash("photo-1515879218367-8466d910aaa4"),
    simpleExplanation:
      "大模型可能「记错」或没见过最新文档。RAG 先搜知识库，把相关段落交给模型引用，适合企业知识问答与合规问答。" ,
    examples: [
      { title: "向量检索", content: "把段落嵌入向量库，按相似度取 Top-K。" },
      { title: "引用展示", content: "回答中附带来源，便于人工核对。" },
      { title: "混合检索", content: "关键词 + 向量提升召回。" },
      { title: "数据更新", content: "资料入库即可更新回答，无需整模重训。" },
    ],
    relatedTermIds: [1, 6, 9],
  },
  {
    id: 12,
    name: "Few-shot Learning",
    description: "仅通过少量示例教会模型完成新任务提示或轻量适配。",
    category: "实用技能",
    likes: 1112,
    readingMinutes: 5,
    aliases: ["小样本学习", "少样本"],
    image: unsplash("photo-1503676260728-1c00da094a0b"),
    simpleExplanation:
      "不必每次都训练权重：在提示里塞2–5个高质量输入输出样例，模型往往能模仿格式与意图。与微调相比更轻，但上限依赖基座能力。" ,
    examples: [
      { title: "格式抽取", content: "从票据图片字段映射到 JSON。" },
      { title: "风格迁移写作", content: "用几段范文锁定语气与结构。" },
      { title: "分类任务", content: "每条类给一个例子，模型可快速分区。" },
      { title: "与微调的取舍", content: "高频任务微调更省 Token；低频任务 Few-shot 更省工程。" },
    ],
    relatedTermIds: [3, 1, 9],
  },
];

const termMap = new Map<number, TermRecord>(termsCatalog.map((t) => [t.id, t]));

export function getTermById(id: string | undefined): TermRecord | null {
  if (!id) {
    return null;
  }
  const n = Number(id);
  if (Number.isNaN(n)) {
    return null;
  }
  return termMap.get(n) || null;
}

export function listTermsSummary(): Pick<TermRecord, "id" | "name" | "description" | "category" | "likes">[] {
  return termsCatalog.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    category: t.category,
    likes: t.likes,
  }));
}
