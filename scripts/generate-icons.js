#!/usr/bin/env node
/**
 * Run this script ONCE after npm install to generate placeholder icons.
 * Real icons can be replaced in src/assets/
 * 
 * Usage: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'src', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create minimal valid 1x1 PNG as placeholder
// Real icons should be: icon.png (1024x1024), splash.png (1284x2778), adaptive-icon.png (1024x1024)
const minimalPNG = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108020000009001' +
  '2e000000000c4944415478016360f8cfc00000000200016c32a860000000049454e44ae426082',
  'hex'
);

['icon.png', 'splash.png', 'adaptive-icon.png', 'favicon.png'].forEach(name => {
  const filePath = path.join(assetsDir, name);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, minimalPNG);
    console.log(`Created placeholder: ${name}`);
  }
});

console.log('\n✅ Placeholder assets created!');
console.log('💡 Replace these with real 1024x1024 PNG icons for production.\n');
