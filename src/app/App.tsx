import { useEffect, useState } from "react";
import Navigation from "./components/navigation";
import Homepage from "./components/homepage";
import CustomForm from "./components/custom-form";

type PageType = "home" | "custom";

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>("home");
  const [showLeavePrompt, setShowLeavePrompt] = useState<boolean>(false);

  const handleNavigate = (page: PageType) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const onMouseLeave = (event: MouseEvent) => {
      if (event.clientY <= 0) {
        setShowLeavePrompt(true);
      }
    };
    document.addEventListener("mouseleave", onMouseLeave);
    return () => document.removeEventListener("mouseleave", onMouseLeave);
  }, []);

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
      {showLeavePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md rounded-xl border border-[#22345F] bg-[#101A35] p-6 shadow-[0_6px_20px_rgba(22,93,255,0.25)]">
            <h3 className="text-lg font-semibold text-[#EAF1FF]">离开前提示</h3>
            <p className="mt-2 text-sm text-[#AFC0E8]">
              定制需求已生成预估报价，添加微信即可解锁专属定制方案。
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                className="rounded-lg border border-[#22345F] px-3 py-2 text-sm text-[#AFC0E8]"
                onClick={() => setShowLeavePrompt(false)}
              >
                继续浏览
              </button>
              <button
                className="rounded-lg bg-[#165DFF] px-3 py-2 text-sm text-white"
                onClick={() => {
                  setShowLeavePrompt(false);
                  handleNavigate("custom");
                }}
              >
                添加微信
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
