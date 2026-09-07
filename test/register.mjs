// Registers the "@/..." alias resolve hook before tests load.
// Usage: node --import ./test/register.mjs --test <files>
import { register } from "node:module";
register("./hooks.mjs", import.meta.url);
