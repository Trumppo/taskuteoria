import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const baseUrl = "http://127.0.0.1:4323";
const requiredRoutes = [
  { path: "/", contains: "TaskuTeoria" },
  { path: "/harjoittele/", contains: "Nuottien tunnistus" },
  { path: "/kuuntele/", contains: "Kuuntelutehtavat" },
  { path: "/kirjasto/", contains: "Teoriakirjasto" },
];

const preview = spawn("npm", ["run", "preview", "--", "--host", "127.0.0.1", "--port", "4323"], {
  stdio: "pipe",
  shell: false,
});

let started = false;
preview.stdout.on("data", (chunk) => {
  const line = chunk.toString();
  if (line.includes("127.0.0.1:4323")) started = true;
});
preview.stderr.on("data", (chunk) => {
  const line = chunk.toString();
  if (line.includes("127.0.0.1:4323")) started = true;
});

async function waitUntilStarted() {
  for (let i = 0; i < 60; i += 1) {
    if (started) return;
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

