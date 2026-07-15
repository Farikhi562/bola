import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const out = resolve(root, 'dist');
const files = [
  'index.html',
  'FFU-Standalone.html',
  'manifest.webmanifest',
  'sw.js',
  'RESET-GAME.html',
  'SUPABASE-CLOUD-SAVE.sql',
  'DATABASE-PACK-EXAMPLE.json',
  'icons',
];

function parseEnv(text) {
  const values = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const index = line.indexOf('=');
    if (index < 1) continue;
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

async function loadLocalEnv() {
  const merged = {};
  for (const filename of ['.env', '.env.local']) {
    const path = resolve(root, filename);
    if (existsSync(path)) Object.assign(merged, parseEnv(await readFile(path, 'utf8')));
  }
  return { ...merged, ...process.env };
}

const env = await loadLocalEnv();
const publicConfig = {
  supabaseUrl: env.FFU_SUPABASE_URL || '',
  supabaseAnonKey: env.FFU_SUPABASE_ANON_KEY || '',
  defaultSlot: env.FFU_DEFAULT_CLOUD_SLOT || 'karier-utama',
};

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const file of files) await cp(resolve(root, file), resolve(out, file), { recursive: true });

for (const htmlName of ['index.html', 'FFU-Standalone.html']) {
  const htmlPath = resolve(out, htmlName);
  let html = await readFile(htmlPath, 'utf8');
  html = html.replace(
    /const FFU_BUILD_ENV=\{[^;]*\};/,
    `const FFU_BUILD_ENV=${JSON.stringify(publicConfig)};`,
  );
  await writeFile(htmlPath, html, 'utf8');
}

console.log(`Built ${files.length} static resources into dist/`);
console.log(`Supabase URL: ${publicConfig.supabaseUrl ? 'configured' : 'not configured'}`);
console.log(`Supabase anon key: ${publicConfig.supabaseAnonKey ? 'configured' : 'not configured'}`);
