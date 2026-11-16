import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const b64Dir = join(root, "scripts", "image-b64");
const manifestPath = join(b64Dir, "manifest.json");

if (!existsSync(manifestPath)) {
  console.log("decode-images: no manifest, skipping");
  process.exit(0);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

for (const entry of manifest) {
  const parts = entry.parts ?? [entry.b64];
  const b64 = parts.map((name) => readFileSync(join(b64Dir, name), "utf8").trim()).join("");
  const outPath = join(root, entry.rel);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, Buffer.from(b64, "base64"));
  console.log(`decode-images: wrote ${entry.rel} (${entry.size} bytes)`);
}
