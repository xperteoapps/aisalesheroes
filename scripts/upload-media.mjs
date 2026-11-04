#!/usr/bin/env node
/* Wgrywa media z public/media/ do Supabase Storage (bucket „media”) z tymi samymi ścieżkami.
   Uruchom na swoim komputerze (nie w repo w chmurze):
     SUPABASE_SERVICE_ROLE_KEY=... npm run upload-media
   Klucz: panel Supabase → Project Settings → API Keys → service_role / secret. Nie wklejaj go do czatu ani do repo. */
import { createClient } from "@supabase/supabase-js";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, extname } from "node:path";

const URL = process.env.SUPABASE_URL || "https://pvdjwmzcvgqgyiwaddbb.supabase.co";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ROOT = "public/media";
const TYPES = { ".mp3": "audio/mpeg", ".mp4": "video/mp4", ".pdf": "application/pdf", ".svg": "image/svg+xml", ".png": "image/png" };

if (!KEY) { console.error("Brak SUPABASE_SERVICE_ROLE_KEY. Ustaw go w terminalu przed uruchomieniem."); process.exit(1); }
const sb = createClient(URL, KEY, { auth: { persistSession: false } });

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p); else yield p;
  }
}

let ok = 0, fail = 0;
for await (const file of walk(ROOT)) {
  const type = TYPES[extname(file).toLowerCase()];
  if (!type) continue;
  const path = relative(ROOT, file).split("\\").join("/");
  const { error } = await sb.storage.from("media").upload(path, await readFile(file), { contentType: type, upsert: true });
  const kb = Math.round((await stat(file)).size / 1024);
  if (error) { fail++; console.error(`✗ ${path}: ${error.message}`); } else { ok++; console.log(`✓ ${path} (${kb} KB)`); }
}
console.log(`\nGotowe: ${ok} wgranych, ${fail} błędów.`);
