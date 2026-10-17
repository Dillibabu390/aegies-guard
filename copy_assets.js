import fs from 'fs';
import path from 'path';

const targetDir = path.resolve('public/assets');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const sourceFiles = [
  {
    src: 'C:\\Users\\Dillibabu\\.gemini\\antigravity-ide\\brain\\4e7b4163-f207-495d-91ec-31da5fa3c3c1\\user_id_card_1791610579045.jpg',
    dest: 'id_card_alex.jpg'
  },
  {
    src: 'C:\\Users\\Dillibabu\\.gemini\\antigravity-ide\\brain\\4e7b4163-f207-495d-91ec-31da5fa3c3c1\\user_selfie_match_1791610601177.jpg',
    dest: 'selfie_alex_match.jpg'
  },
  {
    src: 'C:\\Users\\Dillibabu\\.gemini\\antigravity-ide\\brain\\4e7b4163-f207-495d-91ec-31da5fa3c3c1\\user_spoof_face_1791610621953.jpg',
    dest: 'selfie_spoof_fraud.jpg'
  }
];

for (const file of sourceFiles) {
  try {
    if (fs.existsSync(file.src)) {
      const destPath = path.join(targetDir, file.dest);
      fs.copyFileSync(file.src, destPath);
      console.log(`Copied ${file.src} -> ${destPath}`);
    } else {
      console.warn(`Source file not found: ${file.src}`);
    }
  } catch (err) {
    console.error(`Error copying ${file.src}:`, err);
  }
}
