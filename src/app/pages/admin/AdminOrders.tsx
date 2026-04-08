import { useEffect, useState } from "react";
import { adminApi } from "../../lib/adminApi";
import { useAdmin } from "../../context/AdminContext";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export function AdminOrders() {
  const { token } = useAdmin();
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState("");
  const [channel, setChannel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reload = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const payload = await adminApi.listOrders(token, { status: status || undefined, channel: channel || undefined, limit: 200 });
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

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl border-border p-5 bg-white">
        <div className="flex flex-wrap gap-3 items-center">
          <Input value={status} onChange={(e) => setStatus(e.target.value)} placeholder="status（如 paid/pending/failed）" className="rounded-full" />
          <Input value={channel} onChange={(e) => setChannel(e.target.value)} placeholder="channel（wechat/alipay/mock/admin）" className="rounded-full" />
          <Button className="rounded-full" onClick={() => void reload()} disabled={loading}>
            查询
          </Button>
        </div>
        {error ? <p className="text-sm text-destructive mt-3">{error}</p> : null}
      </Card>

      <Card className="rounded-3xl border-border p-5 bg-white">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-foreground">订单</p>
          <p className="text-xs text-muted-foreground">{items.length} 条</p>
        </div>
        <div className="space-y-2">
          {items.map((o) => (
            <div key={o.id} className="rounded-2xl border border-border p-4">
              <div className="text-sm font-medium text-foreground break-all">{o.id}</div>
              <div className="text-xs text-muted-foreground mt-1 break-all">
                user: {o.user_id} · {o.channel} · {o.status} · {o.plan_tier || ""} · amount: {o.amount}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                created: {o.created_at ? new Date(o.created_at).toLocaleString() : "-"} · paid:{" "}
                {o.paid_at ? new Date(o.paid_at).toLocaleString() : "-"}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

