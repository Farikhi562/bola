import { cp, mkdir, rm, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
const out='dist';
await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
const skip=new Set(['dist','.git','node_modules','package-lock.json']);
for (const name of await readdir('.')) {
  if (skip.has(name)) continue;
  if (name==='package.json' || name==='build.mjs') continue;
  await cp(name,`${out}/${name}`,{recursive:true});
}
if (!existsSync(`${out}/index.html`)) throw new Error('index.html tidak ikut dibangun');
console.log('Built static FFU v5.0.0 into dist/');
