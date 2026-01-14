"use strict";

// Initialize defaults ON INSTALL
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    enabled: false,
    item: ""
  });
});

// Listen safely for popup messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!request || typeof request.enabled !== "boolean") return;

  chrome.storage.sync.set({ enabled: request.enabled });

  console.log(
    request.enabled
      ? "JARVIS: System Enabled"
      : "JARVIS: System Disabled"
  );
});
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "AI_QUERY") {
    callAI(msg.prompt).then(reply => {
      sendResponse({ reply });
    });
    return true;
  }
});

