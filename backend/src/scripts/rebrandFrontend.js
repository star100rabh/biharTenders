import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function replaceInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace J&K and J and K
    if (content.includes('J&K') || content.includes('J and K')) {
      content = content.replace(/J&K/g, 'Bihar');
      content = content.replace(/J and K/g, 'Bihar');
      content = content.replace(/Jammu & Kashmir/g, 'Bihar');
      content = content.replace(/Jammu and Kashmir/g, 'Bihar');
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated:', filePath);
    }
  } catch (err) {
    console.error('Error reading/writing file:', filePath, err);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.html')) {
      replaceInFile(fullPath);
    }
  }
}

const frontendDir = path.join(__dirname, '../../../frontend/src');
walkDir(frontendDir);
replaceInFile(path.join(__dirname, '../../../frontend/index.html'));
console.log('✅ J&K references replaced with Bihar');
