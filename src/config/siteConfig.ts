export const SITE_CONFIG = {
  brandTitle: "您的AI定制私域",
  domainUrl: "https://www.commononesai.cn/",
  heroBackgroundImage:
    "/assets/Image/ryanmao_917_abstract_fluid_art_oil_painting_texture_soft_diff_d24a976f-5e1e-4398-9e37-fa4a06b0db45_0.png",
  /** 定制需求页背景；留空则使用 heroBackgroundImage */
  customAgentBackdropImage: "",
  /** 页面底部快捷提问按钮；留空数组则不展示，避免与扣子侧推荐问题重复 */
  agentStarterPrompts: [] as readonly string[],
  wechatQrImage: "/assets/Image/qrcode.png",
  leadIntro:
    "添加私人微信 | 一对一需求对接 | 精准定稿报价 | 定制方案全程服务",
  pricing: {
    minFloor: 800,
    maxCeil: 22000,
    baseByType: {
      workflow: { min: 200, max: 1000 },
      agent: { min: 500, max: 4000 },
      tool: { min: 500, max: 8000 },
    },
    scenarioMultiplier: {
      personal: 1,
      "side-hustle": 1.2,
      enterprise: 1.5,
    },
    complexityMultiplier: {
      simple: 1,
      standard: 1.3,
      full: 1.8,
    },
    timelineMultiplier: {
      "3days": 1.5,
      "7days": 1,
      "15days": 0.8,
    },
  },
} as const;

export function clampPrice(min: number, max: number) {
  const floor = SITE_CONFIG.pricing.minFloor;
  const ceil = SITE_CONFIG.pricing.maxCeil;
  const nextMin = Math.max(floor, Math.min(ceil, min));
  const nextMax = Math.max(floor, Math.min(ceil, max));
  return {
    min: Math.min(nextMin, nextMax),
    max: Math.max(nextMin, nextMax),
  };
}
