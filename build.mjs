import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const out = resolve(root, 'dist');
const files = ['index.html', 'FFU-Standalone.html', 'manifest.webmanifest', 'sw.js', 'RESET-GAME.html'];

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const file of files) await cp(resolve(root, file), resolve(out, file));
console.log(`Built ${files.length} static files into dist/`);
