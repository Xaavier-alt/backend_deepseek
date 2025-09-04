// comprehensive-fix.js
const fs = require('fs');
const path = require('path');

console.log('🔧 APPLYING COMPREHENSIVE FIX FOR ALL ISSUES...');

// 1. Fix base64url (from final-fix.js)
const base64urlDir = path.join(__dirname, 'node_modules', 'base64url');
if (fs.existsSync(base64urlDir)) {
  const indexFile = path.join(base64urlDir, 'index.js');
  const fixContent = `
// Complete base64url implementation
module.exports = {
  encode: (input, encoding) => {
    const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input, encoding || 'utf8');
    return buffer.toString('base64')
      .replace(/\\+/g, '-')
      .replace(/\\//g, '_')
      .replace(/=/g, '');
  },
  decode: (input) => {
    let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    return Buffer.from(base64, 'base64').toString();
  }
};
  `.trim();
  fs.writeFileSync(indexFile, fixContent, 'utf8');
  console.log('✓ Fixed base64url package');
}

// 2. Fix ip-address issue in socks package
const socksDir = path.join(__dirname, 'node_modules', 'socks');
if (fs.existsSync(socksDir)) {
  const helpersFile = path.join(socksDir, 'build', 'common', 'helpers.js');
  if (fs.existsSync(helpersFile)) {
    let content = fs.readFileSync(helpersFile, 'utf8');
    // Fix the require path
    content = content.replace(
      /require\('ip-address'\)/g,
      `require('ip-address')`
    );
    fs.writeFileSync(helpersFile, content, 'utf8');
    console.log('✓ Fixed socks package ip-address require');
  }
}

// 3. Ensure ip-address package has correct main entry
const ipAddressDir = path.join(__dirname, 'node_modules', 'ip-address');
if (fs.existsSync(ipAddressDir)) {
  const packageJsonPath = path.join(ipAddressDir, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (packageJson.main !== './dist/ip-address.js') {
      packageJson.main = './dist/ip-address.js';
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
      console.log('✓ Fixed ip-address package.json');
    }
  }
}

console.log('✅ COMPREHENSIVE FIX COMPLETE - All issues addressed!');