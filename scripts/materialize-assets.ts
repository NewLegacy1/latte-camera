import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const ARCHIVE_SHA256 =
  "ff6d1950720dc4b171ffa57f8198dc094891059f4724d7307ff1662b1a700ecb";

const ARCHIVE_URLS = ["https://n.uguu.se/ciOnhqOa.tar.gz"];

const REQUIRED = [
  "public/images/hero.jpg",
  "public/images/press-white.png",
  "public/images/press-black.png",
  "public/images/press-green.png",
  "public/images/scoop-cinnamon.gif",
  "public/images/slide-card.gif",
];

function sha256(data: Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

export function materializeAssets(): void {
  if (REQUIRED.every((path) => existsSync(path))) return;

  const archivePath = "/tmp/dear-latte-storefront.tar.gz";
  let archive: Buffer | undefined;

  for (const url of ARCHIVE_URLS) {
    try {
      execFileSync("curl", ["-fsSL", "--retry", "5", "--retry-delay", "2", "-o", archivePath, url], {
        stdio: "inherit",
      });
      const downloaded = readFileSync(archivePath);
      if (sha256(downloaded) === ARCHIVE_SHA256) {
        archive = downloaded;
        break;
      }
    } catch {
      archive = undefined;
    }
  }

  if (!archive) {
    throw new Error(
      "Product images are not in the checkout and the storefront archive could not be downloaded.",
    );
  }

  writeFileSync(archivePath, archive);
  execFileSync("tar", ["-xzf", archivePath, "-C", process.cwd()], {
    stdio: "inherit",
  });

  const missing = REQUIRED.filter((path) => !existsSync(path));
  if (missing.length > 0) {
    throw new Error(`Storefront archive did not include: ${missing.join(", ")}`);
  }
}
