import { useState } from "react";
import Navigation from "./components/navigation";
import Homepage from "./components/homepage";
import CustomForm from "./components/custom-form";

type PageType = "home" | "custom";

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>("home");

  const handleNavigate = (page: PageType) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#060B1A] text-[#EAF1FF]">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      {"home" === currentPage && <Homepage onNavigate={handleNavigate} />}
      {"custom" === currentPage && <CustomForm onNavigate={handleNavigate} />}
      <button
        className="fixed bottom-4 right-4 z-40 rounded-full bg-[#165DFF] px-4 py-3 text-xs font-semibold text-white shadow-[0_2px_12px_rgba(22,93,255,0.3)] md:hidden"
        onClick={() => handleNavigate("custom")}
      >
        添加微信咨询
      </button>
    </div>
  );
}
