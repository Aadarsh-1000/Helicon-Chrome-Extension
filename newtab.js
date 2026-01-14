window.onload = () => {
  /* ===============================
     ELEMENTS
  ============================== */
  const input = document.getElementById("command");
  const chatLog = document.getElementById("chat-log");
  const clockEl = document.getElementById("clock");
  const boot = document.getElementById("bootSound");
  const cityInput = document.getElementById("cityInput");
  const citySuggestions = document.getElementById("citySuggestions");
  const modeBtn = document.getElementById("modeBtn");

  /* ===============================
     MODE STATE
  ============================== */
  let mode = "ai"; // ai | search
  if (modeBtn) {
    modeBtn.textContent = "AI";
    input.placeholder = "ASK HELICON";

    modeBtn.onclick = () => {
      mode = mode === "ai" ? "search" : "ai";
      modeBtn.textContent = mode === "ai" ? "AI" : "SEARCH";
      input.placeholder = mode === "ai" ? "ASK HELICON" : "SEARCH GOOGLE";
      modeBtn.classList.toggle("search", mode === "search");
    };
  }

  /* ===============================
     CHAT LOGGING
  ============================== */
  function log(role, text) {
    const div = document.createElement("div");
    div.className = `msg ${role}`;
    div.textContent = role === "user" ? `> ${text}` : text;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
    return div;
  }

  log("ai", "HELICON online. Awaiting command.");

  /* ===============================
     VOICE
  ============================== */
  function speak(text) {
    const msg = new SpeechSynthesisUtterance(text);
    msg.rate = 0.9;
    msg.pitch = 0.7;
    speechSynthesis.speak(msg);
  }

  /* ===============================
     WEATHER
  ============================== */
  function loadWeather(city) {
    if (!city) return;
    localStorage.setItem("helicon-city", city);

    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`)
      .then(res => res.json())
      .then(loc => {
        if (!loc.results?.length) {
          document.getElementById("weather-city").textContent = "CITY NOT FOUND";
          return;
        }

        const { latitude, longitude, name } = loc.results[0];
        return fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
        )
          .then(res => res.json())
          .then(data => {
            document.getElementById("weather-temp").textContent =
              Math.round(data.current_weather.temperature) + "°C";
            document.getElementById("weather-city").textContent =
              name.toUpperCase();
          });
      });
  }

  loadWeather(localStorage.getItem("helicon-city") || "Bengaluru");

  /* ===============================
     CITY AUTOCOMPLETE
  ============================== */
  if (cityInput && citySuggestions) {
    cityInput.oninput = () => {
      const q = cityInput.value.trim();
      if (q.length < 2) {
        citySuggestions.style.display = "none";
        return;
      }

      fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${q}&count=6`)
        .then(res => res.json())
        .then(data => {
          citySuggestions.innerHTML = "";
          data.results?.forEach(c => {
            const div = document.createElement("div");
            div.className = "city-option";
            div.textContent = `${c.name}, ${c.country}`;
            div.onclick = () => {
              loadWeather(c.name);
              speak(`Weather set to ${c.name}`);
              citySuggestions.style.display = "none";
              cityInput.value = "";
            };
            citySuggestions.appendChild(div);
          });
          citySuggestions.style.display = "block";
        });
    };
  }

  /* ===============================
     CLOCK + UPTIME
  ============================== */
  setInterval(() => {
    clockEl.textContent = new Date().toLocaleTimeString();
  }, 1000);

  let seconds = 0;
  setInterval(() => {
    seconds++;
    document.getElementById("uptime").textContent =
      `UPTIME: ${String((seconds / 60) | 0).padStart(2, "0")}:${String(
        seconds % 60
      ).padStart(2, "0")}`;
  }, 1000);

  /* ===============================
     SYSTEM COMMANDS
  ============================== */
  function processCommand(raw) {
    const cmd = raw.toLowerCase();

    if (cmd === "alert") {
      document.body.classList.add("alert");
      speak("Alert mode activated");
      return "Alert mode activated.";
    }

    if (cmd === "normal") {
      document.body.classList.remove("alert");
      speak("Normal mode restored");
      return "Normal mode restored.";
    }

    if (cmd.startsWith("city ")) {
      const city = cmd.replace("city ", "");
      loadWeather(city);
      return `Weather set to ${city}.`;
    }

    if (cmd === "time") {
      return new Date().toLocaleTimeString();
    }

    if (cmd.includes("open github")) {
      window.open("https://github.com", "_blank");
      return "Opening GitHub.";
    }

    return null;
  }

  /* ===============================
     AI BRIDGE
  ============================== */
  async function askAI(prompt) {
    try {
      const res = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      return data.reply;
    } catch {
      return "AI server not responding.";
    }
  }

  async function typeText(el, text, speed = 18) {
    el.textContent = "";
    for (let i = 0; i < text.length; i++) {
      el.textContent += text[i];
      chatLog.scrollTop = chatLog.scrollHeight;
      await new Promise(r => setTimeout(r, speed));
    }
  }

  /* ===============================
     INPUT HANDLER
  ============================== */
  input.onkeydown = async e => {
    if (e.key !== "Enter") return;

    const text = input.value.trim();
    if (!text) return;

    input.value = "";
    log("user", text);

    const systemReply = processCommand(text);
    if (typeof systemReply === "string") {
      log("ai", systemReply);
      return;
    }

    if (mode === "search") {
      window.open(
        `https://www.google.com/search?q=${encodeURIComponent(text)}`,
        "_blank"
      );
      log("ai", "Searching Google...");
      return;
    }

    const aiMsg = log("ai", "Thinking...");
    const reply = await askAI(text);
    await typeText(aiMsg, reply);
  };

  if (boot) boot.play();
};

/* ===============================
   MATRIX EFFECT
================================ */
const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const chars =
  "アァカサタナハマヤャラワ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const fontSize = 16;
const drops = Array(Math.floor(canvas.width / fontSize)).fill(0);

setInterval(() => {
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${fontSize}px monospace`;

  drops.forEach((y, i) => {
    ctx.fillStyle = "#00b7ff24";
    ctx.fillText(chars[Math.random() * chars.length | 0], i * fontSize, y * fontSize);
    drops[i] = y * fontSize > canvas.height && Math.random() > 0.975 ? 0 : y + 1;
  });
}, 33);

/* ===============================
   SIDEBAR SHORTCUTS (FINAL FIX)
================================ */
const dynamicContainer = document.getElementById("dynamic-shortcuts");
const addBtn = document.getElementById("addShortcutBtn");

function loadShortcuts() {
  const shortcuts = JSON.parse(localStorage.getItem("helicon-shortcuts")) || [];
  dynamicContainer.innerHTML = "";

  shortcuts.forEach((sc, index) => {
    const a = document.createElement("a");
    a.href = sc.url;
    a.className = "sidebar-shortcut";
    a.title = sc.name;
    a.target = "_blank";

    const img = document.createElement("img");
    img.src = sc.icon;
    img.alt = sc.name;
    img.onerror = () => (img.src = "default-icon.png");

    a.appendChild(img);

    /* 🗑 RIGHT-CLICK DELETE */
    a.addEventListener("contextmenu", (e) => {
      e.preventDefault();

      const ok = confirm(`Delete shortcut "${sc.name}"?`);
      if (!ok) return;

      const updated = JSON.parse(localStorage.getItem("helicon-shortcuts")) || [];
      updated.splice(index, 1);

      localStorage.setItem("helicon-shortcuts", JSON.stringify(updated));
      loadShortcuts();
    });

    dynamicContainer.appendChild(a);
  });
}
  

addBtn.onclick = async () => {
  const name = prompt("Shortcut name:");
  if (!name) return;

  let url = prompt("Website URL:");
  if (!url) return;
  if (!url.startsWith("http")) url = "https://" + url;

  const domain = new URL(url).hostname;
  let icon = `https://${domain}/favicon.ico`;

  try {
    const res = await fetch(icon, { method: "HEAD" });
    if (!res.ok) throw new Error();
  } catch {
    icon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  }

  const shortcuts = JSON.parse(localStorage.getItem("helicon-shortcuts")) || [];
  shortcuts.push({ name, url, icon });
  localStorage.setItem("helicon-shortcuts", JSON.stringify(shortcuts));
  loadShortcuts();
};

loadShortcuts();
