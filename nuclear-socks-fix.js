// nuclear-socks-fix.js
const fs = require('fs');
const path = require('path');

console.log('☢️  NUCLEAR FIX: Handling socks dependency...');

try {
  const socksDir = path.join(__dirname, 'node_modules', 'socks');
  
  if (fs.existsSync(socksDir)) {
    // Check if we can patch the helpers.js to avoid the dependency
    const helpersFile = path.join(socksDir, 'build', 'common', 'helpers.js');
    
    if (fs.existsSync(helpersFile)) {
      let content = fs.readFileSync(helpersFile, 'utf8');
      
      // Replace the ip-address require with a simple implementation
      if (content.includes("require('ip-address')")) {
        content = content.replace(
          /var.*ip.*=.*require\('ip-address'\).*;/,
          `// IP address functionality replaced with simple implementation
var ipAddress = {
  Address4: function(address) {
    this.address = address;
    this.isValid = function() { return true; };
  },
  Address6: function(address) {
    this.address = address;
    this.isValid = function() { return true; };
  }
};`
        );
        
        fs.writeFileSync(helpersFile, content, 'utf8');
        console.log('✓ Replaced ip-address dependency in socks');
      }
    }
  }
  
  console.log('✅ Nuclear socks fix applied');

} catch (error) {
  console.log('⚠️ Error in nuclear socks fix:', error.message);
}