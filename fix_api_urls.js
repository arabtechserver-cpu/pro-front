const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

let modifiedCount = 0;

walkDir('./src', function(filePath) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.js')) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // We only want to replace in client components.
        // Wait, what if the component doesn't have "use client" but is imported by one?
        // Actually, replacing `http://localhost:3001/api` with `/api` is safe for any file that is not run purely on the server.
        // Let's just do it for files that explicitly have "use client" OR are in the 'components' folder OR ends with 'Client.tsx'.
        let isClient = content.includes('"use client"') || content.includes("'use client'") || filePath.includes('Client.tsx') || filePath.includes('components');
        
        if (isClient) {
            let newContent = content.replace(/http:\/\/localhost:3001\/api/g, '/api');
            if (newContent !== content) {
                fs.writeFileSync(filePath, newContent, 'utf8');
                console.log(`Updated ${filePath}`);
                modifiedCount++;
            }
        }
    }
});

console.log(`Done! Modified ${modifiedCount} files.`);
