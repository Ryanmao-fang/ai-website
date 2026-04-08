import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router";
import { AdminProvider, useAdmin } from "../context/AdminContext";
import { useAuth } from "../context/AuthContext";
import { useLoginDialog } from "../context/LoginDialogContext";
import { adminApi } from "../lib/adminApi";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";

function AdminGateInner() {
  const { userId, email } = useAuth();
  const { openLogin } = useLoginDialog();
  const { token, expiresAt, loading, login, logout, setToken } = useAdmin();
  const [adminMe, setAdminMe] = useState<{ username: string; adminNote: string } | null>(null);
  const [username, setUsername] = useState("Ryan");
  const [password, setPassword] = useState("Mao20010917");
  const [err, setErr] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const expired = useMemo(() => {
    if (!token || !expiresAt) {
      return false;
    }
    return Date.now() >= expiresAt;
  }, [token, expiresAt]);

  useEffect(() => {
    if (expired) {
      setToken(null, null);
    }
  }, [expired, setToken]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) {
        setAdminMe(null);
        return;
      }
      try {
        const payload = await adminApi.me(token);
        const me = (payload as { admin?: { username?: string; adminNote?: string } })?.admin;
        if (!cancelled) {
          setAdminMe({
            username: String(me?.username || ""),
            adminNote: String(me?.adminNote || ""),
          });
        }
      } catch (e) {
        if (!cancelled) {
          setAdminMe(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!userId) {
    return (
      <div className="min-h-screen bg-secondary/30 py-12">
        <div className="max-w-xl mx-auto px-4">
          <Card className="rounded-3xl border-border p-8 bg-white">
            <h1 className="text-xl font-semibold text-foreground mb-2">管理台</h1>
            <p className="text-sm text-muted-foreground mb-6">进入管理台前需要先登录你的站点账号。</p>
            <Button className="rounded-full bg-primary hover:bg-accent" onClick={() => openLogin()}>
              登录
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-secondary/30 py-12">
        <div className="max-w-xl mx-auto px-4">
          <Card className="rounded-3xl border-border p-8 bg-white">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-xl font-semibold text-foreground">管理台登录</h1>
                <p className="text-xs text-muted-foreground mt-1">当前站点账号：{email || userId}</p>
              </div>
              <Badge variant="secondary" className="rounded-full border-0">
                /admin
              </Badge>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">账号</p>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} className="rounded-full" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">密码</p>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-full"
                />
              </div>
              {err ? <p className="text-sm text-destructive">{err}</p> : null}
              <Button
                className="rounded-full bg-primary hover:bg-accent w-full"
                disabled={loading}
                onClick={async () => {
                  setErr("");
                  try {
                    await login({ username, password, userId });
                    const next = location.pathname.startsWith("/admin") ? location.pathname : "/admin";
                    navigate(next, { replace: true });
                  } catch (e) {
                    setErr((e as Error)?.message || "登录失败");
                  }
                }}
              >
                登录管理台
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // 默认子路由
  if ("/admin" === location.pathname || "/admin/" === location.pathname) {
    return <Navigate to="/admin/terms" replace />;
  }

  const navItems = [
    { to: "/admin/terms", label: "名词" },
    { to: "/admin/tools", label: "工具" },
    { to: "/admin/templates", label: "模板" },
    { to: "/admin/learning-paths", label: "学习路线" },
    { to: "/admin/assets", label: "素材" },
    { to: "/admin/users", label: "用户" },
    { to: "/admin/orders", label: "订单" },
    { to: "/admin/tickets", label: "工单" },
  ];

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-foreground">管理台</h1>
            <p className="text-xs text-muted-foreground">
              {adminMe?.username ? `管理员：${adminMe.username}` : "已登录"} {adminMe?.adminNote ? `· ${adminMe.adminNote}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="text-sm text-muted-foreground hover:underline">
              返回前台
            </Link>
            <Button variant="outline" className="rounded-full" onClick={() => logout()}>
              退出管理台
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {navItems.map((n) => (
            <Link key={n.to} to={n.to}>
              <Button variant="outline" size="sm" className="rounded-full">
                {n.label}
              </Button>
            </Link>
          ))}
        </div>

        <Outlet />
      </div>
    </div>
  );
}

export function AdminGate() {
  return (
    <AdminProvider>
      <AdminGateInner />
    </AdminProvider>
  );
}

