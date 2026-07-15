const fs = require("fs");
const path = require("path");

// Patch 1: filesystem.class.js - add remoteFS after const fs = require("fs");
const fsClassPath = process.argv[2];
let fsClass = fs.readFileSync(fsClassPath, "utf8");

const remoteFSCode = `
const remoteFS = {
    _cache: {},
    _request: (dirPath, cb) => {
        if (remoteFS._cache[dirPath]) { cb(null, remoteFS._cache[dirPath]); return; }
        const {ipcRenderer} = require("electron");
        ipcRenderer.once("fs-remote-reply-" + dirPath, (e, result) => {
            if (result.error) { cb(new Error(result.error)); return; }
            remoteFS._cache[dirPath] = result.data;
            cb(null, result.data);
        });
        ipcRenderer.send("fs-remote-readdir", dirPath);
    },
    readdir: (dirPath, cb) => {
        remoteFS._request(dirPath, (err, data) => {
            if (err) { cb(err); return; }
            cb(null, data.items.map(i => i.name));
        });
    },
    lstat: (filePath, cb) => {
        const dir = filePath.substring(0, filePath.lastIndexOf("/")) || "/";
        const name = filePath.substring(filePath.lastIndexOf("/") + 1);
        remoteFS._request(dir, (err, data) => {
            if (err) { cb(err); return; }
            const item = data.items.find(i => i.name === name);
            if (!item) { cb(new Error("Not found")); return; }
            cb(null, {
                isDirectory: () => item.isDir,
                isFile: () => !item.isDir,
                isSymbolicLink: () => false,
                isBlockDevice: () => false,
                isCharacterDevice: () => false,
                isFIFO: () => false,
                isSocket: () => false,
                size: item.size,
                mtime: new Date(item.mtime * 1000)
            });
        });
    }
};
`;

// Insert remoteFS after const fs = require("fs");
fsClass = fsClass.replace('const fs = require("fs");', 'const fs = require("fs");' + remoteFSCode);

// Add remote mode check in Proxy
const proxyInsert = `if (window.remoteMode && (prop === "readdir" || prop === "lstat")) {
                    return new Promise((resolve, reject) => {
                        remoteFS[prop](args[0], (err, result) => {
                            if (err) reject(err); else resolve(result);
                        });
                    });
                }
                `;
fsClass = fsClass.replace('return function(...args) {', 'return function(...args) {\n                ' + proxyInsert);

// Skip reCalculateDiskUsage in remote mode
fsClass = fsClass.replace('this.reCalculateDiskUsage(tcwd);', 'if (!window.remoteMode) this.reCalculateDiskUsage(tcwd);');

// Fix path for lstat in remote mode
fsClass = fsClass.replace(
    'let fstat = await this._asyncFSwrapper.lstat(path.join(tcwd, file)).catch(e => {',
    'let fstat = await this._asyncFSwrapper.lstat(window.remoteMode ? tcwd + "/" + file : path.join(tcwd, file)).catch(e => {'
);

fs.writeFileSync(fsClassPath, fsClass, "utf8");
console.log("filesystem.class.js patched OK");
