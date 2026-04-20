import { useEffect, useState } from "react";
import { adminApi } from "../../lib/adminApi";
import { useAdmin } from "../../context/AdminContext";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { apiBaseUrl } from "@/lib/api";

export function AdminOps() {
  const { token, profile } = useAdmin();
  const [overview, setOverview] = useState<any | null>(null);
  const [audits, setAudits] = useState<any[]>([]);
  const [health, setHealth] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scheduleHint, setScheduleHint] = useState("");
  const [taskRuns, setTaskRuns] = useState<any[]>([]);
  const [taskHint, setTaskHint] = useState("");
  const [growth, setGrowth] = useState<any | null>(null);

  const canOps =
    "super_admin" === profile?.adminRole ||
    "ops" === profile?.adminRole ||
    "reviewer" === profile?.adminRole;

  const reload = async () => {
    if (!token || !canOps) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [ov, au] = await Promise.all([
        adminApi.opsOverview(token),
        adminApi.opsAuditLogs(token, 40),
      ]);
      setOverview(ov);
      setAudits(((au as any)?.items || []) as any[]);
      const tr = await adminApi.opsTaskRuns(token, 20);
      setTaskRuns(((tr as any)?.items || []) as any[]);
      const gv = await adminApi.opsGrowthOverview(token);
      setGrowth(gv);
      try {
        const h = await fetch(`${apiBaseUrl}/api/admin/ops/health-detail`, {
          headers: { Authorization: `AdminBearer ${token}` },
        });
        const j = await h.json().catch(() => ({}));
        setHealth(j);
      } catch {
        setHealth(null);
      }
    } catch (e) {
      setError((e as Error)?.message || "加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, profile?.adminRole]);

  if (!canOps) {
    return (
      <Card className="rounded-3xl border-border p-5 bg-white">
        <p className="text-sm text-muted-foreground">当前账号需要审核员/运营/超管角色才可查看运营看板。</p>
      </Card>
    );
  }

  const counts = (overview as any)?.statusCounts || {};

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl border-border p-5 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-foreground">运营与健康</p>
            <p className="text-xs text-muted-foreground">
              内容各状态数量、最近审计摘要、手动触发定时任务。服务端按计划执行上架/下架；异常可配置{" "}
              <code className="text-[11px] bg-muted px-1 rounded">OPS_ALERT_WEBHOOK_URL</code>{" "}
              推送到运维群。
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full" disabled={loading} onClick={() => void reload()}>
              刷新
            </Button>
            {profile?.adminRole === "super_admin" || profile?.adminRole === "ops" ? (
              <Button
                className="rounded-full"
                disabled={loading || !token}
                onClick={async () => {
                  if (!token) {
                    return;
                  }
                  setScheduleHint("");
                  try {
                    const r = (await adminApi.opsRunScheduleOnce(token)) as any;
                    setScheduleHint(
                      `定时已执行：上架 ${Number(r?.publishedCount || 0)}，下线 ${Number(r?.unpublishedCount || 0)}`
                    );
                  } catch (e) {
                    setScheduleHint((e as Error)?.message || "执行失败");
                  }
                }}
              >
                立即跑定时任务
              </Button>
            ) : null}
          </div>
        </div>
        {error ? <p className="text-sm text-destructive mt-2">{error}</p> : null}
        {scheduleHint ? <p className="text-xs text-emerald-700 mt-2">{scheduleHint}</p> : null}
        {taskHint ? <p className="text-xs text-emerald-700 mt-2">{taskHint}</p> : null}
        {health && typeof health.dbOk === "boolean" ? (
          <p className="text-xs mt-2">
            DB 探测：{health.dbOk ? "正常" : "异常"} {health.dbMs != null ? `（${health.dbMs} ms）` : ""}
          </p>
        ) : null}
      </Card>

      <Card className="rounded-3xl border-border p-5 bg-white">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-foreground">自动化任务中心</p>
          <div className="flex flex-wrap gap-2">
            {(overview as any)?.taskKeys?.map((taskKey: string) => (
              <Button
                key={taskKey}
                variant="outline"
                className="rounded-full"
                disabled={loading || !token}
                onClick={async () => {
                  if (!token) {
                    return;
                  }
                  setTaskHint("");
                  try {
                    await adminApi.opsTriggerTask(token, taskKey);
                    setTaskHint(`任务已执行：${taskKey}`);
                    await reload();
                  } catch (e) {
                    setTaskHint((e as Error)?.message || "任务执行失败");
                  }
                }}
              >
                运行 {taskKey}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-2 max-h-72 overflow-auto text-xs">
          {taskRuns.map((row) => (
            <div key={row.id} className="border-b border-border pb-2">
              <p className="font-mono">
                [{row.status}] {row.task_key}
              </p>
              <p className="text-muted-foreground">
                开始：{row.started_at ? new Date(row.started_at).toLocaleString() : "-"} · 结束：
                {row.finished_at ? new Date(row.finished_at).toLocaleString() : "-"}
              </p>
              {row.error_message ? <p className="text-destructive">{row.error_message}</p> : null}
            </div>
          ))}
        </div>
      </Card>

      <Card className="rounded-3xl border-border p-5 bg-white">
        <p className="font-semibold text-foreground mb-3">增长漏斗（24h）</p>
        <div className="grid md:grid-cols-5 gap-3 text-sm mb-4">
          {[
            { k: "homeView", label: "首页访问" },
            { k: "searchSubmit", label: "搜索提交" },
            { k: "membershipView", label: "会员页访问" },
            { k: "checkoutStart", label: "发起支付" },
            { k: "checkoutSuccess", label: "支付成功" },
          ].map((item) => (
            <div key={item.k} className="rounded-2xl bg-muted/40 p-3">
              <p className="text-muted-foreground">{item.label}</p>
              <p className="text-xl font-semibold text-foreground">
                {Number(growth?.funnel24h?.[item.k] || 0)}
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mb-2">模板反馈（7天）</p>
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="secondary" className="rounded-full border-0">
            总反馈: {Number(growth?.templateFeedback7d?.total || 0)}
          </Badge>
          <Badge variant="secondary" className="rounded-full border-0">
            有效率: {Math.round(Number(growth?.templateFeedback7d?.positiveRate || 0) * 100)}%
          </Badge>
          <Badge variant="secondary" className="rounded-full border-0">
            平均分: {Number(growth?.templateFeedback7d?.avgScore || 0)}
          </Badge>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {["terms", "tools", "templates", "learningPaths"].map((k) => (
          <Card key={k} className="rounded-3xl border-border p-5 bg-white">
            <p className="text-sm font-medium text-foreground mb-3">{k}</p>
            <div className="flex flex-wrap gap-2">
              {counts[k]
                ? Object.entries(counts[k] as Record<string, number>).map(([st, n]) => (
                    <Badge key={st} variant="secondary" className="rounded-full border-0">
                      {st}: {n}
                    </Badge>
                  ))
                : null}
            </div>
          </Card>
        ))}
      </div>

      <Card className="rounded-3xl border-border p-5 bg-white">
        <p className="font-semibold text-foreground mb-3">最近审计（节选）</p>
        <div className="space-y-2 max-h-72 overflow-auto text-xs font-mono">
          {audits.map((a) => (
            <div key={a.id} className="border-b border-border pb-2">
              <span className="text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span> ·{" "}
              <span className="text-foreground">{a.action}</span> · {a.target_type} #{a.target_id}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
