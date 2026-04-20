type PageType = "home" | "custom";

interface NavigationProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
}

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-[#E0E6ED] bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6">
        <button className="flex items-center gap-2" onClick={() => onNavigate("home")}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#165DFF] to-[#4080FF] text-sm font-bold text-white">
            AI
          </span>
          <span className="text-sm font-semibold text-[#333333] md:text-base">commononesAI</span>
        </button>
        <div className="flex items-center gap-6 md:gap-8">
          <button
            onClick={() => onNavigate("home")}
            className={`relative text-sm transition-colors duration-300 ${
              "home" === currentPage ? "text-[#165DFF]" : "text-[#666666] hover:text-[#165DFF]"
            }`}
          >
            首页
            {"home" === currentPage && <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#165DFF]" />}
          </button>
          <button
            onClick={() => onNavigate("custom")}
            className={`relative text-sm transition-colors duration-300 ${
              "custom" === currentPage ? "text-[#165DFF]" : "text-[#666666] hover:text-[#165DFF]"
            }`}
          >
            定制需求
            {"custom" === currentPage && (
              <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#165DFF]" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
