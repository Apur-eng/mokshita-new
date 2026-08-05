const fs = require('fs');
const path = require('path');
const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const scriptsToAdd = [
  '<script src="config.js"></script>',
  '<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>',
  '<script src="src/services/api.js"></script>'
].join('\n');

const modifiedFiles = [];

for (const file of files) {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  
  // Remove existing instances of these scripts
  content = content.replace(/<script[^>]*src=["']config\.js["'][^>]*><\/script>\s*/g, '');
  content = content.replace(/<script[^>]*src=["']https:\/\/cdn\.jsdelivr\.net\/npm\/axios\/dist\/axios\.min\.js["'][^>]*><\/script>\s*/g, '');
  content = content.replace(/<script[^>]*src=["']src\/services\/api\.js["'][^>]*><\/script>\s*/g, '');
  
  // Find where to inject. Before the first occurrence of <script src="modules/..." or <script src="js/..."
  const injectRegex = /<script\s+src=["'](?:modules|js)\/[^>]+><\/script>/;
  const match = content.match(injectRegex);
  
  if (match) {
    content = content.replace(match[0], scriptsToAdd + '\n' + match[0]);
  } else {
    // fallback to before </body>
    content = content.replace(/<\/body>/, scriptsToAdd + '\n</body>');
  }
  
  fs.writeFileSync(path.join(dir, file), content, 'utf8');
  modifiedFiles.push(file);
}
console.log('Modified files:', modifiedFiles.join(', '));
