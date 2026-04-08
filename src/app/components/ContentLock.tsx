import type { ReactNode } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Lock } from "lucide-react";

type ContentLockProps = {
  /** 为 true 时直接展示子内容 */
  unlocked: boolean;
  /** 锁定时的说明 */
  message?: string;
  /** 锁定时的按钮文案 */
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
  className?: string;
};

/**
 * 未登录/无权限时的内容区蒙层（与任务文档「ContentLock」对齐，沿用本站视觉）
 */
export function ContentLock({
  unlocked,
  message = "登录后继续阅读完整内容",
  actionLabel = "登录 / 注册",
  onAction,
  children,
  className = "",
}: ContentLockProps) {
  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div className={`relative rounded-3xl ${className}`}>
      <div className="pointer-events-none select-none blur-sm opacity-60 max-h-[280px] overflow-hidden">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-3xl bg-background/75 px-6 text-center backdrop-blur-[2px]">
        <Lock className="w-10 h-10 text-primary" aria-hidden />
        <p className="text-sm text-muted-foreground max-w-md leading-relaxed">{message}</p>
        {onAction ? (
          <Button type="button" className="rounded-full bg-primary pointer-events-auto" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function ContentLockInline({
  unlocked,
  message,
  onAction,
  actionLabel,
  children,
}: Omit<ContentLockProps, "className">) {
  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <Card className="rounded-3xl border-dashed border-2 border-primary/30 bg-primary/5 p-8 text-center space-y-4">
      <Lock className="w-8 h-8 text-primary mx-auto" aria-hidden />
      <p className="text-sm text-muted-foreground leading-relaxed">
        {message || "登录后查看本节完整内容"}
      </p>
      {onAction ? (
        <Button type="button" className="rounded-full bg-primary" onClick={onAction}>
          {actionLabel || "登录 / 注册"}
        </Button>
      ) : null}
    </Card>
  );
}
