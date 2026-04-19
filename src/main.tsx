import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// Detect if running as browser extension
if (window.location.protocol === "chrome-extension:" || 
    window.location.protocol === "moz-extension:" || 
    window.location.protocol === "extension:") {
  document.documentElement.classList.add("extension-popup");
  document.body.classList.add("extension-popup");
  // Inject extension-specific styles directly
  const style = document.createElement('style');
  style.textContent = `
    html.extension-popup,
    body.extension-popup {
      width: 400px !important;
      min-width: 400px !important;
      max-width: 400px !important;
      height: auto;
      min-height: 500px;
      margin: 0 !important;
      padding: 0 !important;
    }
    
    html.extension-popup #root,
    body.extension-popup #root {
      width: 100% !important;
      max-width: 400px !important;
      min-height: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    
    /* Force display properties */
    body.extension-popup {
      display: block !important;
      overflow: visible !important;
    }
    
    /* Reset body padding that was causing the narrow column */
    body.extension-popup {
      padding: 0 !important;
    }
  `;
  document.head.appendChild(style);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
