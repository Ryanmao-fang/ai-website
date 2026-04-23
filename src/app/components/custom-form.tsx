import { useEffect, useMemo, useRef, useState } from "react";
import { SITE_CONFIG } from "../../config/siteConfig";

interface CustomFormProps {
  onNavigate: (page: "home" | "custom") => void;
}

interface QuoteBreakdownItem {
  name: string;
  detail: string;
}

interface QuoteData {
  min: number;
  max: number;
  currency: string;
  deliveryDays: string;
  breakdown: QuoteBreakdownItem[];
}

interface AgentResult {
  summary: string;
  solution: string[];
  quotation: QuoteData | null;
  wechatGuide: string;
  conversationId: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  at: string;
  result?: AgentResult;
}

function formatPrice(value: number, currency = "CNY"): string {
  try {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch (_error) {
    return `¥${value.toLocaleString("zh-CN")}`;
  }
}

function createSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function sanitizeInput(value: string): string {
  return value.replace(/[<>]/g, "").trim().slice(0, 1200);
}

export default function CustomForm({ onNavigate }: CustomFormProps) {
  const [input, setInput] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [qrcodeFallback, setQrcodeFallback] = useState<boolean>(false);
  const [conversationId, setConversationId] = useState<string>("");
  const [sessionId] = useState<string>(() => createSessionId());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messageContainerRef = useRef<HTMLDivElement | null>(null);

  const starterPrompts = useMemo(() => {
    const list = SITE_CONFIG.agentStarterPrompts;
    return Array.isArray(list) ? [...list] : [];
  }, []);

  const backdropUrl = useMemo(() => {
    const custom = SITE_CONFIG.customAgentBackdropImage;
    if ("string" === typeof custom && custom.trim().length > 0) {
      return custom.trim();
    }
    return SITE_CONFIG.heroBackgroundImage;
  }, []);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  const latestResult = useMemo(() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index].result) {
        return messages[index].result as AgentResult;
      }
    }
    return null;
  }, [messages]);

  const sendMessage = async (rawText?: string) => {
    const candidate = typeof rawText === "string" ? rawText : input;
    const cleanText = sanitizeInput(candidate);
    if (!cleanText || isSending) {
      return;
    }

    setErrorMessage("");
    setInput("");
    const userMessage: ChatMessage = {
      role: "user",
      content: cleanText,
      at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsSending(true);

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
      const response = await fetch(`${apiBaseUrl}/api/agent/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: cleanText,
          conversationId,
          sessionId,
          history: messages.map((item) => ({ role: item.role, content: item.content })),
        }),
      });
      const result = await response.json().catch(() => ({} as Record<string, unknown>));
      if (!response.ok || true !== result.ok) {
        const failReason = typeof result.error === "string" ? result.error : "Agent请求失败，请稍后重试。";
        setErrorMessage(failReason);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "当前网络波动，暂时无法完成完整分析。你可以再发一次，我会继续基于已有内容给方案。",
            at: new Date().toISOString(),
          },
        ]);
        return;
      }

      const nextConversationId = typeof result.conversationId === "string" ? result.conversationId : "";
      if (nextConversationId) {
        setConversationId(nextConversationId);
      }

      const agentResult: AgentResult = {
        summary: typeof result.summary === "string" ? result.summary : "",
        solution: Array.isArray(result.solution) ? result.solution.filter((item) => "string" === typeof item) : [],
        quotation:
          result.quotation && "object" === typeof result.quotation
            ? {
                min: Number(result.quotation.min || 0),
                max: Number(result.quotation.max || 0),
                currency: String(result.quotation.currency || "CNY"),
                deliveryDays: String(result.quotation.deliveryDays || "待评估"),
                breakdown: Array.isArray(result.quotation.breakdown)
                  ? result.quotation.breakdown
                      .map((row) => ({
                        name: String(row?.name || ""),
                        detail: String(row?.detail || ""),
                      }))
                      .filter((row) => row.name || row.detail)
                  : [],
              }
            : null,
        wechatGuide:
          typeof result.wechatGuide === "string" && result.wechatGuide
            ? result.wechatGuide
            : "如果方案方向OK，添加微信进入下一轮细化。",
        conversationId: nextConversationId,
      };

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: typeof result.assistantMessage === "string" ? result.assistantMessage : "已生成需求分析结果。",
          at: new Date().toISOString(),
          result: agentResult,
        },
      ]);
    } catch (_error) {
      setErrorMessage("网络连接异常，请稍后重试。");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "当前网络异常，暂时无法连接Agent。你可以直接添加微信，我会人工先帮你梳理需求。",
          at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section
      className="relative min-h-screen px-4 pb-16 pt-24 md:px-6"
      style={{
        backgroundImage: `linear-gradient(165deg, rgba(6,11,26,0.94) 0%, rgba(11,18,40,0.92) 45%, rgba(16,26,53,0.9) 100%), url(${backdropUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0B1228]/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#7EA5FF]/90">CommonOnes · Agent</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#F4F7FF] md:text-3xl">定制需求智能体</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#AFC0E8]">
              对话由您在扣子中配置的智能体生成；本站仅负责会话展示与结构化结果面板。欢迎语与推荐问题以智能体回复为准。
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("home")}
            className="shrink-0 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-[#EAF1FF] transition hover:border-[#165DFF]/60 hover:bg-[#165DFF]/10"
          >
            返回首页
          </button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <article className="rounded-2xl border border-white/10 bg-[#0B1228]/75 p-4 shadow-[0_16px_48px_rgba(0,0,0,0.35)] backdrop-blur-md md:p-6">
            <div
              ref={messageContainerRef}
              className="h-[520px] overflow-y-auto rounded-xl border border-white/10 bg-[#060B18]/85 p-4 md:h-[600px]"
            >
              <div className="space-y-4">
                {0 === messages.length && !isSending && (
                  <div className="rounded-xl border border-dashed border-[#2A3E6A] bg-[#101A35]/60 p-6 text-center">
                    <p className="text-sm font-medium text-[#EAF1FF]">开始对话</p>
                    <p className="mt-2 text-xs leading-relaxed text-[#8FA3D6]">
                      发送第一条消息后，智能体会按扣子后台的人设、开场与流程回复。页面快捷按钮可在{" "}
                      <code className="rounded bg-[#0B1228] px-1.5 py-0.5 text-[11px] text-[#AFC0E8]">siteConfig.agentStarterPrompts</code>{" "}
                      中按需配置；留空则不显示，避免与扣子推荐重复。
                    </p>
                  </div>
                )}
                {messages.map((message, index) => (
                  <div key={`${message.at}-${index}`} className={`flex ${"user" === message.role ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[min(92%,42rem)] rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm ${
                        "user" === message.role
                          ? "bg-gradient-to-br from-[#165DFF] to-[#2B6BFF] text-white"
                          : "border border-white/10 bg-[#121C33]/95 text-[#EAF1FF]"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words [word-break:break-word]">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl border border-white/10 bg-[#121C33]/95 px-4 py-3 text-sm text-[#AFC0E8]">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-[#165DFF]" />
                        正在等待智能体回复…
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {starterPrompts.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="rounded-full border border-white/12 bg-[#101A35]/80 px-3 py-1.5 text-xs text-[#C8D6F5] transition hover:border-[#165DFF]/50 hover:text-white"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 rounded-xl border border-white/10 bg-[#060B18]/80 p-3">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value.slice(0, 1200))}
                placeholder="请描述你的目标、应用场景、预算范围、预计上线时间…"
                className="h-28 w-full resize-none rounded-lg border border-white/10 bg-[#101A35]/90 p-3 text-sm text-[#EAF1FF] outline-none transition placeholder:text-[#6E7EA8] focus:border-[#165DFF]/70 focus:ring-1 focus:ring-[#165DFF]/30"
              />
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-[#8FA3D6]">{input.trim().length}/1200</p>
                <button
                  type="button"
                  onClick={() => sendMessage()}
                  disabled={isSending || !input.trim()}
                  className={`rounded-lg px-5 py-2 text-sm font-semibold ${
                    !isSending && !!input.trim()
                      ? "bg-gradient-to-r from-[#165DFF] to-[#3B74FF] text-white shadow-[0_8px_24px_rgba(22,93,255,0.35)]"
                      : "cursor-not-allowed bg-[#1A243D] text-[#6E7EA8]"
                  }`}
                >
                  {isSending ? "发送中…" : "发送"}
                </button>
              </div>
              {!!errorMessage && <p className="mt-3 text-xs text-[#FF9A8B]">{errorMessage}</p>}
            </div>
          </article>

          <aside className="rounded-2xl border border-white/10 bg-[#0B1228]/80 p-5 shadow-[0_16px_48px_rgba(0,0,0,0.35)] backdrop-blur-md lg:sticky lg:top-24 lg:h-fit">
            <h2 className="text-base font-semibold text-[#7EA5FF]">结构化结果</h2>
            {!latestResult && (
              <p className="mt-3 text-sm leading-relaxed text-[#AFC0E8]">
                发送需求后，若智能体按约定返回 JSON 结构，这里会同步展示需求总结、方案要点与报价区间。
              </p>
            )}

            {!!latestResult?.summary && (
              <div className="mt-4 rounded-lg border border-[#22345F] bg-[#0B1228] p-4">
                <p className="text-xs font-semibold text-[#7EA5FF]">需求总结</p>
                <p className="mt-2 text-sm leading-7 text-[#EAF1FF]">{latestResult.summary}</p>
              </div>
            )}

            {!!latestResult?.solution?.length && (
              <div className="mt-4 rounded-lg border border-[#22345F] bg-[#0B1228] p-4">
                <p className="text-xs font-semibold text-[#7EA5FF]">解决方案</p>
                <ul className="mt-2 space-y-2 text-sm text-[#EAF1FF]">
                  {latestResult.solution.map((item, index) => (
                    <li key={`${item}-${index}`} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#165DFF]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!!latestResult?.quotation && (
              <div className="mt-4 rounded-xl bg-gradient-to-r from-[#165DFF] to-[#4080FF] p-4 text-white">
                <p className="text-xs text-[#E8F3FF]">报价区间（初步）</p>
                <p className="mt-2 text-xl font-bold">
                  {formatPrice(latestResult.quotation.min, latestResult.quotation.currency)} -{" "}
                  {formatPrice(latestResult.quotation.max, latestResult.quotation.currency)}
                </p>
                <p className="mt-1 text-xs text-[#E8F3FF]">预计交付周期：{latestResult.quotation.deliveryDays}</p>
                {!!latestResult.quotation.breakdown.length && (
                  <ul className="mt-3 space-y-1 text-xs text-[#E8F3FF]">
                    {latestResult.quotation.breakdown.map((item, index) => (
                      <li key={`${item.name}-${index}`}>- {item.name}：{item.detail}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="mt-5 rounded-lg border border-[#22345F] bg-[#0B1228] p-4 text-center">
              <img
                src={qrcodeFallback ? "/assets/wechat-qr-placeholder.svg" : SITE_CONFIG.wechatQrImage}
                alt="微信二维码"
                loading="lazy"
                className="mx-auto h-28 w-28 rounded-lg border border-[#22345F] bg-[#101A35] p-1"
                onError={() => setQrcodeFallback(true)}
              />
              <p className="mt-3 text-xs leading-6 text-[#AFC0E8]">
                {latestResult?.wechatGuide || "方案满意后可添加微信，进入下一轮需求细化与合同报价。"}
              </p>
              <p className="mt-2 text-xs font-semibold text-[#165DFF]">{SITE_CONFIG.leadIntro}</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
