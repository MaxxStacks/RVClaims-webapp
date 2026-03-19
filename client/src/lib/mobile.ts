// client/src/lib/mobile.ts — Mobile sidebar toggle + PWA registration
// Injects hamburger button on mobile, manages sidebar slide-in/out
// DOES NOT modify any desktop layout — only activates below 768px

export function initMobileSidebar(): void {
  // Only init on mobile
  if (window.innerWidth > 768) return;

  const sidebar = document.querySelector(".sidebar") as HTMLElement;
  const headerLeft = document.querySelector(".header-left") as HTMLElement;
  if (!sidebar || !headerLeft) return;

  // Create overlay
  let overlay = document.querySelector(".mobile-overlay") as HTMLElement;
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "mobile-overlay";
    document.body.appendChild(overlay);
  }

  // Create hamburger button (only if not already present)
  if (!document.querySelector(".mobile-menu-btn")) {
    const btn = document.createElement("button");
    btn.className = "mobile-menu-btn";
    btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
    btn.setAttribute("aria-label", "Open menu");
    headerLeft.insertBefore(btn, headerLeft.firstChild);

    btn.addEventListener("click", () => {
      sidebar.classList.add("mobile-open");
      overlay.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  }

  // Close on overlay click
  overlay.addEventListener("click", closeMobileSidebar);

  // Close on nav item click (so user navigates after selecting)
  sidebar.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", closeMobileSidebar);
  });

  // Close on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMobileSidebar();
  });
}

function closeMobileSidebar(): void {
  const sidebar = document.querySelector(".sidebar") as HTMLElement;
  const overlay = document.querySelector(".mobile-overlay") as HTMLElement;
  if (sidebar) sidebar.classList.remove("mobile-open");
  if (overlay) overlay.classList.remove("active");
  document.body.style.overflow = "";
}

// Re-check on resize (e.g. rotating tablet)
let resizeTimer: ReturnType<typeof setTimeout>;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (window.innerWidth > 768) {
      // Reset mobile state if switching to desktop
      closeMobileSidebar();
      const btn = document.querySelector(".mobile-menu-btn");
      if (btn) btn.remove();
      const overlay = document.querySelector(".mobile-overlay");
      if (overlay) overlay.remove();
    } else {
      initMobileSidebar();
    }
  }, 250);
});

// ==================== PWA REGISTRATION ====================

export function registerServiceWorker(): void {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA] Service worker registered:", reg.scope);

          // Check for updates periodically
          setInterval(() => reg.update(), 60 * 60 * 1000); // every hour
        })
        .catch((error) => {
          console.error("[PWA] Service worker registration failed:", error);
        });
    });
  }
}

// ==================== CAMERA ACCESS (for mobile scanner) ====================

export async function openCamera(): Promise<MediaStream | null> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",  // rear camera
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    });
    return stream;
  } catch (error) {
    console.error("[CAMERA] Access denied:", error);
    return null;
  }
}

export async function capturePhoto(video: HTMLVideoElement): Promise<string | null> {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.85);
  } catch (error) {
    console.error("[CAMERA] Capture failed:", error);
    return null;
  }
}

export function stopCamera(stream: MediaStream): void {
  stream.getTracks().forEach((track) => track.stop());
}
