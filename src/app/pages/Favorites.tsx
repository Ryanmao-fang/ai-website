import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Heart } from "lucide-react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "@/lib/api";
import { Button } from "../components/ui/button";
import { getTermById, getTermBySlug } from "@/content/termsCatalog";
import { getToolById, getToolBySlug } from "@/content/toolsCatalog";
import { getTemplateById } from "@/content/templatesCatalog";

type FavRow = {
  id: number;
  target_type: string;
  target_id: string;
  created_at: string;
};

function resolveTitle(type: string, id: string): { title: string; category: string } {
  if ("term" === type) {
    if (/^\d+$/.test(id)) {
      const t = getTermById(id);
      return { title: t?.name || `名词 #${id}`, category: t?.category || "名词" };
    }
    const bySlug = getTermBySlug(id);
    if (bySlug) {
      return { title: bySlug.name, category: bySlug.category };
    }
    return { title: id, category: "名词" };
  }
  if ("tool" === type) {
    if (/^\d+$/.test(id)) {
      const t = getToolById(id);
      return { title: t?.name || `工具 #${id}`, category: t?.category || "工具" };
    }
    const bySlug = getToolBySlug(id);
    if (bySlug) {
      return { title: bySlug.name, category: bySlug.category };
    }
    return { title: id, category: "工具" };
  }
  const n = Number(id);
  const tpl = getTemplateById(Number.isNaN(n) ? -1 : n);
  return { title: tpl?.title || `模板 #${id}`, category: tpl?.category || "模板" };
}

export function Favorites() {
  const { accessToken } = useAuth();
  const [items, setItems] = useState<FavRow[]>([]);
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
        const payload = await apiClient.getFavorites(accessToken);
        const list = (payload?.items || []) as FavRow[];
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

  return (
    <div className="figma-page py-12 bg-secondary/30">
      <div className="figma-container max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Heart className="w-4 h-4" />
            <span className="text-sm">我的收藏</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-2">收藏列表</h1>
          <p className="text-muted-foreground">名词与工具收藏与会员权益相关，模板收藏后续版本支持。</p>
          {!loading && !error && items.length > 0 ? (
            <div className="mt-4 flex justify-center">
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-border"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "commonones-favorites.json";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                导出收藏为 JSON
              </Button>
            </div>
          ) : null}
        </motion.div>

        {loading ? (
          <p className="text-center text-muted-foreground">正在加载…</p>
        ) : error ? (
          <Card className="rounded-3xl border-border p-8 text-center text-destructive">{error}</Card>
        ) : 0 === items.length ? (
          <Card className="rounded-3xl border-border p-10 text-center text-muted-foreground">
            暂无收藏。去
            <Link to="/terms" className="text-primary hover:underline mx-1">
              名词库
            </Link>
            或
            <Link to="/tools" className="text-primary hover:underline mx-1">
              工具库
            </Link>
            点亮心形即可收藏。
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((row, index) => {
              const meta = resolveTitle(row.target_type, row.target_id);
              const href = (() => {
                if ("term" === row.target_type) {
                  const t = /^\d+$/.test(row.target_id)
                    ? getTermById(row.target_id)
                    : getTermBySlug(row.target_id);
                  return t ? `/term/${t.slug}` : `/term/${encodeURIComponent(row.target_id)}`;
                }
                if ("tool" === row.target_type) {
                  const t = /^\d+$/.test(row.target_id)
                    ? getToolById(row.target_id)
                    : getToolBySlug(row.target_id);
                  return t ? `/tool/${t.slug}` : `/tool/${encodeURIComponent(row.target_id)}`;
                }
                return "/templates";
              })();
              return (
                <motion.div
                  key={row.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Link to={href}>
                    <Card className="rounded-3xl border-border p-6 bg-white hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="rounded-full border-0 text-xs">
                              {"term" === row.target_type
                                ? "名词"
                                : "tool" === row.target_type
                                  ? "工具"
                                  : "其他"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{meta.category}</span>
                          </div>
                          <h2 className="font-semibold text-foreground">{meta.title}</h2>
                        </div>
                        <span className="text-sm text-muted-foreground shrink-0">查看 →</span>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
