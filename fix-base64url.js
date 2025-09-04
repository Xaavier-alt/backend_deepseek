// fix-base64url.js
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing base64url package for CommonJS compatibility...');

const base64urlDir = path.join(__dirname, 'node_modules', 'base64url');
const indexFile = path.join(base64urlDir, 'index.js');

try {
  // Apply the fix for the default export issue
  const fixedContent = `
const base64url = require('./dist/base64url.js');
module.exports = base64url.default;
  `.trim();
  
  fs.writeFileSync(indexFile, fixedContent, 'utf8');
  console.log('✓ Fixed base64url/index.js');
  
  // Verify the fix works
  const base64url = require('base64url');
  console.log('✓ Verification passed - base64url loaded successfully');
  console.log('Available functions:', Object.keys(base64url).filter(key => typeof base64url[key] === 'function'));
  
} catch (error) {
  console.log('❌ Error fixing base64url:', error.message);
  process.exit(1);
}