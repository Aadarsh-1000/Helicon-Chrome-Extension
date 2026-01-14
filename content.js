"use strict";

let textToHighlight = "";
let enabled = false;

/* ===============================
   INJECT JARVIS HUD CSS
================================ */
const style = document.createElement("style");
style.textContent = `
  .jarvis-hud {
    position: relative !important;
    background:
      linear-gradient(135deg, rgba(0,234,255,0.08), rgba(0,234,255,0.02)),
      repeating-linear-gradient(
        0deg,
        rgba(0,234,255,0.05) 0px,
        rgba(0,234,255,0.05) 1px,
        transparent 1px,
        transparent 4px
      ) !important;
    border: 1px solid rgba(0,234,255,0.6) !important;
    border-left: 3px solid #00eaff !important;
    color: #aef6ff !important;
    font-family: "Orbitron", monospace !important;
    text-shadow: 0 0 6px rgba(0,234,255,0.9);
    padding: 6px 10px !important;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .jarvis-hud::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #00eaff, transparent);
    animation: jarvisScan 2s linear infinite;
  }

  @keyframes jarvisScan {
    from { top: 0%; }
    to { top: 100%; }
  }
`;
document.documentElement.appendChild(style);

/* ===============================
   PROCESS DOM
================================ */
function processNode(node) {
  if (!enabled) return;

  if (node.childNodes.length > 0) {
    node.childNodes.forEach(processNode);
  }

  if (
    node.nodeType === Node.TEXT_NODE &&
    node.textContent &&
    node.textContent.includes(textToHighlight)
  ) {
    const parent = node.parentElement;
    if (parent) parent.classList.add("jarvis-hud");
  }
}

/* ===============================
   OBSERVER
================================ */
const observer = new MutationObserver((mutations) => {
  mutations.forEach((m) => {
    m.addedNodes.forEach(processNode);
  });
});

/* ===============================
   INITIAL LOAD
================================ */
chrome.storage.sync.get(
  { enabled: false, item: "" },
  (data) => {
    enabled = data.enabled;
    textToHighlight = data.item;

    if (enabled) {
      processNode(document.body);
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  }
);

/* ===============================
   LIVE STORAGE UPDATES
================================ */
chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    enabled = changes.enabled.newValue;

    if (!enabled) {
      observer.disconnect();
      document
        .querySelectorAll(".jarvis-hud")
        .forEach(el => el.classList.remove("jarvis-hud"));
    }
  }

  if (changes.item) {
    textToHighlight = changes.item.newValue || "";
  }
});
