import { Link } from "react-router";
import { Sparkles, Mail, Github, Twitter } from "lucide-react";

export function Footer() {
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
      { name: "用户协议", path: "#" },
      { name: "隐私政策", path: "#" },
    ],
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
              <span className="text-xl font-semibold text-foreground">AI通识</span>
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
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-muted-foreground">
          <p>© 2026 AI通识. 用心陪伴每一位AI学习者</p>
        </div>
      </div>
    </footer>
  );
}
