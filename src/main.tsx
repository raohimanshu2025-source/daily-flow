import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import "./index.css";
import { initNative } from "./lib/native";

// Register service worker for PWA — guarded against Lovable preview, iframes, dev, and Capacitor
if ('serviceWorker' in navigator) {
  const h = window.location.hostname;
  const isPreview =
    h.startsWith('id-preview--') ||
    h.startsWith('preview--') ||
    h.endsWith('.lovableproject.com') ||
    h.endsWith('.lovableproject-dev.com') ||
    h.endsWith('.beta.lovable.dev');
  const isCapacitor = window.location.protocol === 'capacitor:' || /Capacitor/i.test(navigator.userAgent);
  const inIframe = window.self !== window.top;
  const killed = new URLSearchParams(window.location.search).get('sw') === 'off';

  if (import.meta.env.PROD && !isPreview && !isCapacitor && !inIframe && !killed) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  } else {
    navigator.serviceWorker.getRegistrations().then((regs) =>
      regs.forEach((r) => r.unregister().catch(() => {}))
    );
  }
}

// Initialize Capacitor native features (no-op on web)
initNative();

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
