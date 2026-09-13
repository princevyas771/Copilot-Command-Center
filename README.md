# Copilot Command Center

A polished, fully functional developer command app built with vanilla **HTML, CSS, and JavaScript**.

## Features

- Terminal-style command center with natural-language command handling
- Command history with rerun support
- Favorites (save frequent commands)
- Utility tools:
  - JSON formatter
  - Base64 encoder/decoder
  - UUID generator
  - Password generator
  - Timestamp converter
  - README generator
  - Git commit message generator
  - Code explainer
- Copy-to-clipboard actions
- localStorage persistence (history, favorites, theme)
- Keyboard shortcuts
- Dark/light mode
- Responsive design with sidebar navigation
- Dashboard statistics

## Project Structure

```text
Copilot-Command-Center/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Run Locally

No build step is required.

### Option 1: Open directly

Open `index.html` in your browser.

### Option 2: Use a local server (recommended)

```bash
cd /home/runner/work/Copilot-Command-Center/Copilot-Command-Center
python3 -m http.server 8000
```

Then visit:

```text
http://127.0.0.1:8000
```

## Keyboard Shortcuts

- `Ctrl/Cmd + K` → Focus command input
- `Ctrl/Cmd + Enter` → Run command
- `Ctrl/Cmd + L` → Clear terminal output
- `Ctrl/Cmd + J` → Toggle dark/light mode

## Supported Command Examples

- `format json {"name":"Copilot"}`
- `encode base64 hello world`
- `decode base64 aGVsbG8=`
- `generate uuid`
- `generate password length 20`
- `convert timestamp 1700000000`
- `generate readme MyApp`
- `commit message add login validation`
- `explain code const x = arr.map(v => v * 2);`