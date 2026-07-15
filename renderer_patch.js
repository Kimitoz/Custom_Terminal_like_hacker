const fs = require("fs");
const rendererPath = process.argv[2];
let renderer = fs.readFileSync(rendererPath, "utf8");

const remoteModeCode = `
window.remoteMode = false;
setInterval(() => {
    const http = require("http");
    http.get("http://localhost:4001/stats", res => {
        const wasRemote = window.remoteMode;
        window.remoteMode = res.statusCode === 200;
        if (window.remoteMode && !wasRemote && window.fsDisp) {
            window.fsDisp._cache = {};
            window.fsDisp.failed = false;
            window.fsDisp._reading = false;
            window.fsDisp.readFS("/root");
        }
        if (!window.remoteMode && wasRemote && window.fsDisp) {
            window.fsDisp.failed = false;
            window.fsDisp._reading = false;
            window.fsDisp.readFS(window.settings.cwd || "C:\\\\");
        }
    }).on("error", () => { window.remoteMode = false; });
}, 3000);

`;

renderer = remoteModeCode + renderer;
fs.writeFileSync(rendererPath, renderer, "utf8");
console.log("_renderer.js patched OK");
