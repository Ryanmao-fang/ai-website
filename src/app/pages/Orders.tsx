import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "@/lib/api";

type OrderRow = {
  id: string;
  status: string;
  plan: string | null;
  plan_tier: string | null;
  amount: number;
  channel: string;
  created_at: string;
  paid_at: string | null;
};

export function Orders() {
  const { accessToken } = useAuth();
  const [items, setItems] = useState<OrderRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }
      try {
        const payload = await apiClient.getMyOrders(accessToken);
        const list = (payload?.items || []) as OrderRow[];
        if (!cancelled) {
          setItems(list);
        }
      } catch (e) {
        if (!cancelled) {
          setError((e as Error).message || "加载失败");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const fmtFen = (fen: number) => (fen / 100).toFixed(2);

  return (
    <div className="min-h-screen py-12 bg-secondary/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-2">订单记录</h1>
          <p className="text-muted-foreground">最近 50 条支付订单（金额单位：人民币元）</p>
        </motion.div>

        {loading ? (
          <p className="text-center text-muted-foreground">正在加载…</p>
        ) : error ? (
          <Card className="rounded-3xl border-border p-8 text-center text-destructive">{error}</Card>
        ) : 0 === items.length ? (
          <Card className="rounded-3xl border-border p-10 text-center text-muted-foreground">
            暂无订单。前往
            <Link to="/membership" className="text-primary hover:underline mx-1">
              会员页
            </Link>
            了解方案。
          </Card>
        ) : (
          <div className="space-y-4">
            {items.map((row, index) => (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className="rounded-3xl border-border p-6 bg-white">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm text-foreground mb-1">{row.id}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="rounded-full bg-primary/10 text-primary border-0">
                          {row.status}
                        </Badge>
                        {row.plan ? (
                          <Badge variant="secondary" className="rounded-full border-0">
                            {row.plan}
                          </Badge>
                        ) : null}
                        {row.plan_tier ? (
                          <Badge variant="secondary" className="rounded-full border-0">
                            {row.plan_tier}
                          </Badge>
                        ) : null}
                        <Badge variant="secondary" className="rounded-full border-0">
                          {row.channel}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p className="text-lg font-semibold text-foreground">¥{fmtFen(row.amount)}</p>
                      <p>创建：{new Date(row.created_at).toLocaleString("zh-CN")}</p>
                      {row.paid_at ? <p>支付：{new Date(row.paid_at).toLocaleString("zh-CN")}</p> : null}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center mt-10">
          发票、退款与对公汇款说明以用户协议及客服邮件回复为准。
        </p>
      </div>
    </div>
  );
}
