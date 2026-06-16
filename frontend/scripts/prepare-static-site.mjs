import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = fileURLToPath(new URL("../", import.meta.url));
const reactBuildDirectory = join(frontendRoot, "react-dist");
const outputDirectory = join(frontendRoot, "dist");
const staticExtensions = new Set([
  ".css",
  ".gif",
  ".html",
  ".ico",
  ".jpeg",
  ".jpg",
  ".js",
  ".png",
  ".svg",
  ".txt",
  ".webp"
]);
const staticDirectories = new Set(["images"]);
const staticFiles = new Set([".nojekyll"]);
const excludedRootFiles = new Set(["vite.config.js"]);

await rm(outputDirectory, { force: true, recursive: true });
await mkdir(outputDirectory, { recursive: true });

const entries = await readdir(frontendRoot, { withFileTypes: true });

for (const entry of entries) {
  const sourcePath = join(frontendRoot, entry.name);
  const targetPath = join(outputDirectory, entry.name);

  if (excludedRootFiles.has(entry.name)) {
    continue;
  }

  if (entry.isDirectory() && staticDirectories.has(entry.name)) {
    await cp(sourcePath, targetPath, { recursive: true });
    continue;
  }

  if (entry.isFile() && (staticFiles.has(entry.name) || staticExtensions.has(extname(entry.name).toLowerCase()))) {
    await cp(sourcePath, targetPath);
  }
}

await cp(reactBuildDirectory, outputDirectory, { recursive: true });

console.log(`Prepared static frontend output at ${outputDirectory}`);
