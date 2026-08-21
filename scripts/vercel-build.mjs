#!/usr/bin/env node
/**
 * Vercel Build Script
 * Runs the normal Vite build, then reshapes the output into
 * Vercel's Build Output API v3 format (.vercel/output/).
 */
import { mkdirSync, cpSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

// 1. Clean previous output
if (existsSync(".vercel/output")) {
  rmSync(".vercel/output", { recursive: true, force: true });
}

// 2. Run normal Vite build
console.log("Building app...");
execSync("npm run build", { stdio: "inherit" });

// 3. Set up output directories
const outputDir = ".vercel/output";
const staticDir = join(outputDir, "static");
const fnDir = join(outputDir, "functions", "index.func");

mkdirSync(staticDir, { recursive: true });
mkdirSync(fnDir, { recursive: true });

// 4. Copy client assets -> static
console.log("Copying static assets...");
cpSync("dist/client", staticDir, { recursive: true });

// 5. Copy server bundle -> serverless function
console.log("Setting up serverless function...");
cpSync("dist/server", fnDir, { recursive: true });

// 6. Write Vercel function config
writeFileSync(
  join(fnDir, ".vc-config.json"),
  JSON.stringify(
    {
      runtime: "nodejs20.x",
      handler: "server.js",
      launcherType: "Nodejs",
      shouldAddHelpers: false,
    },
    null,
    2
  )
);

// 7. Write routing config
writeFileSync(
  join(outputDir, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [
        // Long-cache for hashed static assets
        {
          src: "/assets/(.+)",
          headers: { "cache-control": "public, max-age=31536000, immutable" },
          continue: true,
        },
        // Serve static files first (images, fonts, etc.)
        { handle: "filesystem" },
        // Everything else → SSR function
        { src: "/(.*)", dest: "/" },
      ],
    },
    null,
    2
  )
);

console.log("✓ .vercel/output/ ready for deployment");
