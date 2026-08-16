import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirsToDelete = [
  path.join(__dirname, 'src', 'app', 'lex-pro'),
  path.join(__dirname, 'src', 'components', 'lex-pro'),
  path.join(__dirname, 'src', 'app', 'api', 'lex-pro')
];

dirsToDelete.forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`Deleted: ${dir}`);
  } else {
    console.log(`Skipped (not found): ${dir}`);
  }
});

console.log('Lex Pro cleanup complete!');
