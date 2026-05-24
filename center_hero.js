const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'src', 'views');
const files = fs.readdirSync(viewsDir);

for (const file of files) {
    if (file.endsWith('.jsx')) {
        const filePath = path.join(viewsDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Replace max-w-3xl
        if (content.includes('<div className="max-w-7xl mx-auto px-6 relative z-10">\n                    <div className="max-w-3xl">')) {
            content = content.replace(
                '<div className="max-w-7xl mx-auto px-6 relative z-10">\n                    <div className="max-w-3xl">',
                '<div className="max-w-7xl mx-auto px-6 relative z-10">\n                    <div className="max-w-3xl mx-auto text-center">'
            );
            modified = true;
        }

        // Replace max-w-4xl
        if (content.includes('<div className="max-w-7xl mx-auto px-6 relative z-10">\n                    <div className="max-w-4xl">')) {
            content = content.replace(
                '<div className="max-w-7xl mx-auto px-6 relative z-10">\n                    <div className="max-w-4xl">',
                '<div className="max-w-7xl mx-auto px-6 relative z-10">\n                    <div className="max-w-4xl mx-auto text-center">'
            );
            modified = true;
        }

        // Replace flex buttons
        if (content.includes('<div className="flex flex-wrap gap-4">')) {
            content = content.replace(/<div className=\"flex flex-wrap gap-4\">/g, '<div className="flex flex-wrap justify-center gap-4">');
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated ${file}`);
        }
    }
}
