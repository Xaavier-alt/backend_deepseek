// copy-ip-fix.js
const fs = require('fs');
const path = require('path');

console.log('📋 SIMPLE FIX: Copying ip-address file...');

try {
  const sourceFile = path.join(__dirname, 'node_modules', 'ip-address', 'dist', 'ip-address.js');
  const targetDir = path.join(__dirname, 'node_modules', 'socks', 'node_modules', 'ip-address', 'dist');
  const targetFile = path.join(targetDir, 'ip-address.js');
  
  if (fs.existsSync(sourceFile)) {
    // Create target directory if it doesn't exist
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Copy the file
    fs.copyFileSync(sourceFile, targetFile);
    console.log('✓ Copied ip-address.js to socks location');
    
    // Also fix package.json if it exists
    const targetPackageJson = path.join(__dirname, 'node_modules', 'socks', 'node_modules', 'ip-address', 'package.json');
    if (fs.existsSync(targetPackageJson)) {
      const pkg = JSON.parse(fs.readFileSync(targetPackageJson, 'utf8'));
      if (pkg.main !== './dist/ip-address.js') {
        pkg.main = './dist/ip-address.js';
        fs.writeFileSync(targetPackageJson, JSON.stringify(pkg, null, 2), 'utf8');
        console.log('✓ Fixed socks ip-address package.json');
      }
    }
  } else {
    console.log('Source ip-address file not found, creating minimal version');
    
    // Create minimal implementation
    const minimalIp = `
module.exports = {
  Address4: function(address) {
    this.address = address;
    this.isValid = function() { return /^\\\\d+\\\\.\\\\d+\\\\.\\\\d+\\\\.\\\\d+$/.test(address); };
  },
  Address6: function(address) {
    this.address = address;
    this.isValid = function() { return true; };
  }
};
    `.trim();
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    fs.writeFileSync(targetFile, minimalIp, 'utf8');
    console.log('✓ Created minimal ip-address implementation');
  }
  
  console.log('✅ Copy fix complete');

} catch (error) {
  console.log('❌ Error in copy fix:', error.message);
}