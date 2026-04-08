import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../lib/adminApi";
import { useAdmin } from "../../context/AdminContext";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";

type Row = {
  id: number;
  slug: string;
  title: string;
  difficulty: string;
  min_tier: string;
  status: string;
  updated_at: string;
};

export function AdminLearningPaths() {
  const { token } = useAdmin();
  const [items, setItems] = useState<Row[]>([]);
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
      const payload = await adminApi.listLearningPaths(token, { q, status: status || undefined });
      setItems(((payload as any)?.items || []) as Row[]);
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
        await adminApi.updateLearningPath(token, String(editing.id), editing);
      } else {
        await adminApi.createLearningPath(token, editing);
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
    if (!window.confirm(`确认删除学习路线「${editing.title || editing.slug}」吗？`)) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      await adminApi.deleteLearningPath(token, String(editing.id));
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
      const payload = await adminApi.getLearningPath(token, String(id));
      const item = (payload as any)?.item;
      if (!item) {
        throw new Error("未获取到详情数据");
      }
      setEditing({
        id: item.id,
        slug: item.slug || "",
        title: item.title || "",
        description: item.description || "",
        difficulty: item.difficulty || "beginner",
        minTier: item.min_tier || "free",
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
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索 slug / 标题"
              className="rounded-full"
            />
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
                title: "",
                description: "",
                difficulty: "beginner",
                minTier: "free",
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
            <p className="font-semibold text-foreground">{editing.id ? `编辑 #${editing.id}` : "新建学习路线"}</p>
            <div className="flex gap-2">
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
              <p className="text-xs text-muted-foreground mb-1">标题</p>
              <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="rounded-full" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">难度</p>
              <select
                value={editing.difficulty}
                onChange={(e) => setEditing({ ...editing, difficulty: e.target.value })}
                className="h-10 rounded-full border border-border bg-white px-4 text-sm w-full"
              >
                <option value="beginner">入门</option>
                <option value="intermediate">进阶</option>
                <option value="advanced">高阶</option>
              </select>
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
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">内容结构（JSON）</p>
            <textarea
              value={JSON.stringify(editing.contentJson || {}, null, 2)}
              onChange={(e) => {
                try {
                  setEditing({ ...editing, contentJson: JSON.parse(e.target.value) });
                } catch {
                  // ignore
                }
              }}
              className="w-full rounded-2xl border border-border p-3 text-sm min-h-[260px] font-mono"
            />
          </div>
        </Card>
      ) : null}

      <Card className="rounded-3xl border-border p-5 bg-white">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-foreground">学习路线列表</p>
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
                    <span className="text-sm font-medium text-foreground">{t.title}</span>
                    <span className="text-xs text-muted-foreground">/{t.slug}</span>
                    <span className="text-xs text-muted-foreground">· {t.min_tier}</span>
                  </div>
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

