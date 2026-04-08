import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Search, Heart } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "@/lib/api";
import { tierMeetsMin } from "@/lib/membershipTier";
import { AccessNoticeDialog } from "../components/AccessNoticeDialog";
import { listTermsSummary } from "@/content/termsCatalog";

export function TermsList() {
  const { accessToken, membershipTier } = useAuth();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [favoriteIdSet, setFavoriteIdSet] = useState<Set<string>>(new Set());

  const categories = ["全部", "基础概念", "技术原理", "应用场景", "实用技能"];
  const terms = listTermsSummary();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!accessToken || !tierMeetsMin(membershipTier, "standard")) {
        return;
      }
      try {
        const payload = await apiClient.getFavorites(accessToken);
        const rows = (payload?.items || []) as { target_type: string; target_id: string }[];
        const next = new Set<string>();
        for (const row of rows) {
          if ("term" === row.target_type) {
            next.add(row.target_id);
          }
        }
        if (!cancelled) {
          setFavoriteIdSet(next);
        }
      } catch {
        /* 忽略，列表仍可用 */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken, membershipTier]);

  const filteredTerms = terms.filter((term) => {
    const matchesSearch =
      term.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "全部" || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = async (termId: number) => {
    if (!accessToken) {
      return;
    }
    if (!tierMeetsMin(membershipTier, "standard")) {
      setUpgradeOpen(true);
      return;
    }
    try {
      await apiClient.toggleFavorite(accessToken, { targetType: "term", targetId: String(termId) });
      const id = String(termId);
      setFavoriteIdSet((prev) => {
        const copy = new Set(prev);
        if (copy.has(id)) {
          copy.delete(id);
        } else {
          copy.add(id);
        }
        return copy;
      });
    } catch (error) {
      alert((error as Error).message || "收藏失败");
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
      <div className="min-h-screen py-12 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-semibold text-foreground mb-4">AI名词库</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              用最简单的语言，理解AI的每个概念
            </p>
          </motion.div>

          <div className="mb-8 space-y-4">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="搜索AI名词..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 rounded-full border-border bg-white shadow-sm"
              />
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full ${
                    selectedCategory === category
                      ? "bg-primary hover:bg-accent"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <div className="mb-6 text-center text-muted-foreground">
            找到 {filteredTerms.length} 个相关名词
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTerms.map((term, index) => (
              <motion.div
                key={term.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="rounded-3xl border-border hover:shadow-lg transition-all p-6 bg-white group">
                  <div className="flex justify-between items-start mb-4">
                    <Badge
                      variant="secondary"
                      className="rounded-full bg-primary/10 text-primary border-0"
                    >
                      {term.category}
                    </Badge>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="收藏"
                      onClick={() => toggleFavorite(term.id)}
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          favoriteIdSet.has(String(term.id)) ? "fill-destructive text-destructive" : ""
                        }`}
                      />
                    </button>
                  </div>
                  <Link to={`/term/${term.slug}`}>
                    <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {term.name}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                      {term.description}
                    </p>
                  </Link>
                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {term.likes}
                    </span>
                    <Link to={`/term/${term.slug}`}>
                      <Button variant="ghost" size="sm" className="rounded-full text-primary">
                        查看详情 →
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {0 === filteredTerms.length ? (
            <Card className="rounded-3xl border-border p-10 text-center text-muted-foreground mt-8">
              没有匹配的名词，试试
              <Link to="/search" className="text-primary hover:underline mx-1">
                全站搜索
              </Link>
              或缩短关键字。
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}
