import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

type Props = { children: ReactNode };

type State = { hasError: boolean; message: string };

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message || "未知错误" };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error("ErrorBoundary", error, info);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
          <Card className="max-w-lg rounded-3xl border-border p-8 text-center space-y-4">
            <h1 className="text-xl font-semibold text-foreground">页面出了点问题</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              请刷新重试。若多次出现，可通过「意见反馈」或邮件附上大致时间与浏览器版本，便于排查。
            </p>
            <p className="text-xs text-muted-foreground break-all">细节：{this.state.message}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                type="button"
                className="rounded-full bg-primary"
                onClick={() => window.location.reload()}
              >
                刷新页面
              </Button>
              <Link to="/">
                <Button type="button" variant="outline" className="rounded-full border-border">
                  返回首页
                </Button>
              </Link>
              <Link to="/feedback">
                <Button type="button" variant="ghost" className="rounded-full">
                  意见反馈
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}
