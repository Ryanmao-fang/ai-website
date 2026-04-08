import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../lib/adminApi";
import { useAdmin } from "../../context/AdminContext";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { termsCatalog } from "@/content/termsCatalog";
import { Link } from "react-router";

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
  const { token } = useAdmin();
  const [items, setItems] = useState<TermRow[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | "draft" | "published">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<any | null>(null);

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
        await adminApi.updateTerm(token, String(editing.id), editing);
      } else {
        await adminApi.createTerm(token, editing);
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
      });
    } catch (e) {
      setError((e as Error)?.message || "加载详情失败");
    } finally {
      setLoading(false);
    }
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
                status: "draft",
                contentVersion: "",
              })
            }
          >
            新建
          </Button>
        </div>
        {error ? <p className="text-sm text-destructive mt-3">{error}</p> : null}
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
            <textarea
              value={editing.contentMarkdown}
              onChange={(e) => setEditing({ ...editing, contentMarkdown: e.target.value })}
              className="w-full rounded-2xl border border-border p-3 text-sm min-h-[260px] font-mono"
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
            <button
              key={t.id}
              type="button"
              className="w-full text-left rounded-2xl border border-border p-4 hover:bg-muted/30"
              onClick={() => void openEditorById(t.id)}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="rounded-full border-0 text-xs">
                      {t.status}
                    </Badge>
                    <span className="text-sm font-medium text-foreground">{t.name}</span>
                    <span className="text-xs text-muted-foreground">/{t.slug}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{t.description}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{new Date(t.updated_at).toLocaleString()}</span>
              </div>
            </button>
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

