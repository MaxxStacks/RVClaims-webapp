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
          colorPrimary: '#033280',
          colorText: '#1a1a2e',
          colorTextSecondary: '#64748b',
          colorBackground: '#ffffff',
          colorInputBackground: '#f8fafc',
          colorInputText: '#1a1a2e',
          borderRadius: '8px',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '14px',
        },
        elements: {
          formButtonPrimary: {
            backgroundColor: '#033280',
            '&:hover': { backgroundColor: '#022160' },
          },
          card: {
            boxShadow: 'none',
            border: '1px solid #e2e8f0',
          },
          headerTitle: {
            fontWeight: '700',
            fontSize: '24px',
          },
          socialButtonsBlockButton: {
            border: '1px solid #e2e8f0',
            '&:hover': { backgroundColor: '#f8fafc' },
          },
          footerActionLink: {
            color: '#033280',
            '&:hover': { color: '#022160' },
          },
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
