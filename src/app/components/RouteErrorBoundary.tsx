import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

/**
 * 路由内错误边界，避免单页崩溃导致整站白屏
 */
export class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("RouteErrorBoundary:", error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center px-6 py-16 text-center">
          <h1 className="text-xl font-semibold text-foreground mb-2">页面暂时无法显示</h1>
          <p className="text-muted-foreground text-sm max-w-md mb-6">
            可以刷新重试，或返回首页继续浏览。
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              type="button"
              className="rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground hover:bg-muted/60"
              onClick={() => window.location.reload()}
            >
              刷新
            </button>
            <Link
              to="/"
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-accent"
            >
              回首页
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
