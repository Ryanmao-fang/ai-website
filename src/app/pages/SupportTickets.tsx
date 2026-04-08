import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { LifeBuoy } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { PageMeta } from "../components/PageMeta";
import { useAuth } from "../context/AuthContext";
import { apiClient, ApiNetworkError } from "@/lib/api";
import { siteConfig } from "@/lib/siteConfig";

type TicketRow = {
  id: string;
  category: string;
  title: string;
  body: string;
  status: string;
  created_at: string;
};

export function SupportTickets() {
  const { accessToken } = useAuth();
  const [items, setItems] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("general");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!accessToken) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.listMyTickets(accessToken);
      setItems((res.items || []) as TicketRow[]);
    } catch (e) {
      if (e instanceof ApiNetworkError) {
        setError(e.message);
      } else {
        setError((e as Error).message || "加载失败（若首次使用，请确认已在 Supabase 执行扩展表 SQL）");
      }
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async () => {
    if (!accessToken) {
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await apiClient.createTicket(accessToken, { category, title: title.trim(), body: body.trim() });
      setTitle("");
      setBody("");
      await load();
    } catch (e) {
      if (e instanceof ApiNetworkError) {
        setError(e.message);
      } else {
        setError((e as Error).message || "提交失败");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-secondary/30">
      <PageMeta title="我的工单" description="提交问题、查看处理状态，与邮件客服互为补充。" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <LifeBuoy className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-semibold text-foreground">客服工单</h1>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            紧急事项可同时发邮件至 {siteConfig.supportEmail}。一般工作日响应，处理进展会显示在下方列表。
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            <Link to="/contact" className="text-primary hover:underline">
              联系我们
            </Link>
            ·
            <Link to="/help" className="text-primary hover:underline ml-1">
              帮助中心
            </Link>
          </p>
        </motion.div>

        <Card className="rounded-3xl border-border p-6 bg-white space-y-4">
          <h2 className="font-semibold text-foreground">新建工单</h2>
          <div className="space-y-2">
            <Label htmlFor="ticket-cat">分类</Label>
            <select
              id="ticket-cat"
              className="w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="general">通用咨询</option>
              <option value="payment">支付 / 订单</option>
              <option value="account">账号与安全</option>
              <option value="content">内容纠错</option>
              <option value="pro">专业会员履约</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ticket-title">标题</Label>
            <Input
              id="ticket-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-2xl border-border"
              placeholder="一句话说明问题"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ticket-body">详情</Label>
            <textarea
              id="ticket-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full min-h-[120px] rounded-2xl border border-border p-3 text-sm bg-white"
              placeholder="可附上截图说明、订单号、发生时间等"
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button
            type="button"
            className="rounded-full bg-primary"
            disabled={submitting || !title.trim() || !body.trim()}
            onClick={() => void submit()}
          >
            {submitting ? "提交中…" : "提交工单"}
          </Button>
        </Card>

        <Card className="rounded-3xl border-border p-6 bg-white">
          <h2 className="font-semibold text-foreground mb-4">我的工单</h2>
          {loading ? (
            <p className="text-sm text-muted-foreground">加载中…</p>
          ) : 0 === items.length ? (
            <p className="text-sm text-muted-foreground">暂无工单记录</p>
          ) : (
            <ul className="space-y-4">
              {items.map((t) => (
                <li key={t.id} className="rounded-2xl border border-border p-4">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">{t.title}</span>
                    <span className="text-xs rounded-full bg-muted px-2 py-0.5 text-muted-foreground">{t.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {new Date(t.created_at).toLocaleString()} · {t.category}
                  </p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{t.body}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
