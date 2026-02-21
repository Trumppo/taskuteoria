import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const baseUrl = "http://127.0.0.1:4323";
const basePath = process.env.SMOKE_BASE_PATH ?? "/taskuteoria";
const withBase = (path) => `${basePath}${path}`.replace(/\/{2,}/g, "/");
const requiredRoutes = [
  { path: withBase("/"), contains: "TaskuTeoria" },
  { path: withBase("/harjoittele/"), contains: "Harjoittele" },
  { path: withBase("/nuotit/"), contains: "Nuotit" },
  { path: withBase("/rytmi/"), contains: "Rytmi" },
  { path: withBase("/savellajit/"), contains: "Savellajit" },
  { path: withBase("/kuuntele/"), contains: "Kuuntelutehtavat" },
  { path: withBase("/kirjasto/"), contains: "Teoriakirjasto" },
];

const preview = spawn("npm", ["run", "preview", "--", "--host", "127.0.0.1", "--port", "4323"], {
  stdio: "pipe",
  shell: false,
});

async function waitUntilStarted() {
  for (let i = 0; i < 120; i += 1) {
    try {
      const res = await fetch(baseUrl + withBase("/"), { method: "GET" });
      if (res.ok) return;
    } catch {
      // ignore until server is ready
    }
    await sleep(250);
  }
  throw new Error("Preview server did not start in time");
}

async function checkRoute(route) {
  const res = await fetch(baseUrl + route.path);
  if (!res.ok) {
    throw new Error(`Route ${route.path} returned ${res.status}`);
  }
  const text = await res.text();
  if (!text.includes(route.contains)) {
    throw new Error(`Route ${route.path} missing expected content: ${route.contains}`);
  }
}

try {
  await waitUntilStarted();
  for (const route of requiredRoutes) {
    await checkRoute(route);
  }
  console.log("smoke-e2e: ok");
} finally {
  preview.kill("SIGTERM");
}
