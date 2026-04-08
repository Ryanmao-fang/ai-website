import { useEffect, useState } from "react";
import { adminApi } from "../../lib/adminApi";
import { useAdmin } from "../../context/AdminContext";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";

export function AdminTickets() {
  const { token } = useAdmin();
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [internalNote, setInternalNote] = useState("");

  const reload = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const payload = await adminApi.listTickets(token, { status: status || undefined, limit: 200 });
      setItems(((payload as any)?.items || []) as any[]);
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

  const saveTicket = async (id: number, nextStatus: string) => {
    if (!token) return;
    try {
      await adminApi.updateTicket(token, String(id), { status: nextStatus, internalNote });
      setEditingId(null);
      setInternalNote("");
      await reload();
    } catch (e) {
      alert((e as Error)?.message || "更新失败");
    }
  };

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl border-border p-5 bg-white">
        <div className="flex flex-wrap gap-3 items-center">
          <Input value={status} onChange={(e) => setStatus(e.target.value)} placeholder="status（如 open/closed）" className="rounded-full" />
          <Button className="rounded-full" onClick={() => void reload()} disabled={loading}>
            查询
          </Button>
        </div>
        {error ? <p className="text-sm text-destructive mt-3">{error}</p> : null}
      </Card>

      <Card className="rounded-3xl border-border p-5 bg-white">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-foreground">工单</p>
          <p className="text-xs text-muted-foreground">{items.length} 条</p>
        </div>
        <div className="space-y-2">
          {items.map((t) => (
            <div key={t.id} className="rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="rounded-full border-0 text-xs">
                      {t.status}
                    </Badge>
                    <span className="text-sm font-medium text-foreground">{t.title}</span>
                    <span className="text-xs text-muted-foreground">· {t.category}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 break-all">user: {t.user_id || "-"}</p>
                  <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{t.body}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    setEditingId(t.id);
                    setInternalNote(String(t.internal_note || ""));
                  }}
                >
                  处理
                </Button>
              </div>

              {editingId === t.id ? (
                <div className="mt-3 rounded-2xl border border-border p-3 bg-muted/30 space-y-2">
                  <p className="text-xs text-muted-foreground">内部备注</p>
                  <textarea
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    className="w-full rounded-2xl border border-border p-2 text-sm min-h-[90px]"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" className="rounded-full" onClick={() => setEditingId(null)}>
                      取消
                    </Button>
                    <Button className="rounded-full" onClick={() => void saveTicket(t.id, "open")}>
                      标记open
                    </Button>
                    <Button className="rounded-full bg-primary hover:bg-accent" onClick={() => void saveTicket(t.id, "closed")}>
                      关闭
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

