import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/portal.css";
import './styles/portal-responsive.css';
import './styles/portal-mobile.css';
import { initMobileSidebar, registerServiceWorker } from './lib/mobile';
import { initMobileApp } from './lib/mobile-init';

createRoot(document.getElementById("root")!).render(<App />);

initMobileSidebar();
registerServiceWorker();
initMobileApp();
