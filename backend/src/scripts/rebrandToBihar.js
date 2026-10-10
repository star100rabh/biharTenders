import fs from 'fs';
import path from 'path';

const frontendSrcPath = path.resolve('../frontend/src');

const replacements = [
  { regex: /Jammu &amp; Kashmir/gi, replace: 'Bihar' },
  { regex: /Jammu & Kashmir/gi, replace: 'Bihar' },
  { regex: /Jammu and Kashmir/gi, replace: 'Bihar' },
  { regex: /J&K/gi, replace: 'Bihar' },
  { regex: /\bJammu\b/gi, replace: 'Patna' },
  { regex: /\bSrinagar\b/gi, replace: 'Gaya' },
  { regex: /\bBaramulla\b/gi, replace: 'Muzaffarpur' },
  { regex: /\bBandipora\b/gi, replace: 'Bhagalpur' },
  { regex: /\bAnantnag\b/gi, replace: 'Darbhanga' },
  { regex: /\bPulwama\b/gi, replace: 'Purnia' },
  { regex: /20 districts/gi, replace: '38 districts' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const { regex, replace } of replacements) {
        content = content.replace(regex, replace);
      }
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(frontendSrcPath);
console.log('Rebranding complete!');
