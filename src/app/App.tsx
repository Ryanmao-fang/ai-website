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
    <div className="min-h-screen bg-white text-[#333333]">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      {"home" === currentPage && <Homepage onNavigate={handleNavigate} />}
      {"custom" === currentPage && <CustomForm onNavigate={handleNavigate} />}
    </div>
  );
}
