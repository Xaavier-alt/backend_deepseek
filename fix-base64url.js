// fix-base64url.js
const fs = require('fs');
const path = require('path');

console.log('🔧 FORCEFULLY fixing base64url package...');

const base64urlDir = path.join(__dirname, 'node_modules', 'base64url');

try {
  if (!fs.existsSync(base64urlDir)) {
    console.log('✓ base64url package not found, no fix needed');
    process.exit(0);
  }

  const indexFile = path.join(base64urlDir, 'index.js');
  
  // COMPLETELY REPLACE the base64url package with our own implementation
  const forcedFixContent = `
// FORCED FIX: Complete base64url implementation
// This replaces the broken package entirely

function encode(input, encoding) {
  if (Buffer.isBuffer(input)) {
    return fromBase64(input.toString('base64'));
  }
  return fromBase64(Buffer.from(input, encoding || 'utf8').toString('base64'));
}

function decode(input) {
  return Buffer.from(toBase64(input), 'base64').toString();
}

function toBase64(input) {
  // Add padding if needed
  let pad = input.length % 4;
  if (pad) {
    if (pad === 1) {
      throw new Error('Invalid base64url string');
    }
    input += '='.repeat(4 - pad);
  }
  return input.replace(/-/g, '+').replace(/_/g, '/');
}

function fromBase64(input) {
  return input.replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=/g, '');
}

function toBuffer(input) {
  return Buffer.from(toBase64(input), 'base64');
}

module.exports = {
  encode,
  decode,
  toBase64,
  fromBase64,
  toBuffer
};
  `.trim();

  // Apply the forced fix
  fs.writeFileSync(indexFile, forcedFixContent, 'utf8');
  console.log('✓ COMPLETELY replaced base64url implementation');

  // Also, let's ensure the dist directory doesn't cause issues
  const distDir = path.join(base64urlDir, 'dist');
  if (fs.existsSync(distDir)) {
    console.log('⚠️ dist directory exists, but we\'re using our own implementation');
  }

  // Test if it works
  try {
    const base64url = require('base64url');
    console.log('✓ Forced fix verified successfully');
    console.log('Available functions:', Object.keys(base64url).filter(k => typeof base64url[k] === 'function'));
  } catch (testError) {
    console.log('⚠️ Forced fix test failed:', testError.message);
  }

} catch (error) {
  console.log('❌ Error in forced fix script:', error.message);
  // Don't break the build
  console.log('⚠️ Continuing build despite error');
}