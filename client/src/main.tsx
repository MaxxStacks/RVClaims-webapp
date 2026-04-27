import { createRoot } from "react-dom/client";
import React from "react";
import App from "./App";
import "./index.css";
import "./styles/pages.css";
import "./styles/portal.css";
import './styles/portal-responsive.css';
import './styles/portal-mobile.css';
import { initMobileSidebar, registerServiceWorker } from './lib/mobile';
import { initMobileApp } from './lib/mobile-init';
import toyHaulerUrl from "@assets/generated_images/Modern_luxury_toy_hauler_2050a416.webp";
import { ClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");

// Preload the toy hauler image so it's ready when the promo modal opens after 1s
const _preload = document.createElement("link");
_preload.rel = "preload";
_preload.as = "image";
_preload.type = "image/webp";
_preload.href = toyHaulerUrl;
_preload.setAttribute("fetchpriority", "high");
document.head.appendChild(_preload);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        variables: {
          colorPrimary: "#033280",
        },
      }}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
);

initMobileSidebar();
registerServiceWorker();
initMobileApp();
