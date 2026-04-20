import { useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import { motion } from "motion/react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { PageMeta } from "../components/PageMeta";
import { toolsCatalog, getToolById } from "@/content/toolsCatalog";
import { useAuth } from "../context/AuthContext";
import { useLoginDialog } from "../context/LoginDialogContext";

export function ToolsCompare() {
  const [params] = useSearchParams();
  const { userId } = useAuth();
  const { openLogin } = useLoginDialog();

  const ids = useMemo(() => {
    const raw = params.get("ids") || "";
    const parts = raw
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => !Number.isNaN(n));
    const uniq = [...new Set(parts)].slice(0, 4);
    return uniq.length > 0 ? uniq : [1, 2, 3];
  }, [params]);

  const tools = ids.map((id) => getToolById(String(id))).filter(Boolean) as typeof toolsCatalog;

  return (
    <div className="figma-page py-12 bg-secondary/30">
      <PageMeta title="工具对比" description="并排查看多款 AI 工具字段，便于选型。" />
      <div className="figma-container max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2">工具对比</h1>
          <p className="text-sm text-muted-foreground">
            在地址栏使用参数自定义，例如{" "}
            <code className="text-xs bg-muted px-1 rounded">/tools/compare?ids=1,3,5</code>
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((t) => (
            <Card key={t.id} className="rounded-3xl border-border p-6 bg-white">
              <div className="text-4xl mb-3">{t.icon}</div>
              <h2 className="text-lg font-semibold text-foreground mb-1">{t.name}</h2>
              <Badge className="rounded-full bg-muted text-muted-foreground border-0 mb-2">{t.category}</Badge>
              <p className="text-sm text-muted-foreground mb-3">{t.description}</p>
              <ul className="text-xs text-muted-foreground space-y-1 mb-4">
                <li>平台：{t.platform || "—"}</li>
                <li>授权：{t.openSource ? "开源 / 可自托管" : "商业产品"}</li>
                <li>付费：{t.priceTier === "free" ? "以免费为主" : t.priceTier === "paid" ? "多数为付费" : "免费+增值"}</li>
                <li>适合：{t.suitableFor || "—"}</li>
              </ul>
              {userId ? (
                <Link to={`/tool/${t.slug}`} className="text-sm text-primary hover:underline">
                  打开详情 →
                </Link>
              ) : (
                <button type="button" className="text-sm text-primary hover:underline" onClick={() => openLogin()}>
                  登录后打开详情 →
                </button>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
