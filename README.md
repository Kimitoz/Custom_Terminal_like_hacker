# eDEX-UI (SSH Remote Monitor Fork)

> A fork of [eDEX-UI](https://github.com/GitSquared/edex-ui) by [@GitSquared](https://github.com/GitSquared) — a fullscreen, cross-platform terminal emulator and system monitor that looks and feels like a sci-fi computer interface.

**⚠️ This project is a work in progress.** We are actively extending the original project with new features. The original author has archived the project; this fork continues development.

---

## What is this?

eDEX-UI is a visually stunning terminal emulator built on Electron. It shows a fullscreen sci-fi HUD with:

- A live terminal (PowerShell / bash / zsh)
- Real-time CPU, RAM, network and process monitoring
- A file system browser
- A world map with your network endpoint location
- An on-screen keyboard

This fork adds **SSH remote monitoring** — when you connect to a remote Linux server via SSH tunnel, the system panels automatically switch to show the **remote server's** metrics instead of your local machine.

---

## Use Cases

- **DevOps & SysAdmins** — monitor your Linux server in style while connected via SSH from a Windows workstation
- **Homelab enthusiasts** — keep an eye on your server's CPU, RAM, processes and network traffic in real time
- **Presentations & demos** — impressive fullscreen terminal UI for tech talks or screen recordings
- **Cyberpunk aesthetic** — because some of us just want our desktop to look like a TRON movie

---

## What's Changed vs Original

The original eDEX-UI was archived in 2021 and no longer maintained. This fork fixes compatibility with modern systems and adds remote monitoring:

### Bug Fixes & Compatibility
- Fixed compatibility with **Node.js 16** and **Electron 13** (original required Node 12 / Electron 9)
- Fixed `shell-env`, `color`, `nanoid`, `geolite2-redist` module compatibility (ES module conflicts)
- Fixed `node-gyp` build with Python 3.11 (removed deprecated `distutils` dependency)
- Fixed `xterm-addon-webgl` crash on Windows 11
- Fixed keyboard `TypeError` crashes on startup
- Fixed network interface detection on Windows (was picking `vEthernet` virtual adapter instead of physical `Ethernet`)
- Fixed `nullGHz` CPU speed display bug
- Fixed `MANUFACTURER / MODEL / CHASSIS` fields (now reads from WMI correctly)

### New Features
- **SSH Remote Monitoring** — system metrics (CPU, RAM, processes, network traffic) automatically switch to the remote Linux server when an SSH tunnel is active on port 4001
- **Python monitoring agent** (`edex-agent.py`) for the Linux server — lightweight HTTP server that exposes system stats via `/stats` endpoint
- **Custom orange theme** (`tron-disrupted-custom`) — warmer color palette inspired by the original Tron theme
- Automatic fallback to local metrics when SSH tunnel is closed

---

## Requirements

### Windows PC (client)
- Windows 10 / 11
- Node.js 16.x (`nvm use 16.20.2`)
- Visual Studio Build Tools 2017+ with **C++ build tools**
- Python 3.11

### Linux Server (remote)
- Python 3.x
- `psutil` library (`pip3 install psutil --break-system-packages`)

---

## Installation

```bash
git clone https://github.com/YOUR_USERNAME/edex-ui.git
cd edex-ui
npm install --ignore-scripts
npm install signale shell-env@3.0.0 nanoid@3 geolite2-redist@1.0.7 node-pty --build-from-source
npm install xterm@4 xterm-addon-attach@0.6.0 xterm-addon-fit@0.5.0 xterm-addon-ligatures@0.3.0 xterm-addon-webgl@0.11.0
npm install color@3 howler smoothie pretty-bytes@5 ws maxmind
node node_modules/geolite2-redist/scripts/postinstall.js
npm start
```

---

## SSH Remote Monitoring Setup

### 1. On your Linux server — start the monitoring agent:

```bash
python3 ~/edex-agent.py &
```

### 2. On your Windows PC — open an SSH tunnel in a new terminal tab:

```powershell
ssh -L 4001:localhost:4000 user@your-server-ip
```

### 3. Launch eDEX-UI:

```powershell
npm start
```

Within 3 seconds, the system panels will switch to show your **Linux server's** CPU, RAM, processes and network traffic. Close the SSH tunnel tab to switch back to local metrics.

---

## Original Project

All credit for the original concept, design and core implementation goes to **[@GitSquared](https://github.com/GitSquared)**.

- Original repo: https://github.com/GitSquared/edex-ui
- Original license: GPL-3.0

This fork is also released under GPL-3.0.

---

## Screenshots

*Coming soon*

---

## Roadmap

- [ ] Remote filesystem browser (Linux server files in the filesystem panel)
- [ ] Auto-detect SSH session in terminal and switch metrics automatically (without manual tunnel)
- [ ] Packaged `.exe` installer for Windows
- [ ] Better memory display for remote server
- [ ] Support for multiple servers
