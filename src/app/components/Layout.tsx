import { useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { LoginDialogProvider, useLoginDialog } from "../context/LoginDialogContext";

function OpenLoginFromRouteState() {
  const location = useLocation();
  const navigate = useNavigate();
  const { openLogin } = useLoginDialog();
  const handledLocationKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const state = location.state as { openLogin?: boolean } | null;
    if (!state || !state.openLogin) {
      return;
    }

    if (handledLocationKeyRef.current === location.key) {
      return;
    }
    handledLocationKeyRef.current = location.key;

    openLogin();

    navigate(
      {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
      },
      { replace: true, state: null }
    );
  }, [location.key, location.pathname, location.search, location.hash, location.state, navigate, openLogin]);

  return null;
}

function LayoutInner() {
  return (
    <div className="min-h-screen flex flex-col">
      <OpenLoginFromRouteState />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

/**
 * LoginDialog 必须挂在 RouterProvider 子树内，否则 Dialog 内 <Link> 无法取到路由 context。
 */
export function Layout() {
  return (
    <LoginDialogProvider>
      <LayoutInner />
    </LoginDialogProvider>
  );
}
