import fs from 'fs';
import path from 'path';
import * as xlsx from 'xlsx';

export async function fetchWixContacts() {
    try {
        const dataDir = path.join(process.cwd(), 'src', 'data');
        
        if (!fs.existsSync(dataDir)) {
            console.warn(`[Universal Parser] No data folder found at ${dataDir}.`);
            return [];
        }

        const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.csv') || f.endsWith('.xls') || f.endsWith('.xlsx'));
        
        if (files.length === 0) {
            console.warn(`[Universal Parser] No Excel or CSV files found in src/data.`);
            return [];
        }

        const allContacts = [];
        const uniqueEmails = new Set(); // Prevent duplicates across files

        for (const file of files) {
            const filePath = path.join(dataDir, file);
            console.log(`[Universal Parser] Parsing: ${file}`);
            
            try {
                // Read the file using xlsx (handles CSV, XLS, XLSX)
                const workbook = xlsx.readFile(filePath);
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // Convert to array of arrays to dynamically find columns
                const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
                
                if (rows.length <= 1) continue;

                // Find header indices (case insensitive search)
                const headers = (rows[0] || []).map(h => String(h || '').toLowerCase().trim());
                
                const emailIdx = headers.findIndex(h => h.includes('email'));
                const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('first'));
                const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('mobile'));
                const companyIdx = headers.findIndex(h => h.includes('company') || h.includes('organization') || h.includes('business'));

                if (emailIdx === -1) {
                    console.warn(`[Universal Parser] Skipping ${file} - No "Email" column found.`);
                    continue;
                }

                // Process rows
                for (let i = 1; i < rows.length; i++) {
                    const row = rows[i];
                    if (!row || row.length <= emailIdx) continue;

                    const rawEmail = String(row[emailIdx] || '').trim();
                    if (!rawEmail || !rawEmail.includes('@') || uniqueEmails.has(rawEmail.toLowerCase())) continue;

                    let name = 'Valued Client';
                    if (nameIdx !== -1 && row[nameIdx]) name = String(row[nameIdx]).trim();

                    let phone = '';
                    if (phoneIdx !== -1 && row[phoneIdx]) phone = String(row[phoneIdx]).trim();

                    let company = '';
                    if (companyIdx !== -1 && row[companyIdx]) company = String(row[companyIdx]).trim();

                    uniqueEmails.add(rawEmail.toLowerCase());
                    allContacts.push({
                        id: `import_${Date.now()}_${allContacts.length}`,
                        customer_name: name,
                        customer_email: rawEmail,
                        customer_phone: phone,
                        company_name: company, // Crucial for AI Personalization
                        source: `import_${file}`
                    });
                }
            } catch (err) {
                console.error(`[Universal Parser] Error reading ${file}:`, err);
            }
        }

        console.log(`[Universal Parser] Successfully parsed ${allContacts.length} unique contacts across ${files.length} files.`);
        return allContacts;

    } catch (error) {
        console.error('[Universal Parser] Global Error parsing files:', error);
        return [];
    }
}
