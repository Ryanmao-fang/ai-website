import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../lib/adminApi";
import { useAdmin } from "../../context/AdminContext";

function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) {
    return "";
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { termsCatalog } from "@/content/termsCatalog";
import { Link } from "react-router";
import { parseJsonOrCsv, type ImportMode } from "../../lib/importParsers";
import { CmsImageUrlField } from "../../components/CmsImageUrlField";
import { CmsMarkdownToolbar } from "../../components/CmsMarkdownToolbar";

type TermRow = {
  id: number;
  slug: string;
  name: string;
  description: string;
  category: string;
  status: string;
  updated_at: string;
};

export function AdminTerms() {
  const { token, profile } = useAdmin();
  const [items, setItems] = useState<TermRow[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | "draft" | "review" | "approved" | "published">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [importing, setImporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [importText, setImportText] = useState("");
  const [importMode, setImportMode] = useState<ImportMode>("upsert");
  const [importHint, setImportHint] = useState("");
  const [failedRows, setFailedRows] = useState<{ index: number; slug: string; reason: string; raw?: any }[]>([]);

  const filtered = useMemo(() => items, [items]);

  const reload = async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = await adminApi.listTerms(token, { q, status: status || undefined });
      setItems(((payload as any)?.items || []) as TermRow[]);
    } catch (e) {
      setError((e as Error)?.message || "加载失败");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelected = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const doBatch = async (action: "publish" | "unpublish" | "delete") => {
    if (!token || 0 === selectedIds.length) {
      return;
    }
    if ("delete" === action && !window.confirm(`确认批量删除 ${selectedIds.length} 条名词吗？`)) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      await adminApi.batchTerms(token, { ids: selectedIds, action });
      setSelectedIds([]);
      await reload();
    } catch (e) {
      setError((e as Error)?.message || "批量操作失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildTermPayload = () => {
    if (!editing) {
      return null;
    }
    const aliases = String(editing.aliasesText || "")
      .split(/[\n,，、]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const practicalActions = (editing.practicalActions || []).filter((p: any) => p && String(p.name || "").trim());
    const examples = (editing.examples || []).filter((e: any) => e && (String(e.title || "").trim() || String(e.content || "").trim()));
    const references = (editing.references || []).filter((r: any) => r && String(r.url || "").trim());
    const relatedTerms = (editing.relatedTerms || []).filter((r: any) => r && String(r.slug || "").trim());
    const relatedToolLinks = (editing.relatedToolLinks || []).filter((t: any) => t && String(t.href || "").trim());
    const contentJson = {
      ...(editing.contentJson || {}),
      simpleExplanation: String(editing.simpleExplanation || ""),
      practicalActions,
      examples,
      references,
      aliases,
      relatedTerms,
      relatedToolLinks,
    };
    return { ...editing, contentJson };
  };

  const saveEditing = async () => {
    if (!token || !editing) {
      return;
    }
    const payload = buildTermPayload();
    if (!payload) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (editing.id) {
        await adminApi.updateTerm(token, String(editing.id), payload);
      } else {
        await adminApi.createTerm(token, payload);
      }
      setEditing(null);
      await reload();
    } catch (e) {
      setError((e as Error)?.message || "保存失败");
    } finally {
      setLoading(false);
    }
  };

  const removeEditing = async () => {
    if (!token || !editing?.id) {
      return;
    }
    if (!window.confirm(`确认删除名词「${editing.name || editing.slug}」吗？`)) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      await adminApi.deleteTerm(token, String(editing.id));
      setEditing(null);
      await reload();
    } catch (e) {
      setError((e as Error)?.message || "删除失败");
    } finally {
      setLoading(false);
    }
  };

  const openEditorById = async (id: number) => {
    if (!token) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = await adminApi.getTerm(token, String(id));
      const item = (payload as any)?.item;
      if (!item) {
        throw new Error("未获取到详情数据");
      }
      const cj = (item.content_json || {}) as any;
      setEditing({
        id: item.id,
        slug: item.slug || "",
        name: item.name || "",
        description: item.description || "",
        category: item.category || "",
        readingMinutes: Number(item.reading_minutes || 5),
        coverImageUrl: item.cover_image_url || "",
        contentMarkdown: item.content_markdown || "",
        contentJson: item.content_json || {},
        status: item.status || "draft",
        contentVersion: item.content_version || "",
        publishAt: toDatetimeLocalValue(item.publish_at),
        unpublishAt: toDatetimeLocalValue(item.unpublish_at),
        simpleExplanation: String(cj.simpleExplanation || ""),
        practicalActions: Array.isArray(cj.practicalActions) ? cj.practicalActions : [],
        examples: Array.isArray(cj.examples) ? cj.examples : [],
        references: Array.isArray(cj.references) ? cj.references : [],
        aliasesText: Array.isArray(cj.aliases) ? cj.aliases.join("\n") : "",
        relatedTerms: Array.isArray(cj.relatedTerms) ? cj.relatedTerms : [],
        relatedToolLinks: Array.isArray(cj.relatedToolLinks) ? cj.relatedToolLinks : [],
      });
    } catch (e) {
      setError((e as Error)?.message || "加载详情失败");
    } finally {
      setLoading(false);
    }
  };

  const buildMarkdownFromStatic = (item: any) => {
    const lines: string[] = [];
    lines.push(`# ${item.name}`);
    lines.push("");
    lines.push("## 一句话理解");
    lines.push(item.simpleExplanation || item.description || "");
    lines.push("");
    lines.push("## 示例");
    for (const ex of item.examples || []) {
      lines.push(`### ${ex.title}`);
      lines.push(ex.content || "");
      lines.push("");
    }
    return lines.join("\n");
  };

  const importStaticTerms = async () => {
    if (!token) {
      return;
    }
    setImporting(true);
    setError("");
    try {
      const payload = await adminApi.listTerms(token);
      const existing = ((payload as any)?.items || []) as TermRow[];
      const slugSet = new Set(existing.map((x) => String(x.slug || "").trim().toLowerCase()));
      let created = 0;
      for (const t of termsCatalog) {
        const slug = String(t.slug || "").trim().toLowerCase();
        if (!slug || slugSet.has(slug)) {
          continue;
        }
        await adminApi.createTerm(token, {
          slug: t.slug,
          name: t.name,
          description: t.description,
          category: t.category,
          readingMinutes: t.readingMinutes || 5,
          coverImageUrl: t.image || "",
          contentMarkdown: buildMarkdownFromStatic(t),
          contentJson: {
            simpleExplanation: t.simpleExplanation || "",
            examples: t.examples || [],
            aliases: t.aliases || [],
            references: t.references || [],
          },
          status: "published",
          contentVersion: t.contentVersion || "static-migrated",
        });
        slugSet.add(slug);
        created += 1;
      }
      await reload();
      alert(`静态词库迁移完成：新增 ${created} 条，重复已跳过。`);
    } catch (e) {
      setError((e as Error)?.message || "迁移失败");
    } finally {
      setImporting(false);
    }
  };

  const importFromText = async () => {
    if (!token || !importText.trim()) {
      return;
    }
    setImporting(true);
    setError("");
    setImportHint("");
    setFailedRows([]);
    try {
      const items = parseJsonOrCsv(importText) as any[];
      if (!items.length) {
        throw new Error("导入内容为空或格式不正确");
      }
      const resp = (await adminApi.importTerms(token, { items, mode: importMode })) as any;
      setImportText("");
      await reload();
      setImportHint(`总计 ${Number(resp?.total || items.length)} 条，成功 ${Number(resp?.success || 0)} 条，失败 ${Number(resp?.failed || 0)} 条`);
      setFailedRows(Array.isArray(resp?.failedRows) ? resp.failedRows : []);
    } catch (e) {
      setError((e as Error)?.message || "导入失败");
    } finally {
      setImporting(false);
    }
  };

  const downloadFailedJson = () => {
    if (0 === failedRows.length) {
      return;
    }
    const blob = new Blob([JSON.stringify(failedRows, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `terms-import-failed-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const retryFailedRows = async () => {
    if (!token || 0 === failedRows.length) {
      return;
    }
    const retryItems = failedRows.map((f) => f.raw).filter(Boolean);
    if (0 === retryItems.length) {
      setError("失败项缺少原始数据，无法重试，请重新导入原文件。");
      return;
    }
    setImporting(true);
    setError("");
    try {
      const resp = (await adminApi.importTerms(token, { items: retryItems, mode: "upsert" })) as any;
      setImportHint(`重试完成：成功 ${Number(resp?.success || 0)} 条，失败 ${Number(resp?.failed || 0)} 条`);
      setFailedRows(Array.isArray(resp?.failedRows) ? resp.failedRows : []);
      await reload();
    } catch (e) {
      setError((e as Error)?.message || "重试失败");
    } finally {
      setImporting(false);
    }
  };

  const importFromFile = async (file: File | null) => {
    if (!file) {
      return;
    }
    const text = await file.text();
    setImportText(text);
  };

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl border-border p-5 bg-white">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px]">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索 slug / 名称 / 描述" className="rounded-full" />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="h-10 rounded-full border border-border bg-white px-4 text-sm"
          >
            <option value="">全部</option>
            <option value="draft">草稿</option>
            <option value="review">待审核</option>
            <option value="approved">已通过</option>
            <option value="published">已发布</option>
          </select>
          <Button className="rounded-full" onClick={() => void reload()} disabled={loading}>
            刷新
          </Button>
          <Button variant="outline" className="rounded-full" onClick={() => void importStaticTerms()} disabled={importing || loading}>
            {importing ? "迁移中…" : "一键迁移静态词库"}
          </Button>
          <Button
            className="rounded-full bg-primary hover:bg-accent"
            onClick={() =>
              setEditing({
                slug: "",
                name: "",
                description: "",
                category: "",
                readingMinutes: 5,
                coverImageUrl: "",
                contentMarkdown: "",
                contentJson: {},
                status: "published",
                contentVersion: "",
                publishAt: "",
                unpublishAt: "",
                simpleExplanation: "",
                practicalActions: [],
                examples: [],
                references: [],
                aliasesText: "",
                relatedTerms: [],
                relatedToolLinks: [],
              })
            }
          >
            新建
          </Button>
          <Button variant="outline" className="rounded-full" disabled={0 === selectedIds.length || loading} onClick={() => void doBatch("publish")}>
            批量发布({selectedIds.length})
          </Button>
          <Button variant="outline" className="rounded-full" disabled={0 === selectedIds.length || loading} onClick={() => void doBatch("unpublish")}>
            批量下线
          </Button>
          <Button variant="outline" className="rounded-full text-destructive" disabled={0 === selectedIds.length || loading} onClick={() => void doBatch("delete")}>
            批量删除
          </Button>
        </div>
        {error ? <p className="text-sm text-destructive mt-3">{error}</p> : null}
        <div className="mt-4">
          <p className="text-xs text-muted-foreground mb-2">批量导入（JSON数组或CSV，至少包含 slug,name）</p>
          <div className="flex flex-wrap gap-2 mb-2">
            <select
              value={importMode}
              onChange={(e) => setImportMode(e.target.value as ImportMode)}
              className="h-9 rounded-full border border-border bg-white px-3 text-xs"
            >
              <option value="upsert">upsert（按slug覆盖或新增）</option>
              <option value="insert_only">insert_only（仅新增）</option>
            </select>
            <label className="inline-flex">
              <input
                type="file"
                className="hidden"
                accept=".json,.csv,.txt"
                onChange={(e) => {
                  const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                  void importFromFile(f);
                }}
              />
              <span className="inline-flex items-center justify-center rounded-full border border-border px-3 h-9 text-xs cursor-pointer bg-white">
                读取本地文件
              </span>
            </label>
          </div>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            className="w-full rounded-2xl border border-border p-3 text-xs min-h-[120px] font-mono"
            placeholder={`JSON: [{"slug":"test","name":"测试","description":"...","category":"基础概念","status":"published"}]
CSV: slug,name,description,category,status`}
          />
          <div className="mt-2">
            <Button variant="outline" className="rounded-full" disabled={importing || loading || !importText.trim()} onClick={() => void importFromText()}>
              {importing ? "导入中…" : "执行批量导入"}
            </Button>
            {importHint ? <span className="text-xs text-emerald-600 ml-3">{importHint}</span> : null}
          </div>
          {failedRows.length > 0 ? (
            <div className="mt-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-xs text-destructive">失败明细（前20条）</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-full h-7 text-xs" onClick={downloadFailedJson}>
                    下载失败清单
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full h-7 text-xs" onClick={() => void retryFailedRows()} disabled={importing}>
                    一键重试失败项
                  </Button>
                </div>
              </div>
              <div className="space-y-1 max-h-40 overflow-auto">
                {failedRows.slice(0, 20).map((f) => (
                  <p key={`${f.index}-${f.slug}`} className="text-xs text-muted-foreground">
                    行 {f.index + 1} · {f.slug || "-"} · {f.reason}
                  </p>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Card>

      {editing ? (
        <Card className="rounded-3xl border-border p-5 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-foreground">{editing.id ? `编辑 #${editing.id}` : "新建名词"}</p>
            <div className="flex gap-2 items-center">
              {editing.slug ? (
                <Link to={`/term/${editing.slug}`} target="_blank" className="text-xs text-primary hover:underline">
                  打开主站页面
                </Link>
              ) : null}
              {editing.id ? (
                <Button variant="outline" className="rounded-full text-destructive" onClick={() => void removeEditing()} disabled={loading}>
                  删除
                </Button>
              ) : null}
              <Button variant="outline" className="rounded-full" onClick={() => setEditing(null)}>
                取消
              </Button>
              <Button className="rounded-full bg-primary hover:bg-accent" onClick={() => void saveEditing()} disabled={loading}>
                保存
              </Button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">slug</p>
              <Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="rounded-full" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">名称</p>
              <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="rounded-full" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">分类</p>
              <Input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="rounded-full" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">状态</p>
              <select
                value={editing.status}
                onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                className="h-10 rounded-full border border-border bg-white px-4 text-sm w-full"
              >
                <option value="draft">草稿</option>
                <option value="review">待审核</option>
                <option value="approved">已通过</option>
                <option value="published">已发布</option>
              </select>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">预计阅读（分钟）</p>
              <Input
                type="number"
                min={1}
                value={editing.readingMinutes}
                onChange={(e) => setEditing({ ...editing, readingMinutes: Number(e.target.value) || 5 })}
                className="rounded-full"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-4">
            <p className="text-sm font-medium text-foreground">主站详情页各区块（与 `/term/:slug` 对应）</p>
            <div>
              <p className="text-xs text-muted-foreground mb-1">标题下摘要</p>
              <textarea
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="w-full rounded-2xl border border-border p-3 text-sm min-h-[72px]"
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">一句话理解</p>
              <textarea
                value={editing.simpleExplanation || ""}
                onChange={(e) => setEditing({ ...editing, simpleExplanation: e.target.value })}
                className="w-full rounded-2xl border border-border p-3 text-sm min-h-[80px]"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">我能用它做什么？（标题、站内路径、按钮文案）</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full h-7 text-xs"
                  onClick={() =>
                    setEditing({
                      ...editing,
                      practicalActions: [...(editing.practicalActions || []), { name: "", href: "/templates", label: "查看" }],
                    })
                  }
                >
                  添加一行
                </Button>
              </div>
              <div className="space-y-2">
                {(editing.practicalActions || []).map((row: any, i: number) => (
                  <div key={i} className="grid md:grid-cols-3 gap-2 items-end">
                    <Input
                      placeholder="标题"
                      value={row.name || ""}
                      onChange={(e) => {
                        const next = [...(editing.practicalActions || [])];
                        next[i] = { ...next[i], name: e.target.value };
                        setEditing({ ...editing, practicalActions: next });
                      }}
                      className="rounded-full"
                    />
                    <Input
                      placeholder="路径 如 /templates"
                      value={row.href || ""}
                      onChange={(e) => {
                        const next = [...(editing.practicalActions || [])];
                        next[i] = { ...next[i], href: e.target.value };
                        setEditing({ ...editing, practicalActions: next });
                      }}
                      className="rounded-full font-mono text-xs"
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="链接文字"
                        value={row.label || ""}
                        onChange={(e) => {
                          const next = [...(editing.practicalActions || [])];
                          next[i] = { ...next[i], label: e.target.value };
                          setEditing({ ...editing, practicalActions: next });
                        }}
                        className="rounded-full flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-full shrink-0"
                        onClick={() => {
                          const next = (editing.practicalActions || []).filter((_: any, j: number) => j !== i);
                          setEditing({ ...editing, practicalActions: next });
                        }}
                      >
                        删
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">实战案例（标题 + 正文）</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full h-7 text-xs"
                  onClick={() =>
                    setEditing({
                      ...editing,
                      examples: [...(editing.examples || []), { title: "", content: "" }],
                    })
                  }
                >
                  添加案例
                </Button>
              </div>
              <div className="space-y-3">
                {(editing.examples || []).map((ex: any, i: number) => (
                  <div key={i} className="rounded-2xl border border-border p-3 space-y-2">
                    <Input
                      placeholder="案例标题"
                      value={ex.title || ""}
                      onChange={(e) => {
                        const next = [...(editing.examples || [])];
                        next[i] = { ...next[i], title: e.target.value };
                        setEditing({ ...editing, examples: next });
                      }}
                      className="rounded-full"
                    />
                    <textarea
                      placeholder="案例正文"
                      value={ex.content || ""}
                      onChange={(e) => {
                        const next = [...(editing.examples || [])];
                        next[i] = { ...next[i], content: e.target.value };
                        setEditing({ ...editing, examples: next });
                      }}
                      className="w-full rounded-2xl border border-border p-2 text-sm min-h-[72px]"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full h-7 text-xs"
                      onClick={() => {
                        const next = (editing.examples || []).filter((_: any, j: number) => j !== i);
                        setEditing({ ...editing, examples: next });
                      }}
                    >
                      删除本案例
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">参考链接（标题 + URL）</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full h-7 text-xs"
                  onClick={() =>
                    setEditing({
                      ...editing,
                      references: [...(editing.references || []), { title: "", url: "" }],
                    })
                  }
                >
                  添加链接
                </Button>
              </div>
              <div className="space-y-2">
                {(editing.references || []).map((ref: any, i: number) => (
                  <div key={i} className="flex flex-wrap gap-2 items-center">
                    <Input
                      placeholder="标题"
                      value={ref.title || ""}
                      onChange={(e) => {
                        const next = [...(editing.references || [])];
                        next[i] = { ...next[i], title: e.target.value };
                        setEditing({ ...editing, references: next });
                      }}
                      className="rounded-full flex-1 min-w-[120px]"
                    />
                    <Input
                      placeholder="https://"
                      value={ref.url || ""}
                      onChange={(e) => {
                        const next = [...(editing.references || [])];
                        next[i] = { ...next[i], url: e.target.value };
                        setEditing({ ...editing, references: next });
                      }}
                      className="rounded-full flex-[2] min-w-[180px] font-mono text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => {
                        const next = (editing.references || []).filter((_: any, j: number) => j !== i);
                        setEditing({ ...editing, references: next });
                      }}
                    >
                      删
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">别名（每行一个，或中文逗号分隔）</p>
              <textarea
                value={editing.aliasesText || ""}
                onChange={(e) => setEditing({ ...editing, aliasesText: e.target.value })}
                className="w-full rounded-2xl border border-border p-3 text-sm min-h-[56px]"
                placeholder="每行一个别名"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">延伸阅读（slug、标题、分类）</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full h-7 text-xs"
                  onClick={() =>
                    setEditing({
                      ...editing,
                      relatedTerms: [...(editing.relatedTerms || []), { slug: "", name: "", category: "" }],
                    })
                  }
                >
                  添加词条
                </Button>
              </div>
              <div className="space-y-2">
                {(editing.relatedTerms || []).map((r: any, i: number) => (
                  <div key={i} className="grid md:grid-cols-4 gap-2 items-end">
                    <Input
                      placeholder="slug"
                      value={r.slug || ""}
                      onChange={(e) => {
                        const next = [...(editing.relatedTerms || [])];
                        next[i] = { ...next[i], slug: e.target.value };
                        setEditing({ ...editing, relatedTerms: next });
                      }}
                      className="rounded-full font-mono text-xs"
                    />
                    <Input
                      placeholder="标题"
                      value={r.name || ""}
                      onChange={(e) => {
                        const next = [...(editing.relatedTerms || [])];
                        next[i] = { ...next[i], name: e.target.value };
                        setEditing({ ...editing, relatedTerms: next });
                      }}
                      className="rounded-full"
                    />
                    <Input
                      placeholder="分类"
                      value={r.category || ""}
                      onChange={(e) => {
                        const next = [...(editing.relatedTerms || [])];
                        next[i] = { ...next[i], category: e.target.value };
                        setEditing({ ...editing, relatedTerms: next });
                      }}
                      className="rounded-full"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => {
                        const next = (editing.relatedTerms || []).filter((_: any, j: number) => j !== i);
                        setEditing({ ...editing, relatedTerms: next });
                      }}
                    >
                      删
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">相关工具（名称 + 路径）</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full h-7 text-xs"
                  onClick={() =>
                    setEditing({
                      ...editing,
                      relatedToolLinks: [...(editing.relatedToolLinks || []), { name: "", href: "/tool/" }],
                    })
                  }
                >
                  添加工具
                </Button>
              </div>
              <div className="space-y-2">
                {(editing.relatedToolLinks || []).map((t: any, i: number) => (
                  <div key={i} className="flex flex-wrap gap-2 items-center">
                    <Input
                      placeholder="名称"
                      value={t.name || ""}
                      onChange={(e) => {
                        const next = [...(editing.relatedToolLinks || [])];
                        next[i] = { ...next[i], name: e.target.value };
                        setEditing({ ...editing, relatedToolLinks: next });
                      }}
                      className="rounded-full flex-1 min-w-[100px]"
                    />
                    <Input
                      placeholder="/tool/chatgpt"
                      value={t.href || ""}
                      onChange={(e) => {
                        const next = [...(editing.relatedToolLinks || [])];
                        next[i] = { ...next[i], href: e.target.value };
                        setEditing({ ...editing, relatedToolLinks: next });
                      }}
                      className="rounded-full flex-[2] min-w-[160px] font-mono text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => {
                        const next = (editing.relatedToolLinks || []).filter((_: any, j: number) => j !== i);
                        setEditing({ ...editing, relatedToolLinks: next });
                      }}
                    >
                      删
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {editing.id && token ? (
            <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground w-full">审核流</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full h-8 text-xs"
                disabled={loading}
                onClick={async () => {
                  try {
                    await adminApi.workflowTransition(token, "terms", String(editing.id), { action: "submit_review" });
                    await openEditorById(editing.id!);
                    await reload();
                  } catch (e) {
                    alert((e as Error)?.message || "失败");
                  }
                }}
              >
                提交审核
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full h-8 text-xs"
                disabled={loading}
                onClick={async () => {
                  try {
                    await adminApi.workflowTransition(token, "terms", String(editing.id), { action: "approve" });
                    await openEditorById(editing.id!);
                    await reload();
                  } catch (e) {
                    alert((e as Error)?.message || "失败");
                  }
                }}
              >
                审核通过
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full h-8 text-xs"
                disabled={loading}
                onClick={async () => {
                  try {
                    await adminApi.workflowTransition(token, "terms", String(editing.id), { action: "reject" });
                    await openEditorById(editing.id!);
                    await reload();
                  } catch (e) {
                    alert((e as Error)?.message || "失败");
                  }
                }}
              >
                驳回
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full h-8 text-xs"
                disabled={loading}
                onClick={async () => {
                  try {
                    await adminApi.workflowTransition(token, "terms", String(editing.id), { action: "publish" });
                    await openEditorById(editing.id!);
                    await reload();
                  } catch (e) {
                    alert((e as Error)?.message || "失败");
                  }
                }}
              >
                发布上线
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full h-8 text-xs"
                disabled={loading}
                onClick={async () => {
                  try {
                    await adminApi.workflowTransition(token, "terms", String(editing.id), { action: "unpublish" });
                    await openEditorById(editing.id!);
                    await reload();
                  } catch (e) {
                    alert((e as Error)?.message || "失败");
                  }
                }}
              >
                下线
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full h-8 text-xs"
                disabled={loading}
                onClick={async () => {
                  try {
                    const r = (await adminApi.termQuality(token, String(editing.id))) as any;
                    alert((r?.issues || []).join("\n") || "检查通过");
                  } catch (e) {
                    alert((e as Error)?.message || "失败");
                  }
                }}
              >
                质量检查
              </Button>
            </div>
          ) : null}
          {editing.id && token && ("super_admin" === profile?.adminRole || "ops" === profile?.adminRole) ? (
            <div className="grid md:grid-cols-2 gap-3 pt-2 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground mb-1">定时上架（已通过状态下有效，留空清除）</p>
                <Input
                  type="datetime-local"
                  value={editing.publishAt || ""}
                  onChange={(e) => setEditing({ ...editing, publishAt: e.target.value })}
                  className="rounded-full"
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">定时下架（已发布状态下有效，留空清除）</p>
                <Input
                  type="datetime-local"
                  value={editing.unpublishAt || ""}
                  onChange={(e) => setEditing({ ...editing, unpublishAt: e.target.value })}
                  className="rounded-full"
                />
              </div>
              <div className="md:col-span-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  disabled={loading}
                  onClick={async () => {
                    try {
                      let publishAt = null;
                      if (editing.publishAt && String(editing.publishAt).trim()) {
                        const d = new Date(editing.publishAt);
                        if (Number.isFinite(d.getTime())) {
                          publishAt = d.toISOString();
                        }
                      }
                      let unpublishAt = null;
                      if (editing.unpublishAt && String(editing.unpublishAt).trim()) {
                        const d2 = new Date(editing.unpublishAt);
                        if (Number.isFinite(d2.getTime())) {
                          unpublishAt = d2.toISOString();
                        }
                      }
                      await adminApi.workflowSchedule(token, "terms", String(editing.id), {
                        publishAt,
                        unpublishAt,
                      });
                      await openEditorById(editing.id!);
                      await reload();
                      alert("定时已保存");
                    } catch (e) {
                      alert((e as Error)?.message || "失败");
                    }
                  }}
                >
                  保存定时发布/下架
                </Button>
              </div>
            </div>
          ) : null}
          <CmsImageUrlField
            token={token}
            label="封面图（列表卡片与词条详情顶图）"
            helper="上传或粘贴图片 URL"
            value={editing.coverImageUrl || ""}
            onChange={(url) => setEditing({ ...editing, coverImageUrl: url })}
            previewClassName="w-full max-w-md h-40"
          />
          <div>
            <p className="text-xs text-muted-foreground mb-1">深度解释（Markdown，对应主站「深度解释」区块）</p>
            <CmsMarkdownToolbar token={token} markdown={editing.contentMarkdown || ""} onChangeMarkdown={(md) => setEditing({ ...editing, contentMarkdown: md })} />
            <textarea
              value={editing.contentMarkdown}
              onChange={(e) => setEditing({ ...editing, contentMarkdown: e.target.value })}
              className="w-full rounded-2xl border border-border p-3 text-sm min-h-[260px] font-mono mt-2"
            />
          </div>
        </Card>
      ) : null}

      <Card className="rounded-3xl border-border p-5 bg-white">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-foreground">名词列表</p>
          <p className="text-xs text-muted-foreground">{filtered.length} 条</p>
        </div>
        <div className="space-y-2">
          {filtered.map((t) => (
            <div key={t.id} className="w-full rounded-2xl border border-border p-4 hover:bg-muted/30">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={selectedIds.includes(t.id)}
                    onChange={() => toggleSelected(t.id)}
                  />
                  <button type="button" className="text-left min-w-0" onClick={() => void openEditorById(t.id)}>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="rounded-full border-0 text-xs">
                        {t.status}
                      </Badge>
                      <span className="text-sm font-medium text-foreground">{t.name}</span>
                      <span className="text-xs text-muted-foreground">/{t.slug}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{t.description}</p>
                  </button>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{new Date(t.updated_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
        {0 === filtered.length ? (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">
              当前 CMS 暂无数据。以下展示主站静态词库（只读），需迁移到 CMS 后才可在后台编辑发布。
            </p>
            <div className="space-y-2 max-h-80 overflow-auto pr-1">
              {termsCatalog.slice(0, 120).map((t) => (
                <div key={t.id} className="rounded-2xl border border-border p-3 bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="rounded-full border-0 text-xs">
                      static
                    </Badge>
                    <span className="text-sm font-medium text-foreground">{t.name}</span>
                    <span className="text-xs text-muted-foreground">/{t.slug}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{t.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}

