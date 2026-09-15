import { cpSync, existsSync, mkdirSync } from 'node:fs';
// Ship the public assets beside the traced server so npm start is deployable.
mkdirSync('.next/standalone/.next', { recursive: true });
cpSync('.next/static', '.next/standalone/.next/static', { recursive: true });
if (existsSync('public')) cpSync('public', '.next/standalone/public', { recursive: true });
