const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

async function request(path: string, init?: RequestInit, token?: string) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init?.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Request failed");
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
    request(`/api/payment/order/${orderId}`, { method: "GET" }, token),
};
