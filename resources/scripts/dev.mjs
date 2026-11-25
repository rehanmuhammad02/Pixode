import { spawn } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { writeFileSync, rmSync } from "node:fs";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const hot = resolve(root, "public/hot");
writeFileSync(hot, "http://127.0.0.1:5173/build");
const children = [
  spawn("php", ["artisan", "serve", "--host=127.0.0.1", "--port=3000"], { cwd: root, stdio: "inherit", windowsHide: true }),
  spawn(process.execPath, [resolve(root, "node_modules/vite/bin/vite.js"), "--host", "127.0.0.1"], { cwd: root, stdio: "inherit", windowsHide: true }),
];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  rmSync(hot, { force: true });
  for (const child of children) child.kill();
  process.exitCode = code;
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
process.on("exit", () => rmSync(hot, { force: true }));
for (const child of children) {
  child.on("error", (error) => { console.error(error.message); stop(1); });
  child.on("exit", (code) => stop(code || 0));
}