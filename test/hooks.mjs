// Node test-runner resolve hook: maps the "@/..." tsconfig path alias to the
// project root so `node --test` can load TS modules that import via "@/lib/...".
// Zero runtime deps; used only for unit tests (see package.json "test" script).
import { existsSync } from "node:fs";
import { dirname, resolve as pathResolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = pathResolve(dirname(fileURLToPath(import.meta.url)), "..");
const exts = ["", ".ts", ".tsx", ".js", ".mjs", "/index.ts", "/index.js"];

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const base = pathResolve(root, specifier.slice(2));
    for (const ext of exts) {
      const candidate = base + ext;
      if (existsSync(candidate)) {
        return { url: pathToFileURL(candidate).href, shortCircuit: true };
      }
    }
  }
  return nextResolve(specifier, context);
}
