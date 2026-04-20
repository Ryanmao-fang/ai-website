import { useMemo, useState } from "react";

interface HomepageProps {
  onNavigate: (page: "custom") => void;
}

interface CaseCard {
  name: string;
  scenario: string;
  highlight: string;
  image: string;
}

const serviceCards = [
  {
    icon: "Workflow",
    name: "AI工作流定制",
    advantages: ["低代码搭建", "快速落地", "可复用、极简操作"],
  },
  {
    icon: "Agent",
    name: "AI智能体定制",
    advantages: ["个性化适配", "可定制逻辑", "轻量化部署"],
  },
  {
    icon: "Tools",
    name: "AI工具定制",
    advantages: ["专属定制", "快速部署", "低成本维护"],
  },
];

const cases: CaseCard[] = [
  {
    name: "办公自动化工作流定制",
    scenario: "企业行政办公",
    highlight: "自动汇总数据、生成周报、同步邮件，减少80%重复工作。",
    image: "/assets/case-workflow.svg",
  },
  {
    name: "副业变现智能体定制",
    scenario: "自媒体副业",
    highlight: "自动生成文案、标题、排版建议，多平台适配并提升内容产出效率。",
    image: "/assets/case-agent.svg",
  },
  {
    name: "客户需求检索工具定制",
    scenario: "企业销售部门",
    highlight: "快速检索客户需求并自动匹配方案，显著提升客户对接效率。",
    image: "/assets/case-tool.svg",
  },
];

const strengths = [
  {
    title: "专业壁垒",
    desc: "程序员团队 + AI底层技术，拒绝模板化，方案全部按需打造。",
  },
  {
    title: "按需定制",
    desc: "不强制捆绑功能，精准匹配需求，避免冗余并降低成本。",
  },
  {
    title: "极简售后",
    desc: "交付后提供1次免费修改，维护成本低，问题响应及时。",
  },
  {
    title: "快速交付",
    desc: "标准化开发流程，按时交付，确保需求快速落地。",
  },
];

const deliverSteps = [
  "需求沟通：明确核心诉求、场景、周期",
  "方案定稿：出具方案与报价，确认后启动开发",
  "开发实现：按方案开发，全程同步进度",
  "测试验收：提供测试版本，逐项确认功能",
  "交付完成：交付成品和教程，并提供1次免费修改",
];

const faqs = [
  {
    q: "报价区间为什么有浮动？",
    a: "报价根据需求类型、场景、复杂度、交付周期综合计算，添加微信后可提供精准报价。",
  },
  {
    q: "交付周期可以加急吗？",
    a: "可以，选择“3个工作日内”可加急，需额外支付50%加急费。",
  },
  {
    q: "交付后可以修改吗？",
    a: "交付后提供1次免费修改（不改变核心需求），额外修改会另行报价。",
  },
  {
    q: "需要提供什么资料？",
    a: "无需额外准备资料，先提交需求即可，后续微信补充细节。",
  },
  {
    q: "交付内容包含什么？",
    a: "包含成品工具/工作流/智能体、使用教程、1次免费修改；完整版含部署与域名绑定。",
  },
  {
    q: "支付方式是什么？",
    a: "添加微信沟通并确认方案后，支付50%定金，交付完成后支付尾款。",
  },
];

export default function Homepage({ onNavigate }: HomepageProps) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const heroGradient = useMemo(
    () => "bg-gradient-to-br from-[#165DFF] via-[#0F4CD5] to-[#165DFF]",
    []
  );

  return (
    <div className="pt-16">
      <section className={`relative overflow-hidden px-4 py-28 text-center text-white md:px-6 ${heroGradient}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.2),_transparent_55%)]" />
        <div className="relative mx-auto max-w-5xl">
          <p className="text-sm uppercase tracking-[0.3em] text-[#E8F3FF]">AI Custom Delivery Studio</p>
          <h1 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
            AI提效工具定制 · 工作流｜智能体｜专属工具 一站式开发
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-base text-[#E8F3FF] md:text-xl">
            用技术赋能效率，按需定制，拒绝冗余，让AI成为你的核心竞争力。
          </p>
          <button
            onClick={() => onNavigate("custom")}
            className="mt-10 rounded-lg bg-white px-8 py-3 text-base font-semibold text-[#165DFF] shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            立即定制
          </button>
        </div>
      </section>

      <section className="bg-white px-4 py-20 md:px-6">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold text-[#165DFF]">三大核心产品</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {serviceCards.map((service) => (
              <article
                key={service.name}
                className="rounded-lg border border-[#E0E6ED] bg-white p-6 shadow-[0_2px_12px_rgba(22,93,255,0.08)] transition hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(22,93,255,0.12)]"
              >
                <div className="mb-4 inline-flex rounded-md bg-[#E8F3FF] px-3 py-1 text-xs font-semibold text-[#165DFF]">
                  {service.icon}
                </div>
                <h3 className="text-lg font-semibold">{service.name}</h3>
                <ul className="mt-3 space-y-2 text-sm text-[#666666]">
                  {service.advantages.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#165DFF]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <a href="#cases" className="mt-4 inline-block text-sm font-medium text-[#165DFF] hover:underline">
                  查看案例
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="cases" className="bg-[#F5F7FA] px-4 py-20 md:px-6">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold text-[#165DFF]">真实交付案例 · 可落地、可复用</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {cases.map((caseItem) => (
              <article
                key={caseItem.name}
                className="rounded-lg bg-white p-5 shadow-[0_2px_12px_rgba(22,93,255,0.08)] transition hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(22,93,255,0.12)]"
              >
                <h3 className="text-base font-semibold text-[#333333]">{caseItem.name}</h3>
                <p className="mt-1 text-sm text-[#666666]">应用场景：{caseItem.scenario}</p>
                <button className="mt-4 w-full" onClick={() => setPreviewImage(caseItem.image)}>
                  <img
                    src={caseItem.image}
                    alt={caseItem.name}
                    className="h-44 w-full rounded-lg border border-[#E0E6ED] object-cover"
                  />
                </button>
                <p className="mt-4 text-sm text-[#666666]">{caseItem.highlight}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 md:px-6">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold text-[#165DFF]">服务优势</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {strengths.map((item) => (
              <article key={item.title} className="rounded-lg bg-[#E8F3FF] p-5">
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#666666]">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F5F7FA] px-4 py-20 md:px-6">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold text-[#165DFF]">交付流程</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-5">
            {deliverSteps.map((step, index) => (
              <article key={step} className="rounded-lg bg-white p-5 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#165DFF] font-semibold text-white">
                  {index + 1}
                </div>
                <p className="mt-3 text-sm leading-6 text-[#666666]">{step}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 md:px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-[#165DFF]">常见问题</h2>
          <div className="mt-8 divide-y divide-[#E0E6ED] rounded-lg border border-[#E0E6ED]">
            {faqs.map((faq, index) => {
              const isOpen = expandedFaq === index;
              return (
                <div key={faq.q}>
                  <button
                    className="flex w-full items-center justify-between px-5 py-4 text-left"
                    onClick={() => setExpandedFaq(isOpen ? null : index)}
                  >
                    <span className="text-sm font-semibold text-[#165DFF]">{faq.q}</span>
                    <span className="text-[#165DFF]">{isOpen ? "-" : "+"}</span>
                  </button>
                  {isOpen && <p className="px-5 pb-4 text-sm leading-6 text-[#666666]">{faq.a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="bg-[#165DFF] px-4 py-14 text-center text-white md:px-6">
        <div className="mx-auto max-w-4xl">
          <img
            src="/assets/wechat-qr-placeholder.svg"
            alt="微信二维码占位图"
            className="mx-auto h-28 w-28 rounded-lg border border-white/40 bg-white p-1"
          />
          <p className="mt-3 text-sm text-[#E8F3FF]">联系方式：微信（二维码图片）</p>
          <p className="mt-4 text-sm">版权所有 © 2026 AI提效工具定制 保留所有权利</p>
          <p className="mt-1 text-sm text-[#E8F3FF]">域名：commononesAI.com（上线时替换为你的现有域名）</p>
        </div>
      </footer>

      {previewImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 px-4" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} alt="案例放大图" className="max-h-[85vh] w-full max-w-4xl rounded-lg object-contain" />
          <button
            className="absolute right-6 top-6 rounded-full border border-white px-3 py-1 text-sm text-white"
            onClick={() => setPreviewImage(null)}
          >
            关闭
          </button>
        </div>
      )}
    </div>
  );
}
