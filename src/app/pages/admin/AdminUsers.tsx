import { useEffect, useState } from "react";
import { adminApi } from "../../lib/adminApi";
import { useAdmin } from "../../context/AdminContext";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";

export function AdminUsers() {
  const { token } = useAdmin();
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");

  const reload = async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = await adminApi.listUsers(token, { page, perPage });
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
  }, [page]);

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl border-border p-5 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-foreground">用户</p>
            <p className="text-xs text-muted-foreground">敏感操作（改会员/设管理员）会写入审计日志</p>
          </div>
          <div className="flex gap-2 items-center">
            <Button variant="outline" className="rounded-full" onClick={() => setPage(Math.max(1, page - 1))}>
              上一页
            </Button>
            <Badge variant="secondary" className="rounded-full border-0">
              第 {page} 页
            </Badge>
            <Button variant="outline" className="rounded-full" onClick={() => setPage(page + 1)}>
              下一页
            </Button>
            <Button className="rounded-full" onClick={() => void reload()} disabled={loading}>
              刷新
            </Button>
          </div>
        </div>
        {error ? <p className="text-sm text-destructive mt-3">{error}</p> : null}
      </Card>

      <Card className="rounded-3xl border-border p-5 bg-white">
        <div className="flex items-center gap-3 mb-3">
          <p className="text-sm font-medium text-foreground">操作原因（必填）</p>
          <div className="flex-1">
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="例如：人工补偿、客服处理、误操作纠正" className="rounded-full" />
          </div>
        </div>
        <div className="space-y-2">
          {items.map((u) => (
            <div key={u.id} className="rounded-2xl border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{u.email || u.id}</span>
                    {u.isAdmin ? (
                      <Badge className="rounded-full bg-primary/10 text-primary border-0">Admin</Badge>
                    ) : null}
                    {u.membership?.endAt ? (
                      <Badge variant="secondary" className="rounded-full border-0">
                        到期：{new Date(u.membership.endAt).toLocaleDateString()}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="rounded-full border-0">
                        free
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 break-all">uid: {u.id}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={async () => {
                      if (!token) return;
                      if (!reason.trim()) {
                        alert("请先填写操作原因");
                        return;
                      }
                      try {
                        await adminApi.setUserAdmin(token, u.id, { isAdmin: !u.isAdmin, adminNote: u.adminNote || "" });
                        await reload();
                      } catch (e) {
                        alert((e as Error)?.message || "操作失败");
                      }
                    }}
                  >
                    {u.isAdmin ? "取消Admin" : "设为Admin"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={async () => {
                      if (!token) return;
                      if (!reason.trim()) {
                        alert("请先填写操作原因");
                        return;
                      }
                      try {
                        await adminApi.grantMembership(token, u.id, { tier: "standard", months: 1, reason });
                        await reload();
                      } catch (e) {
                        alert((e as Error)?.message || "操作失败");
                      }
                    }}
                  >
                    +1月进阶
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={async () => {
                      if (!token) return;
                      if (!reason.trim()) {
                        alert("请先填写操作原因");
                        return;
                      }
                      try {
                        await adminApi.grantMembership(token, u.id, { tier: "pro", months: 1, reason });
                        await reload();
                      } catch (e) {
                        alert((e as Error)?.message || "操作失败");
                      }
                    }}
                  >
                    +1月专业
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

