import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(process.cwd());
const dist = path.join(projectRoot, "dist");

const requiredFiles = [
  "index.html",
  "harjoittele/index.html",
  "polku/index.html",
  "kortit/index.html",
  "kuuntele/index.html",
  "kirjasto/index.html",
  "asetukset/index.html",
  "valitsin/index.html",
  "pikavisa/index.html",
];

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(dist, file)));
if (missing.length > 0) {
  console.error("Missing built files:", missing);
  process.exit(1);
}

const swPath = path.join(projectRoot, "public", "sw.js");
const sw = fs.readFileSync(swPath, "utf8");
if (!sw.includes("CACHE_VERSION")) {
  console.error("Service worker missing CACHE_VERSION constant");
  process.exit(1);
}
if (!sw.includes("OFFLINE_URL")) {
  console.error("Service worker missing OFFLINE_URL fallback");
  process.exit(1);
}

const offlinePath = path.join(projectRoot, "public", "offline.html");
if (!fs.existsSync(offlinePath)) {
  console.error("Missing public/offline.html");
  process.exit(1);
}

console.log("verify-static: ok");
