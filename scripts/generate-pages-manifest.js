#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const pagesDir = path.join(repoRoot, 'pages');
const outFile = path.join(repoRoot, 'assets', 'pages-manifest.json');

function isDir(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function listDirs(dirPath) {
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b));
}

function listHtmlFiles(dirPath) {
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.toLowerCase().endsWith('.html'))
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b));
}

function main() {
  if (!isDir(pagesDir)) {
    console.error(`Missing pages directory: ${pagesDir}`);
    process.exit(1);
  }

  const folders = {};
  for (const folder of listDirs(pagesDir)) {
    const folderPath = path.join(pagesDir, folder);
    const htmlFiles = listHtmlFiles(folderPath);
    if (htmlFiles.length) folders[folder] = htmlFiles;
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    basePath: '/pages',
    folders,
  };

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${path.relative(repoRoot, outFile)}`);
}

main();

