import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../lib/adminApi";
import { useAdmin } from "../../context/AdminContext";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";

type TemplateRow = {
  id: number;
  title: string;
  scenario: string;
  category: string;
  min_tier: string;
  status: string;
  updated_at: string;
};

export function AdminTemplates() {
  const { token } = useAdmin();
  const [items, setItems] = useState<TemplateRow[]>([]);
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
      const payload = await adminApi.listTemplates(token, { q, status: status || undefined });
      setItems(((payload as any)?.items || []) as TemplateRow[]);
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
        await adminApi.updateTemplate(token, String(editing.id), editing);
      } else {
        await adminApi.createTemplate(token, editing);
      }
      setEditing(null);
      await reload();
    } catch (e) {
      setError((e as Error)?.message || "保存失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl border-border p-5 bg-white">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px]">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索标题/场景/分类" className="rounded-full" />
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
                title: "",
                scenario: "",
                category: "",
                tags: [],
                minTier: "standard",
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
            <p className="font-semibold text-foreground">{editing.id ? `编辑 #${editing.id}` : "新建模板"}</p>
            <div className="flex gap-2">
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
              <p className="text-xs text-muted-foreground mb-1">标题</p>
              <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="rounded-full" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">分类</p>
              <Input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="rounded-full" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">最低会员</p>
              <select
                value={editing.minTier}
                onChange={(e) => setEditing({ ...editing, minTier: e.target.value })}
                className="h-10 rounded-full border border-border bg-white px-4 text-sm w-full"
              >
                <option value="free">免费</option>
                <option value="standard">进阶</option>
                <option value="pro">专业</option>
              </select>
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
            <p className="text-xs text-muted-foreground mb-1">场景</p>
            <textarea
              value={editing.scenario}
              onChange={(e) => setEditing({ ...editing, scenario: e.target.value })}
              className="w-full rounded-2xl border border-border p-3 text-sm min-h-[90px]"
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">正文（Markdown）</p>
            <textarea
              value={editing.contentMarkdown}
              onChange={(e) => setEditing({ ...editing, contentMarkdown: e.target.value })}
              className="w-full rounded-2xl border border-border p-3 text-sm min-h-[240px] font-mono"
            />
          </div>
        </Card>
      ) : null}

      <Card className="rounded-3xl border-border p-5 bg-white">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-foreground">模板列表</p>
          <p className="text-xs text-muted-foreground">{filtered.length} 条</p>
        </div>
        <div className="space-y-2">
          {filtered.map((t) => (
            <button
              key={t.id}
              type="button"
              className="w-full text-left rounded-2xl border border-border p-4 hover:bg-muted/30"
              onClick={() => setEditing({ ...t, minTier: t.min_tier, contentMarkdown: "", contentJson: {}, contentVersion: "" })}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="rounded-full border-0 text-xs">
                      {t.status}
                    </Badge>
                    <span className="text-sm font-medium text-foreground">{t.title}</span>
                    <span className="text-xs text-muted-foreground">· {t.min_tier}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{t.scenario}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{new Date(t.updated_at).toLocaleString()}</span>
              </div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

