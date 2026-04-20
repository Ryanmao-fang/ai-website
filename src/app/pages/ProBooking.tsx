import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { PageMeta } from "../components/PageMeta";
import { useAuth } from "../context/AuthContext";
import { apiClient, ApiNetworkError } from "@/lib/api";
import { AccessNoticeDialog } from "../components/AccessNoticeDialog";

/** 专业会员 1 对 1 预约：落工单，运营线下排期 */
export function ProBooking() {
  const { accessToken, membershipTier } = useAuth();
  const [title, setTitle] = useState("预约 1 对 1 学习辅导");
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState("");
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const submit = async () => {
    if (!accessToken) {
      return;
    }
    if ("pro" !== membershipTier) {
      setUpgradeOpen(true);
      return;
    }
    setMsg("");
    try {
      await apiClient.createTicket(accessToken, {
        category: "pro",
        title: title.trim(),
        body: body.trim(),
      });
      setMsg("已提交预约工单，客服会在工作日与您邮件确认时段。");
      setBody("");
    } catch (e) {
      if (e instanceof ApiNetworkError) {
        setMsg(e.message);
      } else {
        setMsg((e as Error).message || "提交失败");
      }
    }
  };

  return (
    <>
      <AccessNoticeDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        variant="upgrade"
        onRequestLogin={() => setUpgradeOpen(false)}
      />
      <div className="figma-page py-12 bg-secondary/30">
        <PageMeta title="专业辅导预约" description="专业会员可提交 1 对 1 辅导需求，由客服排期。" />
        <div className="figma-container max-w-xl">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-semibold text-foreground mb-2">1 对 1 辅导预约</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              本表单会生成一条「专业会员履约」类工单。您也可在
              <Link to="/support/tickets" className="text-primary hover:underline mx-1">
                工单中心
              </Link>
              查看历史记录。
            </p>
          </motion.div>
          <Card className="rounded-3xl border-border p-6 bg-white space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pb-title">主题</Label>
              <Input id="pb-title" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-2xl border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pb-body">需求与空闲时段</Label>
              <textarea
                id="pb-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full min-h-[140px] rounded-2xl border border-border p-3 text-sm"
                placeholder="希望辅导的大致方向、当前基础、可上课时段（注明时区）"
              />
            </div>
            {msg ? <p className="text-sm text-emerald-700">{msg}</p> : null}
            <Button type="button" className="rounded-full bg-primary" onClick={() => void submit()}>
              提交预约
            </Button>
          </Card>
        </div>
      </div>
    </>
  );
}
