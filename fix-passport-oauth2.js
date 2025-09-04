// fix-passport-oauth2.js
const fs = require('fs');
const path = require('path');

console.log('🔧 COMPREHENSIVELY patching passport-oauth2...');

try {
  const passportOauth2Dir = path.join(__dirname, 'node_modules', 'passport-oauth2');
  
  if (!fs.existsSync(passportOauth2Dir)) {
    console.log('✓ passport-oauth2 not found, no patch needed');
    return;
  }

  // Patch strategy.js
  const strategyFile = path.join(passportOauth2Dir, 'lib', 'strategy.js');
  if (fs.existsSync(strategyFile)) {
    let content = fs.readFileSync(strategyFile, 'utf8');
    
    // COMPLETE replacement of base64url dependency
    if (content.includes("require('base64url')")) {
      content = content.replace(
        /var base64url = require\('base64url'\);/, 
        `// COMPLETE base64url replacement - no external dependency
var base64url = {
  encode: function(input, encoding) {
    if (Buffer.isBuffer(input)) {
      return fromBase64(input.toString('base64'));
    }
    return fromBase64(Buffer.from(input, encoding || 'utf8').toString('base64'));
  },
  decode: function(input) {
    return Buffer.from(toBase64(input), 'base64').toString();
  },
  toBase64: function(input) {
    let pad = input.length % 4;
    if (pad) {
      if (pad === 1) throw new Error('Invalid base64url string');
      input += '='.repeat(4 - pad);
    }
    return input.replace(/-/g, '+').replace(/_/g, '/');
  },
  fromBase64: function(input) {
    return input.replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=/g, '');
  }
};

function toBase64(input) {
  return base64url.toBase64(input);
}

function fromBase64(input) {
  return base64url.fromBase64(input);
}
`
      );
      
      fs.writeFileSync(strategyFile, content, 'utf8');
      console.log('✓ COMPREHENSIVELY patched passport-oauth2 strategy');
    } else {
      console.log('✓ base64url require already removed from passport-oauth2');
    }
  }

  // Also patch any other files that might require base64url
  const libFiles = fs.readdirSync(path.join(passportOauth2Dir, 'lib')).filter(f => f.endsWith('.js'));
  for (const file of libFiles) {
    const filePath = path.join(passportOauth2Dir, 'lib', file);
    let fileContent = fs.readFileSync(filePath, 'utf8');
    
    if (fileContent.includes("require('base64url')")) {
      fileContent = fileContent.replace(
        /require\('base64url'\)/g,
        `require('./base64url-patch')`
      );
      fs.writeFileSync(filePath, fileContent, 'utf8');
      console.log(`✓ Patched base64url reference in ${file}`);
    }
  }

} catch (error) {
  console.log('⚠️ Error in comprehensive passport-oauth2 patch:', error.message);
}