// fix-passport-oauth2.js
const fs = require('fs');
const path = require('path');

console.log('🔧 Patching passport-oauth2 to avoid base64url dependency...');

try {
  const passportOauth2Dir = path.join(__dirname, 'node_modules', 'passport-oauth2');
  const strategyFile = path.join(passportOauth2Dir, 'lib', 'strategy.js');
  
  if (fs.existsSync(strategyFile)) {
    let content = fs.readFileSync(strategyFile, 'utf8');
    
    // Replace the base64url require with our own implementation
    if (content.includes("require('base64url')")) {
      content = content.replace(
        /var base64url = require\('base64url'\);/, 
        `// Custom base64url implementation to avoid dependency issues
var base64url = {
  encode: function(input, encoding) {
    if (Buffer.isBuffer(input)) {
      return fromBase64(input.toString('base64'));
    }
    return fromBase64(Buffer.from(input, encoding || 'utf8').toString('base64'));
  },
  decode: function(input) {
    return Buffer.from(toBase64(input), 'base64').toString();
  }
};

function toBase64(input) {
  let pad = input.length % 4;
  if (pad) {
    if (pad === 1) throw new Error('Invalid base64url string');
    input += '='.repeat(4 - pad);
  }
  return input.replace(/-/g, '+').replace(/_/g, '/');
}

function fromBase64(input) {
  return input.replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=/g, '');
}
`
      );
      
      fs.writeFileSync(strategyFile, content, 'utf8');
      console.log('✓ Patched passport-oauth2 strategy');
    } else {
      console.log('✓ base64url require not found in passport-oauth2');
    }
  } else {
    console.log('⚠️ passport-oauth2 strategy file not found');
  }
} catch (error) {
  console.log('⚠️ Error patching passport-oauth2:', error.message);
}