const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'views');

fs.readdir(directoryPath, function (err, files) {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    
    files.forEach(function (file) {
        if (file.startsWith('Service_')) {
            const filePath = path.join(directoryPath, file);
            let content = fs.readFileSync(filePath, 'utf8');
            
            // We want to avoid replacing "EyE PunE", so we'll be careful.
            // Replace "in Pune" with "globally"
            content = content.replace(/in Pune(?!\w)/gi, 'globally');
            
            // Replace "· Pune" with "· Global"
            content = content.replace(/· Pune/g, '· Global');
            
            // Replace "Pune business" with "business"
            content = content.replace(/Pune business/gi, 'global business');
            
            // Replace "Pune's" with "Global"
            content = content.replace(/Pune's/gi, 'Global');

            // Replace "Pune" when it's just attached to the end of a service name like "Website Development Pune"
            // Let's replace "Development Pune" -> "Development Global"
            content = content.replace(/Development Pune/gi, 'Development Global');
            content = content.replace(/Management Pune/gi, 'Management Global');
            content = content.replace(/Ads Pune/gi, 'Ads Global');
            content = content.replace(/Funnels Pune/gi, 'Funnels Global');
            content = content.replace(/Agency Pune/gi, 'Agency Global');
            content = content.replace(/Automation Pune/gi, 'Automation Global');
            
            // Specifically fix the hero section large text which might just say "Pune"
            content = content.replace(/<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Pune<\/span>/g, '<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Global</span>');
            content = content.replace(/<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Management Pune<\/span>/g, '<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Global</span>');

            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated ${file}`);
        }
    });
});
