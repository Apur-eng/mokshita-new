const fs = require('fs');
const path = require('path');

const rootDir = 'd:\\d\\antigravity\\mokhsita-org';
const cssDir = path.join(rootDir, 'css');
const jsDir = path.join(rootDir, 'js');

// Create directories if they don't exist
if (!fs.existsSync(cssDir)) fs.mkdirSync(cssDir);
if (!fs.existsSync(jsDir)) fs.mkdirSync(jsDir);

// Read all files in root
const files = fs.readdirSync(rootDir);

const cssFiles = files.filter(f => f.endsWith('.css') && fs.statSync(path.join(rootDir, f)).isFile());
const jsFiles = files.filter(f => f.endsWith('.js') && fs.statSync(path.join(rootDir, f)).isFile());
const htmlFiles = files.filter(f => f.endsWith('.html') && fs.statSync(path.join(rootDir, f)).isFile());

console.log('Moving CSS files:', cssFiles);
console.log('Moving JS files:', jsFiles);

// Move CSS and JS files
cssFiles.forEach(f => {
  fs.renameSync(path.join(rootDir, f), path.join(cssDir, f));
});

jsFiles.forEach(f => {
  fs.renameSync(path.join(rootDir, f), path.join(jsDir, f));
});

// Update HTML files
htmlFiles.forEach(htmlFile => {
  const filePath = path.join(rootDir, htmlFile);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace CSS links
  // Match <link rel="stylesheet" href="filename.css" />
  cssFiles.forEach(cssFile => {
    // Escape dots for regex
    const escapedName = cssFile.replace(/\./g, '\\.');
    const regex = new RegExp(`href=(["'])${escapedName}(["'])`, 'g');
    content = content.replace(regex, `href=$1css/${cssFile}$2`);
  });

  // Replace JS script tags
  jsFiles.forEach(jsFile => {
    const escapedName = jsFile.replace(/\./g, '\\.');
    const regex = new RegExp(`src=(["'])${escapedName}(["'])`, 'g');
    content = content.replace(regex, `src=$1js/${jsFile}$2`);
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated', htmlFile);
});

// Now remove dashboard folder
const dashboardPath = path.join(rootDir, 'dashboard');
if (fs.existsSync(dashboardPath)) {
  fs.rmSync(dashboardPath, { recursive: true, force: true });
  console.log('Removed dashboard folder.');
}

console.log('Refactoring complete.');
