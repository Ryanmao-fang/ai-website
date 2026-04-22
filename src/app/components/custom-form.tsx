import { useMemo, useState } from "react";
import { clampPrice, SITE_CONFIG } from "../../config/siteConfig";

interface CustomFormProps {
  onNavigate: (page: "home" | "custom") => void;
}

type RequirementType = "workflow" | "agent" | "tool" | "";
type ScenarioType = "personal" | "side-hustle" | "enterprise" | "";
type ComplexityType = "simple" | "standard" | "full" | "";
type TimelineType = "3days" | "7days" | "15days" | "";
type ContactType = "wechat" | "email" | "";

interface FormState {
  requirementType: RequirementType;
  scenario: ScenarioType;
  complexity: ComplexityType;
  timeline: TimelineType;
  note: string;
  contactType: ContactType;
  contactValue: string;
}

interface PriceRange {
  min: number;
  max: number;
}

const requirementOptions: Array<{ id: RequirementType; label: string; desc: string; base: PriceRange }> = [
  {
    id: "workflow",
    label: "AI工作流定制",
    desc: "精准拆解业务场景，封装自动化工作流，提升高频任务效率。",
    base: {
      min: SITE_CONFIG.pricing.baseByType.workflow.min,
      max: SITE_CONFIG.pricing.baseByType.workflow.max,
    },
  },
  {
    id: "agent",
    label: "AI智能体定制",
    desc: "定制多轮任务执行智能体，适配助手、客服、业务协同场景。",
    base: {
      min: SITE_CONFIG.pricing.baseByType.agent.min,
      max: SITE_CONFIG.pricing.baseByType.agent.max,
    },
  },
  {
    id: "tool",
    label: "AI工具定制",
    desc: "开发轻量化专属工具，聚焦单一核心需求，支持快速部署。",
    base: {
      min: SITE_CONFIG.pricing.baseByType.tool.min,
      max: SITE_CONFIG.pricing.baseByType.tool.max,
    },
  },
];

const scenarioOptions: Array<{ id: ScenarioType; label: string; multiplier: number }> = [
  { id: "personal", label: "个人自用", multiplier: SITE_CONFIG.pricing.scenarioMultiplier.personal },
  { id: "side-hustle", label: "副业变现", multiplier: SITE_CONFIG.pricing.scenarioMultiplier["side-hustle"] },
  { id: "enterprise", label: "企业内部使用", multiplier: SITE_CONFIG.pricing.scenarioMultiplier.enterprise },
];

const complexityOptions: Array<{ id: ComplexityType; label: string; multiplier: number }> = [
  { id: "simple", label: "简易版（基础功能，无需部署）", multiplier: SITE_CONFIG.pricing.complexityMultiplier.simple },
  { id: "standard", label: "标准版（完整功能，无需部署）", multiplier: SITE_CONFIG.pricing.complexityMultiplier.standard },
  { id: "full", label: "完整版（完整功能+网页部署+域名绑定）", multiplier: SITE_CONFIG.pricing.complexityMultiplier.full },
];

const timelineOptions: Array<{ id: TimelineType; label: string; multiplier: number }> = [
  { id: "3days", label: "3个工作日内", multiplier: SITE_CONFIG.pricing.timelineMultiplier["3days"] },
  { id: "7days", label: "7个工作日内", multiplier: SITE_CONFIG.pricing.timelineMultiplier["7days"] },
  { id: "15days", label: "15个工作日内", multiplier: SITE_CONFIG.pricing.timelineMultiplier["15days"] },
];

const defaultFormState: FormState = {
  requirementType: "",
  scenario: "",
  complexity: "",
  timeline: "",
  note: "",
  contactType: "",
  contactValue: "",
};

function sanitizeText(input: string): string {
  return input.replace(/[<>]/g, "").trim();
}

function formatPrice(value: number): string {
  return `¥${value.toLocaleString("zh-CN")}`;
}

function calculatePriceRange(formData: FormState): PriceRange {
  const selectedType = requirementOptions.find((item) => item.id === formData.requirementType);
  if (!selectedType) {
    return { min: 0, max: 0 };
  }
  const scenarioMul = scenarioOptions.find((item) => item.id === formData.scenario)?.multiplier || 1;
  const complexityMul = complexityOptions.find((item) => item.id === formData.complexity)?.multiplier || 1;
  const timelineMul = timelineOptions.find((item) => item.id === formData.timeline)?.multiplier || 1;
  const totalMul = scenarioMul * complexityMul * timelineMul;
  return clampPrice(
    Math.round(selectedType.base.min * totalMul),
    Math.round(selectedType.base.max * totalMul)
  );
}

function mapContactType(type: ContactType) {
  if ("wechat" === type) {
    return "微信";
  }
  if ("email" === type) {
    return "邮箱";
  }
  return "未填写";
}

export default function CustomForm({ onNavigate }: CustomFormProps) {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormState>(defaultFormState);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string>("");
  const [showSubmitPopup, setShowSubmitPopup] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [qrcodeFallback, setQrcodeFallback] = useState<boolean>(false);

  const noteLength = formData.note.trim().length;
  const hasValidContact = !!(formData.contactType && formData.contactValue.trim());
  const hasValidNote = noteLength >= 5 && noteLength <= 500;
  const priceRange = useMemo(() => calculatePriceRange(formData), [formData]);

  const selectedSummary = useMemo(
    () => [
      {
        label: "需求类型",
        value: requirementOptions.find((item) => item.id === formData.requirementType)?.label || "未选择",
      },
      {
        label: "应用场景",
        value: scenarioOptions.find((item) => item.id === formData.scenario)?.label || "未选择",
      },
      {
        label: "功能复杂度",
        value: complexityOptions.find((item) => item.id === formData.complexity)?.label || "未选择",
      },
      {
        label: "交付周期",
        value: timelineOptions.find((item) => item.id === formData.timeline)?.label || "未选择",
      },
      {
        label: "补充说明",
        value: formData.note ? formData.note : "无",
      },
      {
        label: "联系方式",
        value: formData.contactValue ? `${mapContactType(formData.contactType)}：${formData.contactValue}` : "未填写",
      },
    ],
    [formData]
  );

  const canNext = () => {
    if (1 === step) {
      return "" !== formData.requirementType;
    }
    if (2 === step) {
      return "" !== formData.scenario;
    }
    if (3 === step) {
      return "" !== formData.complexity;
    }
    if (4 === step) {
      return "" !== formData.timeline;
    }
    return hasValidContact && hasValidNote;
  };

  const submitDemand = async () => {
    if (isSubmitting || !canNext()) {
      return;
    }
    const payload = {
      ...formData,
      note: sanitizeText(formData.note),
      contactValue: sanitizeText(formData.contactValue),
      priceRange,
      submittedAt: new Date().toISOString(),
    };
    setIsSubmitting(true);
    setSubmitMessage("");
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
      const response = await fetch(`${apiBaseUrl}/api/leads/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setSubmitMessage("需求提交失败，请稍后重试。");
      } else if (true === result.delivered) {
        setSubmitMessage("需求已成功提交，信息已发送至管理员后台，请添加微信对接精准报价。");
      } else {
        setSubmitMessage("需求已提交留存，但邮件发送失败，请稍后重试或直接微信联系。");
      }
    } catch (_error) {
      setSubmitMessage("网络连接异常，需求已留存，请直接微信联系。");
    } finally {
      setShowResult(true);
      setShowSubmitPopup(true);
      setIsSubmitting(false);
      window.setTimeout(() => setShowSubmitPopup(false), 3500);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData(defaultFormState);
    setShowResult(false);
    setSubmitMessage("");
  };

  if (showResult) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-[#060B1A] via-[#0B1228] to-[#101A35] px-4 pb-16 pt-28 md:px-6">
        <div className="mx-auto max-w-5xl">
          {showSubmitPopup && (
            <div className="fixed right-4 top-24 z-50 rounded-lg bg-[#165DFF] px-4 py-3 text-sm text-white shadow-[0_6px_20px_rgba(22,93,255,0.2)]">
              需求已成功提交，信息已发送至管理员后台，请添加微信对接精准报价。
            </div>
          )}
          <div className="rounded-2xl border border-[#22345F] bg-[#101A35]/95 p-8 shadow-[0_10px_30px_rgba(22,93,255,0.2)]">
            <h1 className="text-center text-3xl font-bold text-[#EAF1FF]">您的定制需求报价已生成</h1>
            <p className="mt-3 text-center text-sm text-[#AFC0E8]">您的定制需求如下</p>
            <div className="mt-8 rounded-xl border border-[#22345F] bg-[#0B1228] p-6">
              <ul className="space-y-3 text-sm text-[#AFC0E8]">
                {selectedSummary.map((item) => (
                  <li key={item.label} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#165DFF]" />
                    <span>
                      <span className="font-semibold text-[#EAF1FF]">{item.label}：</span>
                      {item.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 rounded-xl bg-gradient-to-r from-[#165DFF] to-[#4080FF] p-8 text-center text-white">
              <p className="text-sm text-[#E8F3FF]">基于您的需求，本次定制报价区间为</p>
              <p className="mt-3 text-3xl font-bold tracking-wide">
                {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
              </p>
              <p className="mt-2 text-xs text-[#E8F3FF]">
                注：以上为需求初步预估报价区间；最终精准报价、交付细则、修改权限，添加微信一对一沟通定稿。
              </p>
            </div>
            <div className="mt-8 rounded-xl border border-[#22345F] bg-[#0B1228] p-6 text-sm leading-7 text-[#AFC0E8]">
              <h2 className="text-base font-semibold text-[#EAF1FF]">交付说明</h2>
              <p className="mt-2">
                交付内容包含对应成品、使用教程、1次免费修改；售后范围为成品正常使用故障，不包含需求变更后的修改；交付周期按您选择的周期执行。
              </p>
              {!!submitMessage && <p className="mt-3 text-[#165DFF]">{submitMessage}</p>}
            </div>
            <div className="mt-8 text-center">
              <img
                src={qrcodeFallback ? "/assets/wechat-qr-placeholder.svg" : SITE_CONFIG.wechatQrImage}
                alt="微信二维码"
                loading="lazy"
                className="mx-auto h-36 w-36 rounded-lg border border-[#22345F] bg-[#101A35] p-1"
                onError={() => setQrcodeFallback(true)}
              />
              <p className="mt-3 text-sm font-semibold text-[#165DFF]">{SITE_CONFIG.leadIntro}</p>
            </div>
            <div className="mt-8 flex flex-col items-center gap-3">
              <button onClick={resetForm} className="text-sm font-medium text-[#165DFF] hover:underline">
                返回需求提交页，修改需求
              </button>
              <button onClick={() => onNavigate("home")} className="text-sm text-[#AFC0E8] hover:text-[#7EA5FF]">
                返回首页
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
      <section className="min-h-screen bg-gradient-to-br from-[#060B1A] via-[#0B1228] to-[#101A35] px-4 pb-16 pt-24 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between rounded-xl border border-[#22345F] bg-[#101A35]/95 p-5 shadow-[0_2px_12px_rgba(22,93,255,0.15)]">
          <div>
            <h1 className="text-2xl font-bold text-[#EAF1FF] md:text-3xl">AI提效工具定制需求提交</h1>
            <p className="mt-2 text-sm text-[#AFC0E8]">层层选择，精准锁定需求，自动生成报价</p>
          </div>
          <button onClick={() => onNavigate("home")} className="text-sm text-[#165DFF] hover:underline">
            返回首页
          </button>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
          <article className="rounded-2xl border border-[#22345F] bg-[#101A35] p-7 shadow-[0_2px_12px_rgba(22,93,255,0.15)] md:p-8">
            <p className="text-sm text-[#AFC0E8]">步骤 {step}/5：请按步骤选择，每步均可返回修改，提交后将生成精准报价。</p>

            {1 === step && (
              <div className="mt-6 space-y-3">
                {requirementOptions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFormData({ ...formData, requirementType: item.id })}
                    className={`w-full rounded-lg border p-4 text-left transition-all duration-300 ${
                      item.id === formData.requirementType
                        ? "border-[#165DFF] bg-gradient-to-r from-[#142449] to-[#0F1A37] shadow-[0_2px_12px_rgba(22,93,255,0.18)]"
                        : "border-[#22345F] bg-[#0B1228] hover:-translate-y-0.5 hover:border-[#165DFF] hover:shadow-[0_6px_20px_rgba(22,93,255,0.2)]"
                    }`}
                  >
                    <p className="text-sm font-semibold text-[#EAF1FF]">{item.label}</p>
                    <p className="mt-1 text-xs text-[#AFC0E8]">{item.desc}</p>
                    <p className="mt-2 text-xs font-semibold text-[#165DFF]">
                      基础报价：{formatPrice(item.base.min)} - {formatPrice(item.base.max)}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {2 === step && (
              <div className="mt-6 space-y-3">
                {scenarioOptions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFormData({ ...formData, scenario: item.id })}
                    className={`w-full rounded-lg border p-4 text-left transition-all duration-300 ${
                      item.id === formData.scenario
                        ? "border-[#165DFF] bg-gradient-to-r from-[#142449] to-[#0F1A37] shadow-[0_2px_12px_rgba(22,93,255,0.18)]"
                        : "border-[#22345F] bg-[#0B1228] hover:-translate-y-0.5 hover:border-[#165DFF] hover:shadow-[0_6px_20px_rgba(22,93,255,0.2)]"
                    }`}
                  >
                    <p className="text-sm font-semibold text-[#EAF1FF]">{item.label}</p>
                  </button>
                ))}
              </div>
            )}

            {3 === step && (
              <div className="mt-6 space-y-3">
                {complexityOptions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFormData({ ...formData, complexity: item.id })}
                    className={`w-full rounded-lg border p-4 text-left transition-all duration-300 ${
                      item.id === formData.complexity
                        ? "border-[#165DFF] bg-gradient-to-r from-[#E8F3FF] to-white shadow-[0_2px_12px_rgba(22,93,255,0.06)]"
                        : "border-[#22345F] bg-[#0B1228] hover:-translate-y-0.5 hover:border-[#165DFF] hover:shadow-[0_6px_20px_rgba(22,93,255,0.2)]"
                    }`}
                  >
                    <p className="text-sm font-semibold text-[#EAF1FF]">{item.label}</p>
                  </button>
                ))}
              </div>
            )}

            {4 === step && (
              <div className="mt-6 space-y-3">
                {timelineOptions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFormData({ ...formData, timeline: item.id })}
                    className={`w-full rounded-lg border p-4 text-left transition-all duration-300 ${
                      item.id === formData.timeline
                        ? "border-[#165DFF] bg-gradient-to-r from-[#E8F3FF] to-white shadow-[0_2px_12px_rgba(22,93,255,0.06)]"
                        : "border-[#22345F] bg-[#0B1228] hover:-translate-y-0.5 hover:border-[#165DFF] hover:shadow-[0_6px_20px_rgba(22,93,255,0.2)]"
                    }`}
                  >
                    <p className="text-sm font-semibold text-[#EAF1FF]">{item.label}</p>
                  </button>
                ))}
              </div>
            )}

            {5 === step && (
              <div className="mt-6 space-y-4">
                <div className="rounded-lg border border-[#22345F] bg-[#0B1228] p-4">
                  <label className="mb-2 block text-sm font-semibold text-[#EAF1FF]">补充说明（5-500字）</label>
                  <textarea
                    value={formData.note}
                    onChange={(event) => setFormData({ ...formData, note: event.target.value.slice(0, 500) })}
                    placeholder="请填写额外需求、特殊要求，无则留空"
                    className="h-32 w-full rounded-lg border border-[#22345F] bg-[#101A35] p-3 text-sm text-[#EAF1FF] outline-none transition focus:border-[#165DFF]"
                  />
                  <p className="mt-2 text-xs text-[#AFC0E8]">{noteLength}/500 字</p>
                  {!hasValidNote && <p className="mt-1 text-xs text-[#165DFF]">请简单描述你的定制需求（至少5字）。</p>}
                </div>
                <div className="rounded-lg border border-[#22345F] bg-[#0B1228] p-4">
                  <label className="mb-2 block text-sm font-semibold text-[#EAF1FF]">联系方式（必填）</label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      onClick={() => setFormData({ ...formData, contactType: "wechat" })}
                      className={`rounded-lg border p-3 text-sm ${
                        "wechat" === formData.contactType
                          ? "border-[#165DFF] bg-gradient-to-r from-[#142449] to-[#0F1A37] text-[#7EA5FF]"
                          : "border-[#22345F] bg-[#101A35] text-[#AFC0E8]"
                      }`}
                    >
                      微信
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, contactType: "email" })}
                      className={`rounded-lg border p-3 text-sm ${
                        "email" === formData.contactType
                          ? "border-[#165DFF] bg-gradient-to-r from-[#E8F3FF] to-white text-[#165DFF]"
                          : "border-[#22345F] bg-[#101A35] text-[#AFC0E8]"
                      }`}
                    >
                      邮箱
                    </button>
                  </div>
                  <input
                    value={formData.contactValue}
                    onChange={(event) => setFormData({ ...formData, contactValue: event.target.value })}
                    placeholder="请预留联系方式，便于后续精准报价对接"
                    className="mt-3 w-full rounded-lg border border-[#22345F] bg-[#101A35] p-3 text-sm text-[#EAF1FF] outline-none transition focus:border-[#165DFF]"
                  />
                  {!hasValidContact && (
                    <p className="mt-2 text-xs text-[#165DFF]">请预留联系方式，便于后续精准报价对接。</p>
                  )}
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={1 === step}
                className={`rounded-lg px-4 py-2 text-sm ${
                  1 === step ? "bg-[#101A35] text-[#6E7EA8]" : "bg-[#142449] text-[#7EA5FF] hover:bg-[#1A2C57]"
                }`}
              >
                上一步
              </button>
              {step < 5 ? (
                <button
                  onClick={() => setStep(Math.min(5, step + 1))}
                  disabled={!canNext()}
                  className={`rounded-lg px-5 py-2 text-sm font-medium ${
                    canNext()
                      ? "bg-gradient-to-r from-[#165DFF] to-[#4080FF] text-white shadow-[0_2px_12px_rgba(22,93,255,0.2)]"
                      : "bg-[#101A35] text-[#6E7EA8]"
                  }`}
                >
                  下一步
                </button>
              ) : (
                <button
                  onClick={submitDemand}
                  disabled={isSubmitting || !canNext()}
                  className={`rounded-lg px-5 py-2 text-sm font-medium ${
                    !isSubmitting && canNext()
                      ? "bg-gradient-to-r from-[#165DFF] to-[#4080FF] text-white shadow-[0_2px_12px_rgba(22,93,255,0.2)]"
                      : "bg-[#101A35] text-[#6E7EA8]"
                  }`}
                >
                  {isSubmitting ? "提交中..." : "提交需求，获取精准报价"}
                </button>
              )}
            </div>
          </article>

          <aside className="rounded-2xl border border-[#22345F] bg-[#101A35] p-5 shadow-[0_2px_12px_rgba(22,93,255,0.15)] lg:sticky lg:top-24 lg:h-fit">
            <h2 className="text-base font-semibold text-[#165DFF]">实时报价</h2>
            <ul className="mt-4 space-y-2 text-xs text-[#AFC0E8]">
              {selectedSummary.slice(0, 4).map((item) => (
                <li key={item.label} className="flex items-start gap-2 rounded-md bg-[#0B1228] p-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#165DFF]" />
                  <span>
                    {item.label}：{item.value}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-5 rounded-xl bg-gradient-to-r from-[#165DFF] to-[#4080FF] p-4 text-center text-white">
              <p className="text-xs text-[#E8F3FF]">当前报价区间</p>
              <p className="mt-2 text-lg font-bold">
                {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
              </p>
              <p className="mt-2 text-[11px] text-[#E8F3FF]">
                注：以上为需求初步预估报价区间；最终精准报价、交付细则、修改权限，添加微信一对一沟通定稿。
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
