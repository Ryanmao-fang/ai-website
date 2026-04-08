export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export class ApiNetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiNetworkError";
  }
}

async function request(path: string, init?: RequestInit, token?: string) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init?.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers,
    });
  } catch (e) {
    const err = e as Error;
    throw new ApiNetworkError(
      err?.message?.includes("fetch") || "Failed to fetch" === err?.message
        ? "网络无法连接服务器，请检查本机网络、接口域名与安全策略配置。"
        : err?.message || "网络异常"
    );
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = (payload as { error?: string })?.error || `请求失败（${response.status}）`;
    const err = new Error(msg) as Error & { status: number };
    err.status = response.status;
    throw err;
  }
  return payload;
}

export const apiClient = {
  getMe: (token: string) => request("/api/auth/me", { method: "GET" }, token),
  getFavorites: (token: string) => request("/api/favorites", { method: "GET" }, token),
  toggleFavorite: (token: string, body: { targetType: "term" | "tool"; targetId: string }) =>
    request("/api/favorites/toggle", { method: "POST", body: JSON.stringify(body) }, token),
  createMembershipOrder: (
    token: string,
    body: {
      plan: "monthly" | "yearly";
      planTier?: "standard" | "pro";
      payChannel?: "mock" | "alipay_pc" | "alipay_wap" | "wechat_native";
    }
  ) => request("/api/payment/create-order", { method: "POST", body: JSON.stringify(body) }, token),
  getPaymentOrder: (token: string, orderId: string) =>
    request(`/api/payment/order/${encodeURIComponent(orderId)}`, { method: "GET" }, token),
  getMyOrders: (token: string) => request("/api/payment/my-orders", { method: "GET" }, token),

  getLearningProgress: (token: string) => request("/api/learning/progress", { method: "GET" }, token),
  saveLearningProgress: (
    token: string,
    body: { level: string; itemType: string; itemId: number; completed: boolean }
  ) => request("/api/learning/progress", { method: "POST", body: JSON.stringify(body) }, token),

  listMyTickets: (token: string) => request("/api/tickets/mine", { method: "GET" }, token),
  createTicket: (token: string, body: { category: string; title: string; body: string }) =>
    request("/api/tickets/", { method: "POST", body: JSON.stringify(body) }, token),

  postContentHelpful: (
    token: string,
    body: { targetType: string; targetId: string; helpful: boolean; comment?: string }
  ) => request("/api/content/helpful", { method: "POST", body: JSON.stringify(body) }, token),
  getContentFeedbackStats: (targetType: string, targetId: string) =>
    request(`/api/content/stats/${encodeURIComponent(targetType)}/${encodeURIComponent(targetId)}`, {
      method: "GET",
    }),

  rateTool: (token: string, body: { toolId: string; stars: number }) =>
    request("/api/tool-ratings/rate", { method: "POST", body: JSON.stringify(body) }, token),
  getToolRatingSummary: (toolId: string) =>
    request(`/api/tool-ratings/summary/${encodeURIComponent(toolId)}`, { method: "GET" }),
  getMyToolRating: (token: string, toolId: string) =>
    request(`/api/tool-ratings/mine/${encodeURIComponent(toolId)}`, { method: "GET" }, token),
};
