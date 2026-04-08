import { apiBaseUrl } from "@/lib/api";

async function adminRequest(path: string, token: string, init?: RequestInit) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init?.headers || {}),
    Authorization: `AdminBearer ${token}`,
  };
  const resp = await fetch(`${apiBaseUrl}${path}`, { ...init, headers });
  const payload = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const msg = (payload as { error?: string })?.error || `请求失败（${resp.status}）`;
    const err = new Error(msg) as Error & { status?: number };
    err.status = resp.status;
    throw err;
  }
  return payload;
}

export const adminApi = {
  me: (token: string) => adminRequest("/api/admin/me", token, { method: "GET" }),

  listTerms: (token: string, params?: { q?: string; status?: string }) => {
    const q = params?.q ? `q=${encodeURIComponent(params.q)}` : "";
    const st = params?.status ? `status=${encodeURIComponent(params.status)}` : "";
    const join = [q, st].filter(Boolean).join("&");
    const url = join ? `/api/admin/terms?${join}` : "/api/admin/terms";
    return adminRequest(url, token, { method: "GET" });
  },
  getTerm: (token: string, id: string) => adminRequest(`/api/admin/terms/${encodeURIComponent(id)}`, token, { method: "GET" }),
  createTerm: (token: string, body: unknown) =>
    adminRequest("/api/admin/terms", token, { method: "POST", body: JSON.stringify(body) }),
  updateTerm: (token: string, id: string, body: unknown) =>
    adminRequest(`/api/admin/terms/${encodeURIComponent(id)}`, token, { method: "PUT", body: JSON.stringify(body) }),
  deleteTerm: (token: string, id: string) => adminRequest(`/api/admin/terms/${encodeURIComponent(id)}`, token, { method: "DELETE" }),
  batchTerms: (token: string, body: { ids: number[]; action: "publish" | "unpublish" | "delete" }) =>
    adminRequest("/api/admin/terms/batch", token, { method: "POST", body: JSON.stringify(body) }),
  importTerms: (token: string, body: { items: unknown[]; mode?: "upsert" | "insert_only" }) =>
    adminRequest("/api/admin/terms/import", token, { method: "POST", body: JSON.stringify(body) }),

  listTools: (token: string, params?: { q?: string; status?: string }) => {
    const q = params?.q ? `q=${encodeURIComponent(params.q)}` : "";
    const st = params?.status ? `status=${encodeURIComponent(params.status)}` : "";
    const join = [q, st].filter(Boolean).join("&");
    const url = join ? `/api/admin/tools?${join}` : "/api/admin/tools";
    return adminRequest(url, token, { method: "GET" });
  },
  getTool: (token: string, id: string) => adminRequest(`/api/admin/tools/${encodeURIComponent(id)}`, token, { method: "GET" }),
  createTool: (token: string, body: unknown) =>
    adminRequest("/api/admin/tools", token, { method: "POST", body: JSON.stringify(body) }),
  updateTool: (token: string, id: string, body: unknown) =>
    adminRequest(`/api/admin/tools/${encodeURIComponent(id)}`, token, { method: "PUT", body: JSON.stringify(body) }),
  deleteTool: (token: string, id: string) => adminRequest(`/api/admin/tools/${encodeURIComponent(id)}`, token, { method: "DELETE" }),
  batchTools: (token: string, body: { ids: number[]; action: "publish" | "unpublish" | "delete" }) =>
    adminRequest("/api/admin/tools/batch", token, { method: "POST", body: JSON.stringify(body) }),
  importTools: (token: string, body: { items: unknown[]; mode?: "upsert" | "insert_only" }) =>
    adminRequest("/api/admin/tools/import", token, { method: "POST", body: JSON.stringify(body) }),

  listTemplates: (token: string, params?: { q?: string; status?: string }) => {
    const q = params?.q ? `q=${encodeURIComponent(params.q)}` : "";
    const st = params?.status ? `status=${encodeURIComponent(params.status)}` : "";
    const join = [q, st].filter(Boolean).join("&");
    const url = join ? `/api/admin/templates?${join}` : "/api/admin/templates";
    return adminRequest(url, token, { method: "GET" });
  },
  getTemplate: (token: string, id: string) => adminRequest(`/api/admin/templates/${encodeURIComponent(id)}`, token, { method: "GET" }),
  createTemplate: (token: string, body: unknown) =>
    adminRequest("/api/admin/templates", token, { method: "POST", body: JSON.stringify(body) }),
  updateTemplate: (token: string, id: string, body: unknown) =>
    adminRequest(`/api/admin/templates/${encodeURIComponent(id)}`, token, { method: "PUT", body: JSON.stringify(body) }),
  deleteTemplate: (token: string, id: string) => adminRequest(`/api/admin/templates/${encodeURIComponent(id)}`, token, { method: "DELETE" }),
  batchTemplates: (token: string, body: { ids: number[]; action: "publish" | "unpublish" | "delete" }) =>
    adminRequest("/api/admin/templates/batch", token, { method: "POST", body: JSON.stringify(body) }),
  importTemplates: (token: string, body: { items: unknown[]; mode?: "upsert" | "insert_only" }) =>
    adminRequest("/api/admin/templates/import", token, { method: "POST", body: JSON.stringify(body) }),

  listLearningPaths: (token: string, params?: { q?: string; status?: string }) => {
    const q = params?.q ? `q=${encodeURIComponent(params.q)}` : "";
    const st = params?.status ? `status=${encodeURIComponent(params.status)}` : "";
    const join = [q, st].filter(Boolean).join("&");
    const url = join ? `/api/admin/learning-paths?${join}` : "/api/admin/learning-paths";
    return adminRequest(url, token, { method: "GET" });
  },
  getLearningPath: (token: string, id: string) =>
    adminRequest(`/api/admin/learning-paths/${encodeURIComponent(id)}`, token, { method: "GET" }),
  createLearningPath: (token: string, body: unknown) =>
    adminRequest("/api/admin/learning-paths", token, { method: "POST", body: JSON.stringify(body) }),
  updateLearningPath: (token: string, id: string, body: unknown) =>
    adminRequest(`/api/admin/learning-paths/${encodeURIComponent(id)}`, token, { method: "PUT", body: JSON.stringify(body) }),
  deleteLearningPath: (token: string, id: string) =>
    adminRequest(`/api/admin/learning-paths/${encodeURIComponent(id)}`, token, { method: "DELETE" }),
  batchLearningPaths: (token: string, body: { ids: number[]; action: "publish" | "unpublish" | "delete" }) =>
    adminRequest("/api/admin/learning-paths/batch", token, { method: "POST", body: JSON.stringify(body) }),
  importLearningPaths: (token: string, body: { items: unknown[]; mode?: "upsert" | "insert_only" }) =>
    adminRequest("/api/admin/learning-paths/import", token, { method: "POST", body: JSON.stringify(body) }),

  createAssetUploadUrl: (token: string, body: unknown) =>
    adminRequest("/api/admin/assets/upload-url", token, { method: "POST", body: JSON.stringify(body) }),
  recordAsset: (token: string, body: unknown) =>
    adminRequest("/api/admin/assets/record", token, { method: "POST", body: JSON.stringify(body) }),
  listAssets: (token: string, q?: string) => {
    const url = q ? `/api/admin/assets?q=${encodeURIComponent(q)}` : "/api/admin/assets";
    return adminRequest(url, token, { method: "GET" });
  },

  listUsers: (token: string, params?: { page?: number; perPage?: number }) => {
    const p = params?.page ? `page=${params.page}` : "";
    const pp = params?.perPage ? `perPage=${params.perPage}` : "";
    const join = [p, pp].filter(Boolean).join("&");
    const url = join ? `/api/admin/users?${join}` : "/api/admin/users";
    return adminRequest(url, token, { method: "GET" });
  },
  setUserAdmin: (token: string, userId: string, body: unknown) =>
    adminRequest(`/api/admin/users/${encodeURIComponent(userId)}/set-admin`, token, { method: "POST", body: JSON.stringify(body) }),
  grantMembership: (token: string, userId: string, body: unknown) =>
    adminRequest(`/api/admin/users/${encodeURIComponent(userId)}/membership`, token, { method: "POST", body: JSON.stringify(body) }),

  listOrders: (token: string, params?: { status?: string; channel?: string; limit?: number }) => {
    const st = params?.status ? `status=${encodeURIComponent(params.status)}` : "";
    const ch = params?.channel ? `channel=${encodeURIComponent(params.channel)}` : "";
    const l = params?.limit ? `limit=${params.limit}` : "";
    const join = [st, ch, l].filter(Boolean).join("&");
    const url = join ? `/api/admin/orders?${join}` : "/api/admin/orders";
    return adminRequest(url, token, { method: "GET" });
  },

  listTickets: (token: string, params?: { status?: string; limit?: number }) => {
    const st = params?.status ? `status=${encodeURIComponent(params.status)}` : "";
    const l = params?.limit ? `limit=${params.limit}` : "";
    const join = [st, l].filter(Boolean).join("&");
    const url = join ? `/api/admin/tickets?${join}` : "/api/admin/tickets";
    return adminRequest(url, token, { method: "GET" });
  },
  updateTicket: (token: string, id: string, body: unknown) =>
    adminRequest(`/api/admin/tickets/${encodeURIComponent(id)}`, token, { method: "POST", body: JSON.stringify(body) }),

  workflowTransition: (
    token: string,
    resource: "terms" | "tools" | "templates" | "learning-paths",
    id: string,
    body: { action: string; note?: string }
  ) =>
    adminRequest(
      `/api/admin/workflow/${resource}/${encodeURIComponent(id)}/transition`,
      token,
      { method: "POST", body: JSON.stringify(body) }
    ),

  workflowSchedule: (
    token: string,
    resource: "terms" | "tools" | "templates" | "learning-paths",
    id: string,
    body: { publishAt?: string | null; unpublishAt?: string | null }
  ) =>
    adminRequest(
      `/api/admin/workflow/${resource}/${encodeURIComponent(id)}/schedule`,
      token,
      { method: "POST", body: JSON.stringify(body) }
    ),

  opsOverview: (token: string) => adminRequest("/api/admin/ops/overview", token, { method: "GET" }),

  opsAuditLogs: (token: string, limit?: number) => {
    const q = limit ? `?limit=${limit}` : "";
    return adminRequest(`/api/admin/ops/audit-logs${q}`, token, { method: "GET" });
  },

  opsRunScheduleOnce: (token: string) =>
    adminRequest("/api/admin/ops/schedule/run-once", token, { method: "POST", body: "{}" }),

  termQuality: (token: string, id: string) =>
    adminRequest(`/api/admin/terms/${encodeURIComponent(id)}/quality`, token, { method: "GET" }),

  toolQuality: (token: string, id: string) =>
    adminRequest(`/api/admin/tools/${encodeURIComponent(id)}/quality`, token, { method: "GET" }),
};

