// final-fix.js
const fs = require('fs');
const path = require('path');

console.log('🎯 APPLYING FINAL FIX...');

// 1. Fix base64url package
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
  },
  toBase64: (input) => input.replace(/-/g, '+').replace(/_/g, '/'),
  fromBase64: (input) => input.replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=/g, ''),
  toBuffer: (input) => {
    let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    return Buffer.from(base64, 'base64');
  }
};
  `.trim();
  fs.writeFileSync(indexFile, fixContent, 'utf8');
  console.log('✓ Fixed base64url package');
}

// 2. Fix passport-oauth2 - remove any problematic requires
const passportOauth2Dir = path.join(__dirname, 'node_modules', 'passport-oauth2');
if (fs.existsSync(passportOauth2Dir)) {
  const strategyFile = path.join(passportOauth2Dir, 'lib', 'strategy.js');
  if (fs.existsSync(strategyFile)) {
    let content = fs.readFileSync(strategyFile, 'utf8');
    
    // Remove any reference to base64url-patch
    if (content.includes("require('./base64url-patch')")) {
      content = content.replace(/require\('\.\/base64url-patch'\)/g, `require('base64url')`);
      console.log('✓ Removed base64url-patch references');
    }
    
    // Ensure base64url is properly defined
    if (content.includes("require('base64url')")) {
      content = content.replace(
        /var base64url = require\('base64url'\);/, 
        `var base64url = require('base64url'); // Now fixed by our patch`
      );
    }
    
    fs.writeFileSync(strategyFile, content, 'utf8');
    console.log('✓ Fixed passport-oauth2 strategy');
  }
}

console.log('✅ FINAL FIX COMPLETE - Ready for deployment!');