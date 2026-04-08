import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../lib/adminApi";
import { useAdmin } from "../../context/AdminContext";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { toolsCatalog } from "@/content/toolsCatalog";
import { Link } from "react-router";
import { parseJsonOrCsv, type ImportMode } from "../../lib/importParsers";
import { CmsImageUrlField } from "../../components/CmsImageUrlField";
import { CmsMarkdownToolbar } from "../../components/CmsMarkdownToolbar";

type ToolRow = {
  id: number;
  slug: string;
  name: string;
  description: string;
  category: string;
  status: string;
  updated_at: string;
};

export function AdminTools() {
  const { token } = useAdmin();
  const [items, setItems] = useState<ToolRow[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | "draft" | "published">("");
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
      const payload = await adminApi.listTools(token, { q, status: status || undefined });
      setItems(((payload as any)?.items || []) as ToolRow[]);
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
    if ("delete" === action && !window.confirm(`确认批量删除 ${selectedIds.length} 条工具吗？`)) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      await adminApi.batchTools(token, { ids: selectedIds, action });
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

  const saveEditing = async () => {
    if (!token || !editing) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (editing.id) {
        await adminApi.updateTool(token, String(editing.id), editing);
      } else {
        await adminApi.createTool(token, editing);
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
    if (!window.confirm(`确认删除工具「${editing.name || editing.slug}」吗？`)) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      await adminApi.deleteTool(token, String(editing.id));
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
      const payload = await adminApi.getTool(token, String(id));
      const item = (payload as any)?.item;
      if (!item) {
        throw new Error("未获取到详情数据");
      }
      setEditing({
        id: item.id,
        slug: item.slug || "",
        name: item.name || "",
        description: item.description || "",
        icon: item.icon || "",
        category: item.category || "",
        tags: Array.isArray(item.tags) ? item.tags : [],
        rating: Number(item.rating || 0),
        link: item.link || "",
        platform: item.platform || "",
        openSource: Boolean(item.open_source),
        priceTier: item.price_tier || "freemium",
        suitableFor: item.suitable_for || "",
        disclaimer: item.disclaimer || "",
        contentMarkdown: item.content_markdown || "",
        contentJson: item.content_json || {},
        status: item.status || "draft",
        contentVersion: item.content_version || "",
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
    lines.push("## 工具介绍");
    lines.push(item.fullDescription || item.description || "");
    lines.push("");
    lines.push("## 使用场景");
    for (const ex of item.useCases || []) {
      lines.push(`### ${ex.title}`);
      lines.push(ex.description || "");
      lines.push("");
    }
    return lines.join("\n");
  };

  const importStaticTools = async () => {
    if (!token) {
      return;
    }
    setImporting(true);
    setError("");
    try {
      const payload = await adminApi.listTools(token);
      const existing = ((payload as any)?.items || []) as ToolRow[];
      const slugSet = new Set(existing.map((x) => String(x.slug || "").trim().toLowerCase()));
      let created = 0;
      for (const t of toolsCatalog) {
        const slug = String(t.slug || "").trim().toLowerCase();
        if (!slug || slugSet.has(slug)) {
          continue;
        }
        await adminApi.createTool(token, {
          slug: t.slug,
          name: t.name,
          description: t.description,
          icon: t.icon || "",
          category: t.category,
          tags: t.tags || [],
          rating: t.rating || 0,
          link: t.link || "",
          platform: t.platform || "",
          openSource: Boolean(t.openSource),
          priceTier: t.priceTier || "freemium",
          suitableFor: t.suitableFor || "",
          disclaimer: t.disclaimer || "",
          contentMarkdown: buildMarkdownFromStatic(t),
          contentJson: {
            fullDescription: t.fullDescription || "",
            useCases: t.useCases || [],
            howToUse: t.howToUse || [],
          },
          status: "published",
          contentVersion: "static-migrated",
        });
        slugSet.add(slug);
        created += 1;
      }
      await reload();
      alert(`静态工具库迁移完成：新增 ${created} 条，重复已跳过。`);
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
      const resp = (await adminApi.importTools(token, { items, mode: importMode })) as any;
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
    a.download = `tools-import-failed-${Date.now()}.json`;
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
      const resp = (await adminApi.importTools(token, { items: retryItems, mode: "upsert" })) as any;
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
            <option value="published">已发布</option>
          </select>
          <Button className="rounded-full" onClick={() => void reload()} disabled={loading}>
            刷新
          </Button>
          <Button variant="outline" className="rounded-full" onClick={() => void importStaticTools()} disabled={importing || loading}>
            {importing ? "迁移中…" : "一键迁移静态工具库"}
          </Button>
          <Button
            className="rounded-full bg-primary hover:bg-accent"
            onClick={() =>
              setEditing({
                slug: "",
                name: "",
                description: "",
                icon: "",
                category: "",
                tags: [],
                rating: 0,
                link: "",
                platform: "",
                openSource: false,
                priceTier: "freemium",
                suitableFor: "",
                disclaimer: "",
                contentMarkdown: "",
                contentJson: {},
                status: "published",
                contentVersion: "",
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
            placeholder={`JSON: [{"slug":"test-tool","name":"测试工具","description":"...","category":"对话助手","status":"published"}]
CSV: slug,name,description,category,icon,link,status`}
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
            <p className="font-semibold text-foreground">{editing.id ? `编辑 #${editing.id}` : "新建工具"}</p>
            <div className="flex gap-2 items-center">
              {editing.slug ? (
                <Link to={`/tool/${editing.slug}`} target="_blank" className="text-xs text-primary hover:underline">
                  打开主站页面
                </Link>
              ) : null}
              <Link to="/admin/assets" className="text-xs text-primary hover:underline">
                去素材库上传Logo
              </Link>
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
            <div className="md:col-span-2">
              <CmsImageUrlField
                token={token}
                label="图标（emoji 或图片 URL；上传后可用于详情页头像）"
                helper="仍以单行字符串存库：可填 🤖 或 https://…；上传会覆盖为图片地址。"
                value={editing.icon || ""}
                onChange={(url) => setEditing({ ...editing, icon: url })}
                previewClassName="w-20 h-20"
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">官网链接</p>
              <Input value={editing.link} onChange={(e) => setEditing({ ...editing, link: e.target.value })} className="rounded-full" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">状态</p>
              <select
                value={editing.status}
                onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                className="h-10 rounded-full border border-border bg-white px-4 text-sm w-full"
              >
                <option value="draft">草稿</option>
                <option value="published">发布</option>
              </select>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">简介</p>
            <textarea
              value={editing.description}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              className="w-full rounded-2xl border border-border p-3 text-sm min-h-[90px]"
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">正文（Markdown）</p>
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
          <p className="font-semibold text-foreground">工具列表</p>
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
              当前 CMS 暂无数据。以下展示主站静态工具库（只读），需迁移到 CMS 后才可在后台编辑发布。
            </p>
            <div className="space-y-2 max-h-80 overflow-auto pr-1">
              {toolsCatalog.slice(0, 120).map((t) => (
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

