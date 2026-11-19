// Leonida Tracker — entrypoint for gta6-trophy-guide-01 (Node 22, stdlib only).
// The guide itself is plain static files in app/ (index.html, style.css,
// app.js, data/trophies.json, data/roadmap.json): open app/index.html in a
// desktop browser and it works with the network off. This program hands the
// guide in: it copies app/ and screenshots/ from beside this file into the
// output directory and writes dossier.json, the summary the judge reads
// (screenshots, first-load files and bytes, and the source), using the
// vendored make.fun library. vendor/makefun-frontend.ts stays as the kit
// shipped it: the scorer rebuilds the dossier with its own copy and the two
// must match byte for byte.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const here = fileURLToPath(new URL(".", import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

mkdirSync(out, { recursive: true });
cpSync(join(here, "app"), join(out, "app"), { recursive: true });
mkdirSync(join(out, "screenshots"), { recursive: true });
if (existsSync(join(here, "screenshots"))) {
  cpSync(join(here, "screenshots"), join(out, "screenshots"), { recursive: true });
}

// Caps from the gate: at most 4 screenshots, each at most 256 KiB; app/ at
// most 993 files and directories and 48 MiB in all; the dossier at most
// 160 KiB of text. Only text_max_bytes shapes the bytes — the other caps
// refuse an entry the scorer would refuse.
writeFileSync(
  join(out, "dossier.json"),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
