import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Search, Menu, X, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { LoginDialog } from "./LoginDialog";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const { userId, email, isPro, signOut } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: "首页", path: "/" },
    { name: "AI名词", path: "/terms" },
    { name: "工具库", path: "/tools" },
    { name: "学习路线", path: "/learning-path" },
    { name: "模板库", path: "/templates" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-foreground">AI通识</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant="ghost"
                    className={`relative px-4 ${
                      isActive(item.path)
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.name}
                    {isActive(item.path) && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Button>
                </Link>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-muted-foreground hover:text-foreground"
              >
                <Search className="w-5 h-5" />
              </Button>

              <Button
                onClick={() => setIsLoginOpen(true)}
                className="hidden sm:flex rounded-full bg-primary hover:bg-accent transition-colors"
              >
                {userId ? (isPro ? "PRO会员" : "开通会员") : "登录"}
              </Button>
              {userId ? (
                <Button
                  variant="outline"
                  className="hidden sm:flex rounded-full border-border"
                  onClick={() => signOut()}
                >
                  退出
                </Button>
              ) : null}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-border bg-background"
            >
              <div className="px-4 py-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className={`w-full justify-start ${
                        isActive(item.path)
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.name}
                    </Button>
                  </Link>
                ))}
                <Button
                  onClick={() => {
                    setIsLoginOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full rounded-full bg-primary hover:bg-accent"
                >
                  {userId ? "会员中心" : "登录"}
                </Button>
                {userId ? (
                  <Button
                    variant="outline"
                    className="w-full rounded-full border-border"
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    退出登录
                  </Button>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {userId ? (
        <div className="border-b border-border bg-background/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 text-sm text-muted-foreground">
            当前账户：{email} · 状态：{isPro ? "会员已开通" : "未开通会员"}
          </div>
        </div>
      ) : null}

      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </>
  );
}
