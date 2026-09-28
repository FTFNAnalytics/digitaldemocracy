/**
 * Start the standalone server on a free port, smoke its static assets, stop it.
 * Used by CI after `npm run build`. Does not deploy and does not touch production.
 */
import { spawn } from "node:child_process";
import { existsSync, realpathSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

/**
 * @returns {Promise<number>}
 */
export function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close((error) => (error ? reject(error) : resolve(port)));
    });
  });
}

/**
 * @param {import("node:child_process").ChildProcess} child
 */
function killTree(child) {
  return new Promise((resolve) => {
    if (child.exitCode !== null || child.signalCode) {
      resolve();
      return;
    }
    const timer = setTimeout(() => {
      try {
        process.kill(-child.pid, "SIGKILL");
      } catch {
        try {
          child.kill("SIGKILL");
        } catch {
          /* already exited */
        }
      }
    }, 5_000);
    child.once("exit", () => {
      clearTimeout(timer);
      resolve();
    });
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {
      try {
        child.kill("SIGTERM");
      } catch {
        clearTimeout(timer);
        resolve();
      }
    }
  });
}

/**
 * @param {{
 *   root?: string,
 *   serverScript?: string,
 *   smokeScript?: string,
 *   readyTimeoutMs?: number,
 *   spawnImpl?: typeof spawn,
 * }} [options]
 */
export async function runStandaloneSmoke(options = {}) {
  const root = options.root ?? process.cwd();
  const serverScript = options.serverScript ?? path.join(root, ".next", "standalone", "server.js");
  const smokeScript = options.smokeScript ?? path.join(root, "scripts", "smoke-assets.mjs");
  const spawnImpl = options.spawnImpl ?? spawn;
  const readyTimeoutMs = options.readyTimeoutMs ?? 90_000;

  if (!existsSync(serverScript)) {
    throw new Error(`missing ${serverScript}. Run npm run build before the standalone smoke.`);
  }
  if (!existsSync(smokeScript)) {
    throw new Error(`missing ${smokeScript}`);
  }

  const port = await freePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const server = spawnImpl(
    process.execPath,
    ["--experimental-sqlite", "--no-warnings", serverScript],
    {
      cwd: root,
      env: { ...process.env, PORT: String(port), HOSTNAME: "127.0.0.1" },
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  let logs = "";
  server.stdout?.on("data", (chunk) => {
    logs += chunk;
  });
  server.stderr?.on("data", (chunk) => {
    logs += chunk;
  });

  try {
    const deadline = Date.now() + readyTimeoutMs;
    let up = false;
    while (Date.now() < deadline) {
      if (server.exitCode !== null) {
        throw new Error(`standalone server exited ${server.exitCode} before listening on ${baseUrl}\n${logs}`);
      }
      try {
        const response = await fetch(baseUrl, { signal: AbortSignal.timeout(2_000) });
        await response.arrayBuffer();
        up = true;
        break;
      } catch {
        await delay(200);
      }
    }
    if (!up) {
      throw new Error(`standalone server did not listen on ${baseUrl}\n${logs}`);
    }

    const smoke = spawnImpl(process.execPath, [smokeScript, baseUrl], {
      cwd: root,
      stdio: "inherit",
    });
    const code = await new Promise((resolve, reject) => {
      smoke.once("error", reject);
      smoke.once("exit", (exitCode) => resolve(exitCode ?? 1));
    });
    if (code !== 0) {
      throw new Error(`smoke exited ${code}\n${logs}`);
    }
    return { baseUrl, port };
  } finally {
    await killTree(server);
  }
}

function isDirectRun() {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return realpathSync(entry) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return import.meta.url === pathToFileURL(entry).href;
  }
}

if (isDirectRun()) {
  try {
    await runStandaloneSmoke();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
