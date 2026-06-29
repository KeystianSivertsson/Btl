#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { parseStep } = require('../lib/stepParser');
const { writeBTL } = require('../lib/btlWriter');

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: step2btl <input.step> [outputDir]');
  process.exit(1);
}

const inputPath = path.resolve(args[0]);
const outDir = path.resolve(args[1] || path.join(process.cwd(), 'converted'));
if (!fs.existsSync(inputPath)) {
  console.error('Input file not found:', inputPath);
  process.exit(2);
}
fs.mkdirSync(outDir, { recursive: true });
const content = fs.readFileSync(inputPath, 'utf8');
const part = parseStep(content, path.basename(inputPath));
const outFile = path.join(outDir, path.basename(inputPath).replace(/\.[^.]+$/, '.btl'));
fs.writeFileSync(outFile, writeBTL(part), 'utf8');
console.log('Converted ->', outFile);
