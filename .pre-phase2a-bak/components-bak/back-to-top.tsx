import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let rafId: number;
    const toggleVisibility = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        // Defer DOM geometry reads until after paint to avoid forced reflow
        const scrollPosition = window.scrollY + window.innerHeight;
        const pageHeight = document.documentElement.scrollHeight;
        const nearBottom = pageHeight - scrollPosition < 200;
        setIsVisible(nearBottom);
      });
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    // Check on mount as well
    toggleVisibility();

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-300 flex items-center gap-2 font-medium text-base"
      data-testid="button-back-to-top"
      aria-label="Back to top"
    >
      <ArrowUp className="w-5 h-5" />
      Back to Top
    </button>
  );
}
