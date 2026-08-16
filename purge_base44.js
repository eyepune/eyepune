import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.join(__dirname, 'src');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function processFile(filePath) {
    if (!filePath.endsWith('.js') && !filePath.endsWith('.jsx') && !filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Replace Imports
    content = content.replace(/import\s+\{\s*base44\s*\}\s+from\s+['"]@\/api\/base44Client['"];?/g, 
        "import { supabase } from '@/integrations/supabase/client';");

    // 2. Auth replacements
    content = content.replace(/base44\.auth\.me\(\)/g, "supabase.auth.getSession().then(({data}) => data.session?.user)");
    content = content.replace(/base44\.auth\.logout\([^)]*\)/g, "supabase.auth.signOut()");
    content = content.replace(/base44\.auth\.redirectToLogin\([^)]*\)/g, "window.location.href = '/login'");
    
    // 3. Edge Functions
    content = content.replace(/base44\.functions\.invoke\('([^']+)',\s*(\{.*?\})\)/g, "supabase.functions.invoke('$1', { body: $2 })");
    content = content.replace(/base44\.functions\.invoke\('([^']+)'\)/g, "supabase.functions.invoke('$1')");

    // 4. Integrations
    content = content.replace(/base44\.integrations\.Core\.UploadFile\(\{([^}]+)\}\)/g, "supabase.storage.from('uploads').upload($1)");

    // 5. Basic Entity Replacements (Fallback to generic db object if complex)
    // NOTE: True ORM transpilation requires AST. For now, we rename remaining base44 calls to supabase.
    content = content.replace(/base44\./g, "supabase.");

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[Migrated] ${filePath}`);
    }
}

console.log('Initiating Global Base44 Purge (ESM)...');
walkDir(SRC_DIR, processFile);
console.log('Purge Complete. Please manually verify complex ORM queries.');
