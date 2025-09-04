// fix-base64url.js
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing base64url package for CommonJS compatibility...');

const base64urlDir = path.join(__dirname, 'node_modules', 'base64url');
const indexFile = path.join(base64urlDir, 'index.js');

try {
  // First, check what files actually exist in the base64url package
  const files = fs.readdirSync(base64urlDir);
  console.log('Base64url package contents:', files);
  
  // Check if dist directory exists
  const distDir = path.join(base64urlDir, 'dist');
  let distFiles = [];
  if (fs.existsSync(distDir)) {
    distFiles = fs.readdirSync(distDir);
    console.log('Dist directory contents:', distFiles);
  }
  
  // Check what the current index.js contains
  let currentContent = '';
  if (fs.existsSync(indexFile)) {
    currentContent = fs.readFileSync(indexFile, 'utf8');
    console.log('Current index.js content:', currentContent);
  }
  
  // Determine the correct fix based on what files exist
  let fixedContent;
  
  if (distFiles.includes('base64url.js')) {
    // If dist/base64url.js exists, use the default export fix
    fixedContent = `
const base64url = require('./dist/base64url.js');
module.exports = base64url.default;
    `.trim();
    console.log('Using dist/base64url.js fix');
    
  } else if (files.includes('dist.js')) {
    // If there's a dist.js file instead
    fixedContent = `
const base64url = require('./dist.js');
module.exports = base64url.default || base64url;
    `.trim();
    console.log('Using dist.js fix');
    
  } else if (files.includes('index.js') && currentContent.includes('lib/')) {
    // If it's pointing to lib directory
    fixedContent = `
const base64url = require('./lib/base64url');
module.exports = base64url.default || base64url;
    `.trim();
    console.log('Using lib directory fix');
    
  } else {
    // Fallback: try to require the package directly
    try {
      const base64url = require('base64url');
      console.log('Package already works, no fix needed');
      process.exit(0);
    } catch (error) {
      console.log('Could not determine correct fix structure');
      throw error;
    }
  }
  
  // Apply the fix
  fs.writeFileSync(indexFile, fixedContent, 'utf8');
  console.log('✓ Fixed base64url/index.js');
  
  // Verify the fix works
  try {
    const base64url = require('base64url');
    console.log('✓ Verification passed - base64url loaded successfully');
    console.log('Available functions:', Object.keys(base64url).filter(key => typeof base64url[key] === 'function'));
  } catch (verifyError) {
    console.log('⚠️ Verification failed, but fix applied. Error:', verifyError.message);
  }
  
} catch (error) {
  console.log('❌ Error fixing base64url:', error.message);
  // Don't exit with error code 1, as we want the build to continue
  console.log('⚠️ Continuing build despite base64url fix error');
}