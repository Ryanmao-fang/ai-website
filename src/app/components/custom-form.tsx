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

const requirementOptions: Array<{ id: RequirementType; label: string; desc: string; base: PriceRange }> = [
  {
    id: "workflow",
    label: "AI工作流定制",
    desc: "聚焦自动化流程串联，适合高频重复任务提效。",
    base: { min: 200, max: 1000 },
  },
  {
    id: "agent",
    label: "AI智能体定制",
    desc: "聚焦智能协同与任务拆解，支持多轮业务逻辑处理。",
    base: { min: 500, max: 4000 },
  },
  {
    id: "tool",
    label: "AI工具定制",
    desc: "聚焦可直接上线的业务工具，支持网页部署与域名绑定。",
    base: { min: 500, max: 8000 },
  },
];

const scenarioOptions: Array<{ id: ScenarioType; label: string; desc: string; multiplier: number }> = [
  { id: "personal", label: "个人自用", desc: "轻量场景，快速验证可用性。", multiplier: 1 },
  { id: "side-hustle", label: "副业变现", desc: "兼顾效率与稳定性，要求更高。", multiplier: 1.2 },
  { id: "enterprise", label: "企业内部使用", desc: "多角色协作，可靠性与管理要求更高。", multiplier: 1.5 },
];

const complexityOptions: Array<{ id: ComplexityType; label: string; desc: string; multiplier: number }> = [
  { id: "simple", label: "简易版（基础功能，无需部署）", desc: "快速交付，覆盖核心最小功能。", multiplier: 1 },
  { id: "standard", label: "标准版（完整功能，无需部署）", desc: "功能完整，适合稳定日常使用。", multiplier: 1.3 },
  { id: "full", label: "完整版（完整功能+网页部署+域名绑定）", desc: "从开发到上线全链路交付。", multiplier: 1.8 },
];

const timelineOptions: Array<{ id: TimelineType; label: string; desc: string; multiplier: number }> = [
  { id: "3days", label: "3个工作日内", desc: "加急交付，优先排期。", multiplier: 1.5 },
  { id: "7days", label: "7个工作日内", desc: "标准排期，成本与周期均衡。", multiplier: 1 },
  { id: "15days", label: "15个工作日内", desc: "灵活交付，预算更友好。", multiplier: 0.8 },
];

const stepTitles = [
  "步骤 1/5：选择需求类型",
  "步骤 2/5：选择应用场景",
  "步骤 3/5：选择功能复杂度",
  "步骤 4/5：选择期望交付周期",
  "步骤 5/5：补充说明与联系方式",
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

function contactTypeText(type: ContactType): string {
  if ("wechat" === type) {
    return "微信";
  }
  if ("email" === type) {
    return "邮箱";
  }
  return "未填写";
}

function StepOptionCard({
  title,
  desc,
  selected,
  onClick,
  extra,
}: {
  title: string;
  desc: string;
  selected: boolean;
  onClick: () => void;
  extra?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl border p-5 text-left transition-all duration-300 ${
        selected
          ? "border-[#165DFF] bg-gradient-to-r from-[#E8F3FF] to-white shadow-[0_6px_20px_rgba(22,93,255,0.12)]"
          : "border-[#E0E6ED] bg-white hover:-translate-y-0.5 hover:border-[#165DFF] hover:shadow-[0_6px_20px_rgba(22,93,255,0.12)]"
      }`}
    >
      <p className="text-base font-semibold text-[#333333]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#666666]">{desc}</p>
      {extra && <p className="mt-3 text-xs font-semibold text-[#165DFF]">{extra}</p>}
    </button>
  );
}

export default function CustomForm({ onNavigate }: CustomFormProps) {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormState>(defaultFormState);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [qrcodeFallback, setQrcodeFallback] = useState<boolean>(false);

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
        value: formData.contactValue ? `${contactTypeText(formData.contactType)}：${formData.contactValue}` : "未填写",
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
    return true;
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
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
      const response = await fetch(`${apiBaseUrl}/api/leads/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setSubmitMessage("需求已提交留存，但邮件发送失败，请稍后重试或直接微信联系。");
      } else if (true === result.delivered) {
        setSubmitMessage("需求已提交并发送到你的邮箱，请注意查收。");
      } else {
        setSubmitMessage("需求已提交并留存在系统中（邮件通道暂不可用）。");
      }
    } catch (_error) {
      setSubmitMessage("网络连接异常，需求暂未发送，请检查后端服务地址。");
    } finally {
      setShowResult(true);
      setIsSubmitting(false);
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
      <section className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-white to-[#E8F3FF] px-4 pb-16 pt-28 md:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-[#DCE6FA] bg-white/90 p-8 shadow-[0_12px_30px_rgba(22,93,255,0.12)]">
            <h1 className="text-center text-3xl font-bold text-[#333333]">您的定制需求报价已生成</h1>
            <p className="mt-3 text-center text-sm text-[#666666]">您的定制需求如下</p>

            <div className="mt-8 rounded-xl border border-[#E0E6ED] bg-[#F5F7FA] p-6">
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

            <div className="mt-8 rounded-xl bg-gradient-to-r from-[#165DFF] to-[#4080FF] p-8 text-center text-white">
              <p className="text-sm text-[#E8F3FF]">基于您的需求，本次定制报价区间为</p>
              <p className="mt-3 text-3xl font-bold tracking-wide">
                {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
              </p>
              <p className="mt-3 text-xs text-[#E8F3FF]">当前报价为系统评估价，请以实际沟通价格为准。</p>
            </div>

            <div className="mt-8 rounded-xl border border-[#E0E6ED] bg-white p-6 text-sm leading-7 text-[#666666]">
              <h2 className="text-base font-semibold text-[#333333]">交付说明</h2>
              <p className="mt-2">
                交付内容包含对应成品、使用教程、1次免费修改；售后范围为成品正常使用故障，不包含需求变更后的修改；交付周期按您选择的周期执行。
              </p>
              {submitMessage && <p className="mt-3 text-[#165DFF]">{submitMessage}</p>}
            </div>

            <div className="mt-8 text-center">
              <img
                src={qrcodeFallback ? "/assets/wechat-qr-placeholder.svg" : "/assets/Image/qrcode.png"}
                alt="微信二维码"
                className="mx-auto h-36 w-36 rounded-lg border border-[#E0E6ED] bg-white p-1"
                onError={() => setQrcodeFallback(true)}
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
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-white to-[#E8F3FF] px-4 pb-16 pt-24 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl bg-gradient-to-r from-[#165DFF] to-[#4080FF] p-7 text-white shadow-[0_10px_30px_rgba(22,93,255,0.2)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">AI提效工具定制需求提交</h1>
              <p className="mt-2 text-sm text-[#E8F3FF]">层层选择，精准锁定需求，自动生成报价</p>
            </div>
            <button
              onClick={() => onNavigate("home")}
              className="rounded-lg border border-white/40 px-4 py-2 text-sm text-white transition hover:bg-white/15"
            >
              返回首页
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
          <article className="rounded-2xl border border-[#DCE6FA] bg-white p-7 shadow-[0_12px_30px_rgba(22,93,255,0.1)] md:p-8">
            <div className="rounded-xl bg-[#F5F7FA] p-4">
              <p className="text-xs font-semibold text-[#165DFF]">{stepTitles[step - 1]}</p>
              <p className="mt-1 text-sm text-[#666666]">每步均可返回修改，提交后自动生成精准报价。</p>
            </div>

            {1 === step && (
              <div className="mt-6 space-y-4">
                {requirementOptions.map((item) => (
                  <StepOptionCard
                    key={item.id}
                    title={item.label}
                    desc={item.desc}
                    extra={`基础报价：${formatPrice(item.base.min)} - ${formatPrice(item.base.max)}`}
                    selected={item.id === formData.requirementType}
                    onClick={() => setFormData({ ...formData, requirementType: item.id })}
                  />
                ))}
              </div>
            )}

            {2 === step && (
              <div className="mt-6 space-y-4">
                {scenarioOptions.map((item) => (
                  <StepOptionCard
                    key={item.id}
                    title={item.label}
                    desc={item.desc}
                    selected={item.id === formData.scenario}
                    onClick={() => setFormData({ ...formData, scenario: item.id })}
                  />
                ))}
              </div>
            )}

            {3 === step && (
              <div className="mt-6 space-y-4">
                {complexityOptions.map((item) => (
                  <StepOptionCard
                    key={item.id}
                    title={item.label}
                    desc={item.desc}
                    selected={item.id === formData.complexity}
                    onClick={() => setFormData({ ...formData, complexity: item.id })}
                  />
                ))}
              </div>
            )}

            {4 === step && (
              <div className="mt-6 space-y-4">
                {timelineOptions.map((item) => (
                  <StepOptionCard
                    key={item.id}
                    title={item.label}
                    desc={item.desc}
                    selected={item.id === formData.timeline}
                    onClick={() => setFormData({ ...formData, timeline: item.id })}
                  />
                ))}
              </div>
            )}

            {5 === step && (
              <div className="mt-6 space-y-5">
                <div className="rounded-xl border border-[#E0E6ED] bg-[#F5F7FA] p-4">
                  <label className="mb-2 block text-sm font-semibold text-[#333333]">补充说明（可选）</label>
                  <textarea
                    value={formData.note}
                    onChange={(event) => setFormData({ ...formData, note: event.target.value })}
                    placeholder="请填写额外需求、特殊要求，无则留空"
                    className="h-32 w-full rounded-lg border border-[#E0E6ED] bg-white p-3 text-sm text-[#333333] outline-none transition focus:border-[#165DFF]"
                  />
                </div>
                <div className="rounded-xl border border-[#E0E6ED] bg-[#F5F7FA] p-4">
                  <label className="mb-2 block text-sm font-semibold text-[#333333]">联系方式（可选）</label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      onClick={() => setFormData({ ...formData, contactType: "wechat" })}
                      className={`rounded-lg border p-3 text-sm ${
                        "wechat" === formData.contactType
                          ? "border-[#165DFF] bg-gradient-to-r from-[#E8F3FF] to-white text-[#165DFF]"
                          : "border-[#E0E6ED] bg-white text-[#666666]"
                      }`}
                    >
                      微信
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, contactType: "email" })}
                      className={`rounded-lg border p-3 text-sm ${
                        "email" === formData.contactType
                          ? "border-[#165DFF] bg-gradient-to-r from-[#E8F3FF] to-white text-[#165DFF]"
                          : "border-[#E0E6ED] bg-white text-[#666666]"
                      }`}
                    >
                      邮箱
                    </button>
                  </div>
                  <input
                    value={formData.contactValue}
                    onChange={(event) => setFormData({ ...formData, contactValue: event.target.value })}
                    placeholder="便于后续精准沟通，无则留空"
                    className="mt-3 w-full rounded-lg border border-[#E0E6ED] bg-white p-3 text-sm text-[#333333] outline-none transition focus:border-[#165DFF]"
                  />
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={1 === step}
                className={`rounded-lg px-4 py-2 text-sm ${
                  1 === step ? "bg-[#F1F2F4] text-[#A2A7B0]" : "bg-[#E8F3FF] text-[#165DFF] hover:bg-[#DDEEFF]"
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
                      ? "bg-gradient-to-r from-[#165DFF] to-[#4080FF] text-white shadow-[0_8px_20px_rgba(22,93,255,0.25)]"
                      : "bg-[#E0E6ED] text-[#999999]"
                  }`}
                >
                  下一步
                </button>
              ) : (
                <button
                  onClick={submitDemand}
                  disabled={isSubmitting}
                  className="rounded-lg bg-gradient-to-r from-[#165DFF] to-[#4080FF] px-5 py-2 text-sm font-medium text-white shadow-[0_8px_20px_rgba(22,93,255,0.25)] disabled:opacity-60"
                >
                  {isSubmitting ? "提交中..." : "提交需求，获取精准报价"}
                </button>
              )}
            </div>
          </article>

          <aside className="rounded-2xl border border-[#DCE6FA] bg-white p-5 shadow-[0_12px_30px_rgba(22,93,255,0.1)] lg:sticky lg:top-24 lg:h-fit">
            <h2 className="text-base font-semibold text-[#165DFF]">实时报价面板</h2>
            <p className="mt-1 text-xs text-[#666666]">每完成一步都会实时更新。</p>
            <ul className="mt-4 space-y-2 text-xs text-[#666666]">
              {selectedSummary.slice(0, 4).map((item) => (
                <li key={item.label} className="flex items-start gap-2 rounded-md bg-[#F5F7FA] p-2">
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
              <p className="mt-2 text-[11px] text-[#E8F3FF]">当前报价为系统评估价，请以实际沟通价格为准。</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
