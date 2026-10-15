import { cpSync, copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';

const root = process.cwd();
const output = join(root, 'dist');
const publicDirectories = ['documents', 'images', 'videos'];
const publicExtensions = new Set(['.css', '.js']);
const publicFiles = ['CNAME'];

for (const directory of publicDirectories) {
  const source = join(root, directory);
  if (existsSync(source)) cpSync(source, join(output, directory), { recursive: true });
}

for (const entry of readdirSync(root, { withFileTypes: true })) {
  if (entry.isFile() && publicExtensions.has(extname(entry.name))) {
    copyFileSync(join(root, entry.name), join(output, entry.name));
  }
}

mkdirSync(output, { recursive: true });
for (const file of publicFiles) {
  if (existsSync(join(root, file))) copyFileSync(join(root, file), join(output, file));
}
