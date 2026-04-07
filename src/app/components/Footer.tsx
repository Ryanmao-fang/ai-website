import { Link } from "react-router";
import { Mail, Github, Twitter, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLoginDialog } from "../context/LoginDialogContext";

export function Footer() {
  const { userId } = useAuth();
  const { openLogin } = useLoginDialog();

  const productPaths = ["/terms", "/tools", "/learning-path", "/templates"];

  const footerLinks = {
    产品: [
      { name: "AI名词", path: "/terms" },
      { name: "工具库", path: "/tools" },
      { name: "学习路线", path: "/learning-path" },
      { name: "模板库", path: "/templates" },
    ],
    关于: [
      { name: "关于我们", path: "#" },
      { name: "联系我们", path: "#" },
      { name: "用户协议", path: "/legal/user-agreement" },
      { name: "隐私政策", path: "/legal/privacy-policy" },
    ],
  };

  const renderLink = (category: string, name: string, path: string) => {
    const needsLogin = "产品" === category && productPaths.includes(path);

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

  return (
    <footer className="bg-secondary/50 border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-foreground">CommononesAI</span>
            </Link>
            <p className="text-muted-foreground max-w-md leading-relaxed mb-4">
              让AI学习变得简单愉快，打造最温暖的AI学习社区。
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
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

        <div className="mt-12 pt-8 border-t border-border text-center text-muted-foreground">
          <p>© 2026 CommononesAI. 用心陪伴每一位AI学习者</p>
        </div>
      </div>
    </footer>
  );
}
