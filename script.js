const storageKeys = {
  history: "ccc_history",
  favorites: "ccc_favorites",
  theme: "ccc_theme",
  commandCount: "ccc_command_count"
};

const state = {
  history: loadJSON(storageKeys.history, []),
  favorites: loadJSON(storageKeys.favorites, []),
  historyCursor: -1,
  commandCount: Number(localStorage.getItem(storageKeys.commandCount) || "0")
};

const el = {
  navLinks: [...document.querySelectorAll(".nav-link")],
  sections: [...document.querySelectorAll(".section")],
  sectionTitle: document.getElementById("sectionTitle"),
  themeToggle: document.getElementById("themeToggle"),
  mobileMenuBtn: document.getElementById("mobileMenuBtn"),
  sidebar: document.getElementById("sidebar"),
  terminalInput: document.getElementById("terminalInput"),
  terminalOutput: document.getElementById("terminalOutput"),
  runCommandBtn: document.getElementById("runCommandBtn"),
  favCommandBtn: document.getElementById("favCommandBtn"),
  clearTerminalBtn: document.getElementById("clearTerminalBtn"),
  historyList: document.getElementById("historyList"),
  favoritesList: document.getElementById("favoritesList"),
  statTotalCommands: document.getElementById("statTotalCommands"),
  statHistory: document.getElementById("statHistory"),
  statFavorites: document.getElementById("statFavorites"),
  statTheme: document.getElementById("statTheme"),
  jsonInput: document.getElementById("jsonInput"),
  jsonOutput: document.getElementById("jsonOutput"),
  base64Input: document.getElementById("base64Input"),
  base64Output: document.getElementById("base64Output"),
  uuidOutput: document.getElementById("uuidOutput"),
  passwordLength: document.getElementById("passwordLength"),
  passwordOutput: document.getElementById("passwordOutput"),
  timestampInput: document.getElementById("timestampInput"),
  timestampOutput: document.getElementById("timestampOutput"),
  readmeProjectName: document.getElementById("readmeProjectName"),
  readmeDescription: document.getElementById("readmeDescription"),
  readmeOutput: document.getElementById("readmeOutput"),
  commitInput: document.getElementById("commitInput"),
  commitOutput: document.getElementById("commitOutput"),
  codeInput: document.getElementById("codeInput"),
  codeOutput: document.getElementById("codeOutput")
};

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function setTheme(theme) {
  document.body.classList.toggle("light", theme === "light");
  localStorage.setItem(storageKeys.theme, theme);
  el.statTheme.textContent = theme === "light" ? "Light" : "Dark";
}

function toggleTheme() {
  const current = localStorage.getItem(storageKeys.theme) === "light" ? "light" : "dark";
  setTheme(current === "dark" ? "light" : "dark");
}

function switchSection(sectionId) {
  el.navLinks.forEach((btn) => btn.classList.toggle("active", btn.dataset.section === sectionId));
  el.sections.forEach((section) => section.classList.toggle("active", section.id === sectionId));
  el.sectionTitle.textContent = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
  el.sidebar.classList.remove("open");
}

function appendTerminal(content, isError = false) {
  const row = document.createElement("div");
  row.textContent = content;
  row.style.color = isError ? "#ff7b72" : "#7ee787";
  el.terminalOutput.appendChild(row);
  el.terminalOutput.scrollTop = el.terminalOutput.scrollHeight;
}

function clearTerminal() {
  el.terminalOutput.textContent = "";
}

function copyText(text) {
  if (!text || !text.trim()) {
    alert("Nothing to copy.");
    return;
  }
  navigator.clipboard.writeText(text).then(
    () => alert("Copied to clipboard."),
    () => alert("Copy failed.")
  );
}

function formatJSON(value) {
  return JSON.stringify(JSON.parse(value), null, 2);
}

function encodeBase64(text) {
  return btoa(unescape(encodeURIComponent(text)));
}

function decodeBase64(text) {
  return decodeURIComponent(escape(atob(text)));
}

function generateUUID() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generatePassword(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+";
  const size = Math.max(8, Math.min(128, Number(length) || 16));
  const bytes = new Uint32Array(size);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < size; i += 1) out += chars[bytes[i] % chars.length];
  return out;
}

function convertTimestamp(input) {
  if (!input) throw new Error("Timestamp or date is required.");
  const trimmed = input.trim();
  const asNum = Number(trimmed);
  const date = Number.isFinite(asNum) && trimmed !== ""
    ? new Date(trimmed.length <= 10 ? asNum * 1000 : asNum)
    : new Date(trimmed);
  if (Number.isNaN(date.getTime())) throw new Error("Invalid timestamp/date.");
  return `ISO: ${date.toISOString()}\nLocale: ${date.toLocaleString()}\nUnix (s): ${Math.floor(date.getTime() / 1000)}\nUnix (ms): ${date.getTime()}`;
}

function generateReadme(projectName, description) {
  const name = (projectName || "My Project").trim();
  const desc = (description || "A project built with Copilot Command Center.").trim();
  return `# ${name}\n\n${desc}\n\n## Features\n- Fast setup\n- Easy usage\n\n## Installation\n\`\`\`bash\nnpm install\n\`\`\`\n\n## Usage\n\`\`\`bash\nnpm start\n\`\`\`\n\n## License\nMIT`;
}

function inferCommitType(text) {
  const t = text.toLowerCase();
  if (t.includes("fix") || t.includes("bug")) return "fix";
  if (t.includes("doc") || t.includes("readme")) return "docs";
  if (t.includes("test")) return "test";
  if (t.includes("refactor")) return "refactor";
  return "feat";
}

function generateCommitMessage(changeText) {
  const clean = (changeText || "").trim();
  if (!clean) throw new Error("Please describe the changes first.");
  const type = inferCommitType(clean);
  const summary = clean.length > 64 ? `${clean.slice(0, 61)}...` : clean;
  return `${type}: ${summary}`;
}

function explainCodeSnippet(code) {
  const snippet = (code || "").trim();
  if (!snippet) throw new Error("Please provide code to explain.");
  const lines = snippet.split("\n").filter(Boolean).length;
  const mentions = [];
  if (/for|while|map|filter|reduce/.test(snippet)) mentions.push("It performs iteration/transformation.");
  if (/if|else|switch|\?/.test(snippet)) mentions.push("It contains conditional logic.");
  if (/async|await|then\(/.test(snippet)) mentions.push("It includes asynchronous behavior.");
  if (/class|function|=>/.test(snippet)) mentions.push("It defines reusable behavior.");
  if (!mentions.length) mentions.push("It executes straightforward statements.");
  return `Summary:\n- Approx. ${lines} line(s) of code.\n- ${mentions.join("\n- ")}\n\nTip:\nBreak complex statements into smaller named functions for readability.`;
}

function calculateExpression(expr) {
  const clean = (expr || "").trim();
  if (!clean) throw new Error("Please provide a mathematical expression.");
  try {
    // Only allow safe characters: digits, operators, parentheses, decimal point, spaces
    if (!/^[0-9+\-*/().\s]+$/.test(clean)) {
      throw new Error("Invalid characters in expression. Use only numbers, +, -, *, /, (, )");
    }
    // Evaluate the expression safely
    const result = Function('"use strict"; return (' + clean + ')')();
    if (typeof result !== "number") {
      throw new Error("Expression did not return a number.");
    }
    return String(result);
  } catch (e) {
    throw new Error("Calculation error: " + e.message);
  }
}

function sayHello(name) {
  const input = (name || "").trim();
  const greeting = input ? `Hello, ${input}! Welcome to Copilot Command Center.` : "Hello! Welcome to Copilot Command Center.";
  return greeting;
}

function updateStats() {
  el.statTotalCommands.textContent = String(state.commandCount);
  el.statHistory.textContent = String(state.history.length);
  el.statFavorites.textContent = String(state.favorites.length);
}

function addHistory(command, result) {
  state.history.unshift({ command, result, time: new Date().toISOString() });
  state.history = state.history.slice(0, 100);
  saveJSON(storageKeys.history, state.history);
  renderHistory();
}

function addFavorite(command) {
  const cmd = command.trim();
  if (!cmd) return;
  if (!state.favorites.includes(cmd)) {
    state.favorites.unshift(cmd);
    saveJSON(storageKeys.favorites, state.favorites);
    renderFavorites();
  }
}

function runCommand(input) {
  const command = input.trim();
  if (!command) return;
  let output;
  try {
    output = handleNaturalLanguageCommand(command);
    appendTerminal(`> ${command}`);
    appendTerminal(output);
    state.commandCount += 1;
    localStorage.setItem(storageKeys.commandCount, String(state.commandCount));
    addHistory(command, output);
    updateStats();
  } catch (error) {
    appendTerminal(`> ${command}`);
    appendTerminal(`Error: ${error.message}`, true);
    addHistory(command, `Error: ${error.message}`);
    updateStats();
  }
}

function handleNaturalLanguageCommand(command) {
  const lower = command.toLowerCase();
  if (lower.startsWith("format json")) return formatJSON(command.replace(/format json/i, "").trim());
  if (lower.startsWith("encode base64")) return encodeBase64(command.replace(/encode base64/i, "").trim());
  if (lower.startsWith("decode base64")) return decodeBase64(command.replace(/decode base64/i, "").trim());
  if (lower.includes("generate uuid") || lower === "uuid") return generateUUID();
  if (lower.includes("generate password")) {
    const match = lower.match(/length\s+(\d+)/);
    const len = match ? Number(match[1]) : 16;
    return generatePassword(len);
  }
  if (lower.startsWith("convert timestamp")) return convertTimestamp(command.replace(/convert timestamp/i, "").trim());
  if (lower.startsWith("generate readme")) return generateReadme(command.replace(/generate readme/i, "").trim(), "");
  if (lower.startsWith("commit message")) return generateCommitMessage(command.replace(/commit message/i, "").trim());
  if (lower.startsWith("explain code")) return explainCodeSnippet(command.replace(/explain code/i, "").trim());
  if (lower.startsWith("calculate")) return calculateExpression(command.replace(/calculate/i, "").trim());
  if (lower === "hello" || lower.startsWith("hello ")) return sayHello(command.replace(/hello/i, "").trim());
  if (lower === "help") {
    return [
      "Available Commands:",
      "",
      "Format & Data:",
      "- format json <json>",
      "- encode base64 <text>",
      "- decode base64 <base64>",
      "",
      "Generation:",
      "- generate uuid",
      "- generate password length <n>",
      "- generate readme <project-name>",
      "- commit message <summary>",
      "",
      "Conversion & Calculation:",
      "- convert timestamp <value>",
      "- calculate <expression>",
      "",
      "Utilities:",
      "- explain code <snippet>",
      "- hello [name]",
      "",
      "Type a command above or use the Tools section for visual interfaces."
    ].join("\n");
  }
  throw new Error("Unknown command. Type 'help' for examples.");
}

function renderHistory() {
  el.historyList.innerHTML = "";
  state.history.forEach((entry) => {
    const item = document.createElement("li");
    item.className = "list-item";
    const left = document.createElement("div");
    left.innerHTML = `<strong>${entry.command}</strong><div class="muted">${new Date(entry.time).toLocaleString()}</div>`;
    const right = document.createElement("div");
    const runBtn = document.createElement("button");
    runBtn.textContent = "Run Again";
    runBtn.addEventListener("click", () => {
      el.terminalInput.value = entry.command;
      switchSection("terminal");
      runCommand(entry.command);
    });
    right.appendChild(runBtn);
    item.append(left, right);
    el.historyList.appendChild(item);
  });
  updateStats();
}

function renderFavorites() {
  el.favoritesList.innerHTML = "";
  state.favorites.forEach((command) => {
    const item = document.createElement("li");
    item.className = "list-item";
    const label = document.createElement("strong");
    label.textContent = command;
    const right = document.createElement("div");
    const runBtn = document.createElement("button");
    runBtn.textContent = "Run";
    runBtn.addEventListener("click", () => {
      switchSection("terminal");
      el.terminalInput.value = command;
      runCommand(command);
    });
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.className = "ghost-btn";
    removeBtn.addEventListener("click", () => {
      state.favorites = state.favorites.filter((f) => f !== command);
      saveJSON(storageKeys.favorites, state.favorites);
      renderFavorites();
      updateStats();
    });
    right.append(runBtn, removeBtn);
    item.append(label, right);
    el.favoritesList.appendChild(item);
  });
  updateStats();
}

function wireToolButtons() {
  // JSON Formatter Tool
  document.getElementById("jsonFormatBtn").addEventListener("click", () => {
    try {
      el.jsonOutput.textContent = formatJSON(el.jsonInput.value);
    } catch (e) {
      el.jsonOutput.textContent = `Error: ${e.message}`;
    }
  });
  document.getElementById("jsonCopyBtn").addEventListener("click", () => copyText(el.jsonOutput.textContent));

  // Base64 Encoder/Decoder Tool
  document.getElementById("base64EncodeBtn").addEventListener("click", () => {
    try {
      el.base64Output.textContent = encodeBase64(el.base64Input.value);
    } catch (e) {
      el.base64Output.textContent = `Error: ${e.message}`;
    }
  });
  document.getElementById("base64DecodeBtn").addEventListener("click", () => {
    try {
      el.base64Output.textContent = decodeBase64(el.base64Input.value);
    } catch (e) {
      el.base64Output.textContent = `Error: ${e.message}`;
    }
  });
  document.getElementById("base64CopyBtn").addEventListener("click", () => copyText(el.base64Output.textContent));

  // UUID Generator Tool
  document.getElementById("uuidGenerateBtn").addEventListener("click", () => {
    el.uuidOutput.textContent = generateUUID();
  });
  document.getElementById("uuidCopyBtn").addEventListener("click", () => copyText(el.uuidOutput.textContent));

  // Password Generator Tool
  document.getElementById("passwordGenerateBtn").addEventListener("click", () => {
    el.passwordOutput.textContent = generatePassword(el.passwordLength.value);
  });
  document.getElementById("passwordCopyBtn").addEventListener("click", () => copyText(el.passwordOutput.textContent));

  // Timestamp Converter Tool
  document.getElementById("timestampConvertBtn").addEventListener("click", () => {
    try {
      el.timestampOutput.textContent = convertTimestamp(el.timestampInput.value);
    } catch (e) {
      el.timestampOutput.textContent = `Error: ${e.message}`;
    }
  });
  document.getElementById("timestampNowBtn").addEventListener("click", () => {
    el.timestampInput.value = String(Date.now());
    el.timestampOutput.textContent = convertTimestamp(el.timestampInput.value);
  });
  document.getElementById("timestampCopyBtn").addEventListener("click", () => copyText(el.timestampOutput.textContent));

  // README Generator Tool
  document.getElementById("readmeGenerateBtn").addEventListener("click", () => {
    el.readmeOutput.textContent = generateReadme(el.readmeProjectName.value, el.readmeDescription.value);
  });
  document.getElementById("readmeCopyBtn").addEventListener("click", () => copyText(el.readmeOutput.textContent));

  // Git Commit Message Generator Tool
  document.getElementById("commitGenerateBtn").addEventListener("click", () => {
    try {
      el.commitOutput.textContent = generateCommitMessage(el.commitInput.value);
    } catch (e) {
      el.commitOutput.textContent = `Error: ${e.message}`;
    }
  });
  document.getElementById("commitCopyBtn").addEventListener("click", () => copyText(el.commitOutput.textContent));

  // Code Explainer Tool
  document.getElementById("codeExplainBtn").addEventListener("click", () => {
    try {
      el.codeOutput.textContent = explainCodeSnippet(el.codeInput.value);
    } catch (e) {
      el.codeOutput.textContent = `Error: ${e.message}`;
    }
  });
  document.getElementById("codeCopyBtn").addEventListener("click", () => copyText(el.codeOutput.textContent));
}

function wireEvents() {
  el.navLinks.forEach((btn) => btn.addEventListener("click", () => switchSection(btn.dataset.section)));
  el.themeToggle.addEventListener("click", toggleTheme);
  el.mobileMenuBtn.addEventListener("click", () => el.sidebar.classList.toggle("open"));
  el.runCommandBtn.addEventListener("click", () => {
    runCommand(el.terminalInput.value);
    el.terminalInput.value = "";
  });
  el.favCommandBtn.addEventListener("click", () => addFavorite(el.terminalInput.value));
  el.clearTerminalBtn.addEventListener("click", clearTerminal);
  el.terminalInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      runCommand(el.terminalInput.value);
      el.terminalInput.value = "";
    } else if (event.key === "ArrowUp") {
      if (!state.history.length) return;
      state.historyCursor = Math.min(state.historyCursor + 1, state.history.length - 1);
      el.terminalInput.value = state.history[state.historyCursor].command;
      event.preventDefault();
    } else if (event.key === "ArrowDown") {
      state.historyCursor = Math.max(state.historyCursor - 1, -1);
      el.terminalInput.value = state.historyCursor >= 0 ? state.history[state.historyCursor].command : "";
      event.preventDefault();
    }
  });

  document.addEventListener("keydown", (event) => {
    const hotkey = event.ctrlKey || event.metaKey;
    if (hotkey && event.key.toLowerCase() === "k") {
      event.preventDefault();
      switchSection("terminal");
      el.terminalInput.focus();
    }
    if (hotkey && event.key.toLowerCase() === "l") {
      event.preventDefault();
      clearTerminal();
    }
    if (hotkey && event.key === "Enter") {
      event.preventDefault();
      if (document.activeElement === el.terminalInput) {
        runCommand(el.terminalInput.value);
        el.terminalInput.value = "";
      }
    }
    if (hotkey && event.key.toLowerCase() === "j") {
      event.preventDefault();
      toggleTheme();
    }
  });
}

function init() {
  const theme = localStorage.getItem(storageKeys.theme) || "dark";
  setTheme(theme);
  wireEvents();
  wireToolButtons();
  renderHistory();
  renderFavorites();
  updateStats();
  appendTerminal("Copilot Command Center ready. Type 'help' to see commands.");
}

init();
