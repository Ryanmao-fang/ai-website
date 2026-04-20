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
  const [overview, setOverview] = useState<{ terms: number; tools: number; users: number; orders: number } | null>(null);
  const [healthErr, setHealthErr] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [authErr, setAuthErr] = useState("");
  const [lastSyncAt, setLastSyncAt] = useState<number>(0);
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
        const me = (payload as { admin?: { userId?: string; username?: string; adminNote?: string } })?.admin;
        if (!cancelled) {
          if (me?.userId && userId && String(me.userId) !== String(userId)) {
            setAuthErr("当前站点账号与后台令牌不一致，请重新登录管理台。");
            setToken(null, null);
            return;
          }
          setAdminMe({
            username: String(me?.username || ""),
            adminNote: String(me?.adminNote || ""),
          });
          setAuthErr("");
        }
      } catch (e) {
        if (!cancelled) {
          const status = (e as Error & { status?: number })?.status;
          if (401 === status || 403 === status) {
            setAuthErr("后台权限校验失败（可能未授予 is_admin 或令牌失效），请重新登录管理台。");
            setToken(null, null);
            return;
          }
          setAdminMe(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, setToken, userId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) {
        setOverview(null);
        setHealthErr("");
        return;
      }
      try {
        const [termsRes, toolsRes, usersRes, ordersRes] = await Promise.all([
          adminApi.listTerms(token),
          adminApi.listTools(token),
          adminApi.listUsers(token, { page: 1, perPage: 1 }),
          adminApi.listOrders(token, { limit: 1 }),
        ]);
        if (!cancelled) {
          const termsCount = Array.isArray((termsRes as any)?.items) ? (termsRes as any).items.length : 0;
          const toolsCount = Array.isArray((toolsRes as any)?.items) ? (toolsRes as any).items.length : 0;
          const usersCount = Array.isArray((usersRes as any)?.items) ? (usersRes as any).items.length : 0;
          const ordersCount = Array.isArray((ordersRes as any)?.items) ? (ordersRes as any).items.length : 0;
          setOverview({
            terms: termsCount,
            tools: toolsCount,
            users: usersCount,
            orders: ordersCount,
          });
          setLastSyncAt(Date.now());
          setHealthErr("");
        }
      } catch (e) {
        if (!cancelled) {
          setOverview(null);
          setHealthErr((e as Error)?.message || "管理接口连接失败");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!userId) {
    return (
      <div className="figma-page bg-secondary/30 py-12">
        <div className="figma-container max-w-xl">
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
      <div className="figma-page bg-secondary/30 py-12">
        <div className="figma-container max-w-xl">
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
              {authErr ? <p className="text-sm text-destructive">{authErr}</p> : null}
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
                disabled={loading || !username.trim() || !password.trim()}
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
    { to: "/admin/ops", label: "运营看板" },
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
    <div className="figma-page bg-background">
      <div className="border-b border-border bg-white/95 backdrop-blur">
        <div className="figma-container py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-foreground">运营管理控制台</h1>
            <p className="text-xs text-muted-foreground">
              {adminMe?.username ? `管理员：${adminMe.username}` : "已登录"}
              {adminMe?.adminNote ? ` · ${adminMe.adminNote}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
              返回主站
            </Link>
            <Button variant="outline" className="rounded-full" onClick={() => logout()}>
              退出
            </Button>
          </div>
        </div>
      </div>

      <div className="figma-container py-6 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <Card className="rounded-3xl border-border p-4 bg-white h-fit lg:sticky lg:top-6">
          <p className="text-xs text-muted-foreground mb-3">运营导航</p>
          <div className="space-y-2">
            {navItems.map((n) => (
              <Link key={n.to} to={n.to}>
                <Button
                  variant={location.pathname === n.to ? "default" : "outline"}
                  size="sm"
                  className="rounded-full w-full justify-start"
                >
                  {n.label}
                </Button>
              </Link>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="rounded-3xl border-border p-4 bg-white">
              <p className="text-xs text-muted-foreground">已收录名词</p>
              <p className="text-2xl font-semibold text-foreground mt-1">{overview ? overview.terms : "-"}</p>
            </Card>
            <Card className="rounded-3xl border-border p-4 bg-white">
              <p className="text-xs text-muted-foreground">已收录工具</p>
              <p className="text-2xl font-semibold text-foreground mt-1">{overview ? overview.tools : "-"}</p>
            </Card>
            <Card className="rounded-3xl border-border p-4 bg-white">
              <p className="text-xs text-muted-foreground">本页用户样本</p>
              <p className="text-2xl font-semibold text-foreground mt-1">{overview ? overview.users : "-"}</p>
            </Card>
            <Card className="rounded-3xl border-border p-4 bg-white">
              <p className="text-xs text-muted-foreground">订单样本</p>
              <p className="text-2xl font-semibold text-foreground mt-1">{overview ? overview.orders : "-"}</p>
            </Card>
          </div>

          <Card className="rounded-3xl border-border p-4 bg-white">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Badge className="rounded-full border-0 bg-emerald-100 text-emerald-700">
                {healthErr ? "接口异常" : "接口正常"}
              </Badge>
              <span className="text-muted-foreground">
                最近同步：{lastSyncAt ? new Date(lastSyncAt).toLocaleString() : "尚未同步"}
              </span>
            </div>
            {healthErr ? <p className="text-xs text-destructive mt-2">{healthErr}</p> : null}
          </Card>

          <Outlet />
        </div>
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

