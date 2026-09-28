import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { createServer, type Server } from "node:http";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runStandaloneSmoke } from "../../scripts/ci-smoke-standalone.mjs";
import {
  assertCopiedFileCount,
  cssChunkFiles,
  prepareStandalone,
} from "../../scripts/prepare-standalone.mjs";
import { extractStaticAssetPaths, smokeAssets } from "../../scripts/smoke-assets.mjs";

const repoRoot = path.join(import.meta.dirname, "../..");
const smokeScript = path.join(repoRoot, "scripts/smoke-assets.mjs");
const prepareScript = path.join(repoRoot, "scripts/prepare-standalone.mjs");
const servers: Server[] = [];
const children: ChildProcess[] = [];
const dirs: string[] = [];

function runNode(args: string[], cwd?: string): Promise<{ status: number; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    children.push(child);
    let stdout = "";
    let stderr = "";
    child.stdout?.setEncoding("utf8");
    child.stderr?.setEncoding("utf8");
    child.stdout?.on("data", (chunk: string) => {
      stdout += chunk;
    });
    child.stderr?.on("data", (chunk: string) => {
      stderr += chunk;
    });
    child.once("error", reject);
    child.once("exit", (status) => resolve({ status: status ?? 1, stdout, stderr }));
  });
}

afterEach(async () => {
  for (const child of children.splice(0)) {
    if (child.exitCode === null && !child.killed) child.kill("SIGKILL");
  }
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
        }),
    ),
  );
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function tempRoot(): string {
  const dir = mkdtempSync(path.join(tmpdir(), "cdd-standalone-"));
  dirs.push(dir);
  return dir;
}

function listen(handler: (req: import("node:http").IncomingMessage, res: import("node:http").ServerResponse) => void) {
  const server = createServer(handler);
  servers.push(server);
  return new Promise<string>((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("no port");
      resolve(`http://127.0.0.1:${address.port}`);
    });
  });
}

describe("extractStaticAssetPaths", () => {
  it("collects /_next/static href and src values and ignores everything else", () => {
    const html = `
      <link rel="stylesheet" href="/_next/static/chunks/app.css" />
      <link rel="preload" href="/_next/static/chunks/main.js" as="script" />
      <script src="/_next/static/chunks/main.js"></script>
      <script src='/next/static/chunks/not-this.js'></script>
      <a href="/atlas">Atlas</a>
      <img src="/images/mark.svg" />
      <link rel="preconnect" href="https://fonts.example" />
      <script src="https://cdn.example/_next/static/chunks/from-absolute.js"></script>
      <link href="/_next/static/media/font.woff2?v=1" rel="preload" as="font" />
    `;
    expect(extractStaticAssetPaths(html)).toEqual([
      "/_next/static/chunks/app.css",
      "/_next/static/chunks/from-absolute.js",
      "/_next/static/chunks/main.js",
      "/_next/static/media/font.woff2?v=1",
    ]);
  });
});

describe("smokeAssets", () => {
  it("prints status and bytes and fails when a stylesheet is HTTP 500", async () => {
    const lines: string[] = [];
    const errors: string[] = [];
    const fetchImpl: typeof fetch = async (input) => {
      const url = String(input);
      if (url.endsWith("/")) {
        return new Response(
          '<link rel="stylesheet" href="/_next/static/chunks/hash.css"><script src="/_next/static/chunks/hash.js"></script>',
          { status: 200 },
        );
      }
      if (url.endsWith(".css")) return new Response("Internal Server Error", { status: 500 });
      return new Response("console.log(1)", { status: 200 });
    };

    const result = await smokeAssets("http://127.0.0.1:9/", {
      fetchImpl,
      log: (line) => lines.push(line),
      errorLog: (line) => errors.push(line),
    });

    expect(result.ok).toBe(false);
    expect(result.rows).toEqual([
      { path: "/_next/static/chunks/hash.css", status: 500, bytes: 21 },
      { path: "/_next/static/chunks/hash.js", status: 200, bytes: Buffer.byteLength("console.log(1)") },
    ]);
    expect(lines.join("\n")).toContain("500");
    expect(lines.join("\n")).toContain("21");
    expect(lines.join("\n")).toContain("/_next/static/chunks/hash.css");
    expect(errors.join("\n")).toContain("500 21 bytes /_next/static/chunks/hash.css");
  });

  it("passes when the homepage and every static asset are HTTP 200", async () => {
    const fetchImpl: typeof fetch = async (input) => {
      const url = String(input);
      if (url.endsWith("/")) {
        return new Response('<link href="/_next/static/chunks/a.css" rel="stylesheet"><script src="/_next/static/chunks/a.js"></script>', {
          status: 200,
        });
      }
      return new Response("ok", { status: 200 });
    };
    const result = await smokeAssets("http://127.0.0.1:9/", { fetchImpl, log: () => {} });
    expect(result.ok).toBe(true);
    expect(result.rows.every((row) => row.status === 200)).toBe(true);
  });
});

describe("smoke CLI", () => {
  it("exits 0 when every referenced asset is HTTP 200", async () => {
    const base = await listen((req, res) => {
      if (req.url === "/") {
        res.end('<link rel="stylesheet" href="/_next/static/chunks/a.css"><script src="/_next/static/chunks/a.js"></script>');
        return;
      }
      res.end("body{}");
    });
    const result = await runNode([smokeScript, base]);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("/_next/static/chunks/a.css");
    expect(result.stdout).toContain("200");
  });

  it("exits non-zero when the css chunk returns 500", async () => {
    const base = await listen((req, res) => {
      if (req.url === "/") {
        res.end('<link rel="stylesheet" href="/_next/static/chunks/a.css"><script src="/_next/static/chunks/a.js"></script>');
        return;
      }
      if (req.url?.endsWith(".css")) {
        res.statusCode = 500;
        res.end("Internal Server Error");
        return;
      }
      res.end("console.log(1)");
    });
    const result = await runNode([smokeScript, base]);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("500");
    expect(result.stdout).toContain("21");
    expect(result.stderr).toContain("/_next/static/chunks/a.css");
  });
});

describe("prepareStandalone", () => {
  it("copies static and public files, prints them, and matches counts", () => {
    const root = tempRoot();
    const chunkDir = path.join(root, ".next", "static", "chunks");
    mkdirSync(chunkDir, { recursive: true });
    writeFileSync(path.join(chunkDir, "app.css"), "body{color:black}");
    writeFileSync(path.join(chunkDir, "app.js"), "console.log(1)");
    mkdirSync(path.join(root, "public"), { recursive: true });
    writeFileSync(path.join(root, "public", "favicon.ico"), "icon");

    const lines: string[] = [];
    const first = prepareStandalone({ root, log: (line) => lines.push(line) });
    const second = prepareStandalone({ root, log: () => {} });

    expect(first).toEqual({ staticCount: 2, cssCount: 1, publicCount: 1 });
    expect(second).toEqual(first);
    expect(readFileSync(path.join(root, ".next/standalone/.next/static/chunks/app.css"), "utf8")).toBe(
      "body{color:black}",
    );
    expect(lines.join("\n")).toContain("copied 2 static files");
    expect(lines.join("\n")).toContain("chunks/app.css");
    expect(lines.join("\n")).toContain("favicon.ico");
    expect(cssChunkFiles(path.join(root, ".next/static")).map((file) => path.basename(file))).toEqual(["app.css"]);
  });

  it("fails before copying when chunks contain no css file", () => {
    const root = tempRoot();
    mkdirSync(path.join(root, ".next", "static", "chunks"), { recursive: true });
    writeFileSync(path.join(root, ".next", "static", "chunks", "app.js"), "console.log(1)");
    expect(() => prepareStandalone({ root, log: () => {} })).toThrow(/no \.css file/);
    expect(cssChunkFiles(path.join(root, ".next", "static"))).toEqual([]);
  });

  it("fails when the copied file count does not match the source", () => {
    const root = tempRoot();
    const source = path.join(root, "source");
    const dest = path.join(root, "dest");
    mkdirSync(source, { recursive: true });
    mkdirSync(dest, { recursive: true });
    writeFileSync(path.join(source, "a.css"), "a");
    writeFileSync(path.join(source, "b.js"), "b");
    writeFileSync(path.join(dest, "a.css"), "a");
    expect(() => assertCopiedFileCount(source, dest, "static")).toThrow(/copied file count 1 does not match source 2/);
  });

  it("exits non-zero from the CLI when the static tree has no css", () => {
    const root = tempRoot();
    mkdirSync(path.join(root, ".next", "static", "chunks"), { recursive: true });
    writeFileSync(path.join(root, ".next", "static", "chunks", "only.js"), "x");
    const result = spawnSync(process.execPath, [prepareScript], { cwd: root, encoding: "utf8" });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("no .css file");
  });
});

describe("standalone smoke runner", () => {
  it("starts a server on a free port, smokes it, and stops it", async () => {
    const root = tempRoot();
    const serverScript = path.join(root, "server.js");
    writeFileSync(
      serverScript,
      `const http = require("node:http");
const port = Number(process.env.PORT);
const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.end('<link rel="stylesheet" href="/_next/static/chunks/a.css"><script src="/_next/static/chunks/a.js"></script>');
    return;
  }
  res.end("ok");
});
server.listen(port, "127.0.0.1");
process.on("SIGTERM", () => server.close(() => process.exit(0)));
`,
    );
    const result = await runStandaloneSmoke({ root, serverScript, smokeScript });
    expect(result.baseUrl).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/);
  });

  it("fails and stops the server when the css chunk is not HTTP 200", async () => {
    const root = tempRoot();
    const serverScript = path.join(root, "server.js");
    writeFileSync(
      serverScript,
      `const http = require("node:http");
const port = Number(process.env.PORT);
const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.end('<link rel="stylesheet" href="/_next/static/chunks/a.css">');
    return;
  }
  res.statusCode = 500;
  res.end("Internal Server Error");
});
server.listen(port, "127.0.0.1");
process.on("SIGTERM", () => server.close(() => process.exit(0)));
`,
    );
    await expect(runStandaloneSmoke({ root, serverScript, smokeScript })).rejects.toThrow(/smoke exited 1/);
  });
});

describe("deploy wiring", () => {
  it("documents the production sequence and the diagnosis checklist in order", () => {
    const doc = readFileSync(path.join(repoRoot, "docs/deploy.md"), "utf8");
    const sequence = doc.slice(doc.indexOf("## Production sequence"), doc.indexOf("## Find the service unit"));
    const pull = sequence.indexOf("git pull");
    const install = sequence.indexOf("npm ci");
    const build = sequence.indexOf("npm run build");
    const restart = sequence.indexOf("sudo systemctl restart <unit>");
    const smoke = sequence.indexOf("npm run smoke -- https://center4digitaldemocracy.com");
    expect(pull).toBeGreaterThan(-1);
    expect(install).toBeGreaterThan(pull);
    expect(build).toBeGreaterThan(install);
    expect(restart).toBeGreaterThan(build);
    expect(smoke).toBeGreaterThan(restart);

    const ownership = doc.indexOf("### a. Ownership and mode of the CSS chunks");
    const hashes = doc.indexOf("### b. Whether the served HTML's chunk hashes exist on disk");
    const nginx = doc.indexOf("### c. Whether nginx proxies `/_next/static` or serves it from disk");
    const journal = doc.indexOf("### d. Journal around a request for the CSS path");
    expect(ownership).toBeGreaterThan(-1);
    expect(hashes).toBeGreaterThan(ownership);
    expect(nginx).toBeGreaterThan(hashes);
    expect(journal).toBeGreaterThan(nginx);
    expect(doc).toContain("nginx -T");
    expect(doc).toContain("expires max");
    expect(doc).toContain('Cache-Control "public, immutable"');
    expect(doc).toContain("journalctl");
    expect(doc).toContain("EACCES");
  });

  it("wires npm run smoke and runs the standalone smoke in CI", () => {
    const pkg = JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts.smoke).toBe("node scripts/smoke-assets.mjs");
    expect(pkg.scripts.build).toContain("scripts/prepare-standalone.mjs");

    const ci = readFileSync(path.join(repoRoot, ".github/workflows/ci.yml"), "utf8");
    expect(ci.indexOf("npm run build")).toBeGreaterThan(-1);
    expect(ci.indexOf("scripts/ci-smoke-standalone.mjs")).toBeGreaterThan(ci.indexOf("npm run build"));

    const production = readFileSync(path.join(repoRoot, ".github/workflows/smoke-production.yml"), "utf8");
    expect(production).toContain("workflow_dispatch");
    expect(production).toContain("https://center4digitaldemocracy.com");
    expect(production).not.toContain("push:");
    expect(production).not.toContain("pull_request:");
    expect(production).not.toMatch(/secrets\./);
    expect(production).not.toMatch(/appleboy\/ssh-action|webfactory\/ssh-agent|ssh-key/i);
  });
});
