const fs = require("fs");
const path = require("path");

const mtPath = process.argv[2];
let mt = fs.readFileSync(mtPath, "utf8");

const ipcHandler = `
ipc.on("fs-remote-readdir", (e, dirPath) => {
    if (!remoteMode) { e.sender.send("fs-remote-reply-" + dirPath, {error: "not in remote mode"}); return; }
    http.get("http://localhost:4001/fs?path=" + encodeURIComponent(dirPath), res => {
        let data = "";
        res.on("data", chunk => data += chunk);
        res.on("end", () => {
            try { e.sender.send("fs-remote-reply-" + dirPath, {data: JSON.parse(data)}); }
            catch(err) { e.sender.send("fs-remote-reply-" + dirPath, {error: err.message}); }
        });
    }).on("error", err => e.sender.send("fs-remote-reply-" + dirPath, {error: err.message}));
});

`;

mt = mt.replace('ipc.on("systeminformation-call"', ipcHandler + 'ipc.on("systeminformation-call"');
fs.writeFileSync(mtPath, mt, "utf8");
console.log("_multithread.js patched OK");
