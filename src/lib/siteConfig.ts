/**
 * 站点对外展示信息：上线后请将邮箱、备案号等替换为真实值。
 */
export const siteConfig = {
  brandName: "CommononesAI",
  /** 运营主体名称（与证照一致后替换） */
  companyLegalName: "CommononesAI 运营团队",
  tagline: "让AI学习变得简单愉快",
  contactEmail: "hello@commononesai.cn",
  supportEmail: "support@commononesai.cn",
  businessHours: "工作日 10:00–18:00（法定节假日除外）",
  /** 顶栏公告，空字符串不展示 */
  announcementBanner: "",
  /** 前端展示版本号，可与部署注入一致 */
  appVersion: (import.meta.env.VITE_APP_VERSION as string) || "1.1.0",
  /** 填写 ICP 备案号后将在页脚展示；空字符串则隐藏该行 */
  icpNumber: "",
  /** 公安网备等可选 */
  policeRecordNumber: "",
  /** 可选：Github / X 等，空字符串则页脚隐藏对应图标 */
  socialGithubUrl: "",
  socialTwitterUrl: "",
  /** 文档「最近修订」日期 */
  legalLastUpdated: "2026年4月8日",
};
