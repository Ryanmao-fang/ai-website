import { useMemo, useState } from "react";

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

const requirementOptions: Array<{ id: RequirementType; label: string; base: PriceRange }> = [
  { id: "workflow", label: "AI工作流定制", base: { min: 800, max: 2000 } },
  { id: "agent", label: "AI智能体定制", base: { min: 2000, max: 5000 } },
  { id: "tool", label: "AI工具定制", base: { min: 3000, max: 8000 } },
];

const scenarioOptions: Array<{ id: ScenarioType; label: string; multiplier: number }> = [
  { id: "personal", label: "个人自用", multiplier: 1 },
  { id: "side-hustle", label: "副业变现", multiplier: 1.2 },
  { id: "enterprise", label: "企业内部使用", multiplier: 1.5 },
];

const complexityOptions: Array<{ id: ComplexityType; label: string; multiplier: number }> = [
  { id: "simple", label: "简易版（基础功能，无需部署）", multiplier: 1 },
  { id: "standard", label: "标准版（完整功能，无需部署）", multiplier: 1.3 },
  { id: "full", label: "完整版（完整功能+网页部署+域名绑定）", multiplier: 1.8 },
];

const timelineOptions: Array<{ id: TimelineType; label: string; multiplier: number }> = [
  { id: "3days", label: "3个工作日内", multiplier: 1.5 },
  { id: "7days", label: "7个工作日内", multiplier: 1 },
  { id: "15days", label: "15个工作日内", multiplier: 0.8 },
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

  return {
    min: Math.round(selectedType.base.min * totalMul),
    max: Math.round(selectedType.base.max * totalMul),
  };
}

function renderContactLabel(formData: FormState): string {
  if (!formData.contactType || !formData.contactValue) {
    return "未填写";
  }
  if ("wechat" === formData.contactType) {
    return `微信：${formData.contactValue}`;
  }
  return `邮箱：${formData.contactValue}`;
}

export default function CustomForm({ onNavigate }: CustomFormProps) {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormState>(defaultFormState);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
      { label: "补充说明", value: formData.note ? formData.note : "无" },
      { label: "联系方式", value: renderContactLabel(formData) },
    ],
    [formData]
  );

  const goPrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const goNext = () => {
    if (step < 5) {
      setStep(step + 1);
    }
  };

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
    return true;
  };

  const resetForm = () => {
    setStep(1);
    setFormData(defaultFormState);
    setShowResult(false);
    setSubmitMessage("");
  };

  const submitDemand = async () => {
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"}/api/leads/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setSubmitMessage("需求已记录，但邮件发送失败，请稍后重试或直接微信联系。");
      } else {
        setSubmitMessage("需求提交成功，管理员邮箱已收到完整需求。");
      }
    } catch (_error) {
      setSubmitMessage("网络连接异常，需求已生成报价，请添加微信继续沟通。");
    } finally {
      setShowResult(true);
      setIsSubmitting(false);
    }
  };

  if (showResult) {
    return (
      <section className="min-h-screen bg-white px-4 pb-16 pt-28 md:px-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-center text-3xl font-bold text-[#333333]">您的定制需求报价已生成</h1>
          <p className="mt-3 text-center text-sm text-[#666666]">您的定制需求如下</p>

          <div className="mt-8 rounded-lg border border-[#E0E6ED] bg-[#F5F7FA] p-6">
            <ul className="space-y-3 text-sm text-[#666666]">
              {selectedSummary.map((item) => (
                <li key={item.label} className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#165DFF]" />
                  <span>
                    <span className="font-semibold text-[#333333]">{item.label}：</span>
                    {item.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 rounded-lg bg-gradient-to-r from-[#165DFF] to-[#4080FF] p-8 text-center text-white">
            <p className="text-sm text-[#E8F3FF]">基于您的需求，本次定制报价区间为</p>
            <p className="mt-3 text-3xl font-bold tracking-wide">
              {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
            </p>
          </div>

          <div className="mt-8 rounded-lg border border-[#E0E6ED] p-6 text-sm leading-7 text-[#666666]">
            <h2 className="text-base font-semibold text-[#333333]">交付说明</h2>
            <p className="mt-2">
              交付内容包含对应成品、使用教程、1次免费修改；售后范围为成品正常使用故障，不包含需求变更后的修改；交付周期按您选择的周期执行。
            </p>
            {submitMessage && <p className="mt-3 text-[#165DFF]">{submitMessage}</p>}
          </div>

          <div className="mt-8 text-center">
            <img
              src="/assets/wechat-qr-placeholder.svg"
              alt="微信二维码占位图"
              className="mx-auto h-36 w-36 rounded-lg border border-[#E0E6ED] p-1"
            />
            <p className="mt-3 text-sm font-semibold text-[#165DFF]">
              添加微信，详细沟通需求、定稿报价、签订交付协议，全程一对一服务。
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3">
            <button onClick={resetForm} className="text-sm font-medium text-[#165DFF] hover:underline">
              返回需求提交页，修改需求
            </button>
            <button onClick={() => onNavigate("home")} className="text-sm text-[#666666] hover:text-[#165DFF]">
              返回首页
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#F5F7FA] px-4 pb-16 pt-24 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#333333] md:text-3xl">AI提效工具定制需求提交</h1>
            <p className="mt-2 text-sm text-[#666666]">层层选择，精准锁定需求，自动生成报价</p>
          </div>
          <button onClick={() => onNavigate("home")} className="text-sm text-[#165DFF] hover:underline">
            返回首页
          </button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <article className="rounded-lg bg-white p-6 shadow-[0_2px_12px_rgba(22,93,255,0.08)] md:p-8">
            <p className="text-sm text-[#666666]">步骤 {step}/5：请按步骤选择，每步均可返回修改，提交后将生成精准报价。</p>

            {1 === step && (
              <div className="mt-6 space-y-3">
                {requirementOptions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFormData({ ...formData, requirementType: item.id })}
                    className={`w-full rounded-lg border p-4 text-left transition ${
                      item.id === formData.requirementType
                        ? "border-[#165DFF] bg-[#E8F3FF]"
                        : "border-[#E0E6ED] hover:border-[#165DFF]"
                    }`}
                  >
                    <p className="text-sm font-semibold text-[#333333]">{item.label}</p>
                    <p className="mt-1 text-xs text-[#666666]">
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
                    className={`w-full rounded-lg border p-4 text-left transition ${
                      item.id === formData.scenario ? "border-[#165DFF] bg-[#E8F3FF]" : "border-[#E0E6ED] hover:border-[#165DFF]"
                    }`}
                  >
                    <p className="text-sm font-semibold text-[#333333]">{item.label}</p>
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
                    className={`w-full rounded-lg border p-4 text-left transition ${
                      item.id === formData.complexity
                        ? "border-[#165DFF] bg-[#E8F3FF]"
                        : "border-[#E0E6ED] hover:border-[#165DFF]"
                    }`}
                  >
                    <p className="text-sm font-semibold text-[#333333]">{item.label}</p>
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
                    className={`w-full rounded-lg border p-4 text-left transition ${
                      item.id === formData.timeline ? "border-[#165DFF] bg-[#E8F3FF]" : "border-[#E0E6ED] hover:border-[#165DFF]"
                    }`}
                  >
                    <p className="text-sm font-semibold text-[#333333]">{item.label}</p>
                  </button>
                ))}
              </div>
            )}

            {5 === step && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#333333]">
                    补充说明（可选）
                  </label>
                  <textarea
                    value={formData.note}
                    onChange={(event) => setFormData({ ...formData, note: event.target.value })}
                    placeholder="请填写额外需求、特殊要求，无则留空"
                    className="h-32 w-full rounded-lg border border-[#E0E6ED] bg-[#F5F7FA] p-3 text-sm text-[#333333] outline-none transition focus:border-[#165DFF]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#333333]">
                    联系方式（可选）
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      onClick={() => setFormData({ ...formData, contactType: "wechat" })}
                      className={`rounded-lg border p-3 text-sm ${
                        "wechat" === formData.contactType ? "border-[#165DFF] bg-[#E8F3FF]" : "border-[#E0E6ED]"
                      }`}
                    >
                      微信
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, contactType: "email" })}
                      className={`rounded-lg border p-3 text-sm ${
                        "email" === formData.contactType ? "border-[#165DFF] bg-[#E8F3FF]" : "border-[#E0E6ED]"
                      }`}
                    >
                      邮箱
                    </button>
                  </div>
                  <input
                    value={formData.contactValue}
                    onChange={(event) => setFormData({ ...formData, contactValue: event.target.value })}
                    placeholder="便于后续精准沟通，无则留空"
                    className="mt-3 w-full rounded-lg border border-[#E0E6ED] bg-[#F5F7FA] p-3 text-sm text-[#333333] outline-none transition focus:border-[#165DFF]"
                  />
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={goPrev}
                disabled={1 === step}
                className={`text-sm ${1 === step ? "text-[#999999]" : "text-[#165DFF] hover:underline"}`}
              >
                上一步
              </button>
              {step < 5 ? (
                <button
                  onClick={goNext}
                  disabled={!canNext()}
                  className={`rounded-lg px-5 py-2 text-sm font-medium ${
                    canNext() ? "bg-[#165DFF] text-white hover:bg-[#0F4CD5]" : "bg-[#E0E6ED] text-[#999999]"
                  }`}
                >
                  下一步
                </button>
              ) : (
                <button
                  onClick={submitDemand}
                  disabled={isSubmitting}
                  className="rounded-lg bg-[#165DFF] px-5 py-2 text-sm font-medium text-white hover:bg-[#0F4CD5] disabled:opacity-60"
                >
                  {isSubmitting ? "提交中..." : "提交需求，获取精准报价"}
                </button>
              )}
            </div>
          </article>

          <aside className="rounded-lg bg-white p-5 shadow-[0_2px_12px_rgba(22,93,255,0.08)] lg:sticky lg:top-24 lg:h-fit">
            <h2 className="text-base font-semibold text-[#165DFF]">实时报价</h2>
            <ul className="mt-4 space-y-2 text-xs text-[#666666]">
              {selectedSummary.slice(0, 4).map((item) => (
                <li key={item.label} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#165DFF]" />
                  <span>
                    {item.label}：{item.value}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-5 rounded-lg bg-[#F5F7FA] p-4 text-center">
              <p className="text-xs text-[#666666]">当前报价区间</p>
              <p className="mt-2 text-lg font-bold text-[#165DFF]">
                {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
