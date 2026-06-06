const fs = require('fs');
const glob = require('glob'); // Not available? Just use native
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'modules');

const traverse = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('controller.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content.replace(/req\.params\.([a-zA-Z0-9_]+)(?! as string)/g, '(req.params.$1 as string)');
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
};

traverse(srcDir);
console.log('Fixed req.params');
