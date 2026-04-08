import { Link } from "react-router";
import { Mail, Github, Twitter, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLoginDialog } from "../context/LoginDialogContext";
import { siteConfig } from "@/lib/siteConfig";

export function Footer() {
  const { userId } = useAuth();
  const { openLogin } = useLoginDialog();

  const productPaths = ["/terms", "/tools", "/learning-path", "/templates"];
  const authOnlyPaths = ["/support/tickets"];

  const footerLinks = {
    产品: [
      { name: "内容导览", path: "/explore" },
      { name: "全站搜索", path: "/search" },
      { name: "AI名词", path: "/terms" },
      { name: "工具库", path: "/tools" },
      { name: "学习路线", path: "/learning-path" },
      { name: "模板库", path: "/templates" },
    ],
    支持: [
      { name: "帮助中心", path: "/help" },
      { name: "客服工单", path: "/support/tickets" },
      { name: "站点地图", path: "/site-map" },
      { name: "更新日志", path: "/changelog" },
      { name: "意见反馈", path: "/feedback" },
    ],
    关于: [
      { name: "关于我们", path: "/about" },
      { name: "联系我们", path: "/contact" },
      { name: "用户协议", path: "/legal/user-agreement" },
      { name: "隐私政策", path: "/legal/privacy-policy" },
    ],
  };

  const renderLink = (category: string, name: string, path: string) => {
    const needsLogin =
      ("产品" === category && productPaths.includes(path)) || authOnlyPaths.includes(path);

    if (needsLogin && !userId) {
      return (
        <button
          key={name}
          type="button"
          onClick={() => openLogin()}
          className="text-muted-foreground hover:text-primary transition-colors text-left"
        >
          {name}
        </button>
      );
    }

    return (
      <Link
        key={name}
        to={path}
        className="text-muted-foreground hover:text-primary transition-colors"
      >
        {name}
      </Link>
    );
  };

  const mailHref = `mailto:${siteConfig.contactEmail}`;
  const showGithub = Boolean(siteConfig.socialGithubUrl);
  const showTwitter = Boolean(siteConfig.socialTwitterUrl);

  return (
    <footer className="bg-secondary/50 border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-foreground">{siteConfig.brandName}</span>
            </Link>
            <p className="text-muted-foreground max-w-md leading-relaxed mb-4">
              {siteConfig.tagline}，打造可信赖的 AI 通识与学习入口。
            </p>
            {siteConfig.icpNumber ? (
              <p className="text-xs text-muted-foreground mb-3">ICP备案：{siteConfig.icpNumber}</p>
            ) : null}
            {siteConfig.policeRecordNumber ? (
              <p className="text-xs text-muted-foreground mb-3">公安备案：{siteConfig.policeRecordNumber}</p>
            ) : null}
            <div className="flex gap-3">
              <a
                href={mailHref}
                className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all"
                aria-label="邮件联系"
              >
                <Mail className="w-4 h-4" />
              </a>
              {showGithub ? (
                <a
                  href={siteConfig.socialGithubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all"
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
              ) : null}
              {showTwitter ? (
                <a
                  href={siteConfig.socialTwitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all"
                  aria-label="Twitter / X"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              ) : null}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-medium text-foreground mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>{renderLink(category, link.name, link.path)}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-muted-foreground space-y-2">
          <p>© 2026 {siteConfig.brandName} · {siteConfig.companyLegalName}</p>
          <p className="text-xs">
            前端版本 {siteConfig.appVersion} · 协议修订 {siteConfig.legalLastUpdated}
          </p>
          <p className="text-xs">客服邮箱：{siteConfig.supportEmail} · {siteConfig.businessHours}</p>
        </div>
      </div>
    </footer>
  );
}
