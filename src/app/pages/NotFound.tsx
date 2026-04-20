import { Link } from "react-router";
import { Home, Search } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { motion } from "motion/react";

export function NotFound() {
  return (
    <div className="figma-page flex items-center py-20">
      <div className="figma-container max-w-lg w-full text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="rounded-3xl border-border p-10 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent">
            <p className="text-6xl font-semibold text-primary mb-2">404</p>
            <h1 className="text-2xl font-semibold text-foreground mb-3">页面不存在或已移动</h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              请检查链接是否正确，或返回首页、使用全站搜索继续浏览。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/">
                <Button className="rounded-full bg-primary hover:bg-accent w-full sm:w-auto">
                  <Home className="w-4 h-4 mr-2" />
                  回到首页
                </Button>
              </Link>
              <Link to="/search">
                <Button variant="outline" className="rounded-full border-border w-full sm:w-auto">
                  <Search className="w-4 h-4 mr-2" />
                  全站搜索
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
