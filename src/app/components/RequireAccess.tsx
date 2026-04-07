import type { ReactNode } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import type { AccessMinTier } from "@/lib/membershipTier";
import { tierMeetsMin } from "@/lib/membershipTier";
import { AccessNoticeDialog } from "./AccessNoticeDialog";

type RequireAccessProps = {
  /** 页面所需的最低权益；auth 表示仅要求已登录（含免费版） */
  minTier: AccessMinTier;
  children: ReactNode;
};

export function RequireAccess({ minTier, children }: RequireAccessProps) {
  const { loading, userId, membershipTier } = useAuth();
  const navigate = useNavigate();
  const [upgradeNoticeOpen, setUpgradeNoticeOpen] = useState(false);
  const guestRedirectedRef = useRef(false);

  useLayoutEffect(() => {
    if (loading) {
      return;
    }
    if (!userId) {
      if (!guestRedirectedRef.current) {
        guestRedirectedRef.current = true;
        navigate("/", { replace: true, state: { openLogin: true } });
      }
    } else {
      guestRedirectedRef.current = false;
    }
  }, [loading, userId, navigate]);

  useEffect(() => {
    if (loading) {
      return;
    }
    if (!userId) {
      return;
    }
    if (!tierMeetsMin(membershipTier, minTier)) {
      setUpgradeNoticeOpen(true);
    } else {
      setUpgradeNoticeOpen(false);
    }
  }, [loading, userId, membershipTier, minTier]);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-muted-foreground">
        正在加载权限信息...
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-muted-foreground text-sm px-4 text-center">
        正在返回首页…
      </div>
    );
  }

  const allowed = "auth" === minTier ? true : tierMeetsMin(membershipTier, minTier);

  return (
    <>
      <AccessNoticeDialog
        open={Boolean(!allowed && upgradeNoticeOpen)}
        onOpenChange={setUpgradeNoticeOpen}
        variant="upgrade"
        onRequestLogin={() => setUpgradeNoticeOpen(false)}
      />

      {!allowed ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-4 text-center text-muted-foreground">
          <p className="text-sm">该内容为进阶或专业会员专享。</p>
          {!upgradeNoticeOpen ? (
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => setUpgradeNoticeOpen(true)}
            >
              查看提示
            </button>
          ) : null}
        </div>
      ) : (
        children
      )}
    </>
  );
}
