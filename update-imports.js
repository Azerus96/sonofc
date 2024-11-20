const fs = require('fs');
const path = require('path');

function updateImports(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
            updateImports(filePath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Заменяем импорты
            content = content.replace(/from ['"]@\//g, `from '../`);
            content = content.replace(/import ['"]@\//g, `import '../`);
            
            fs.writeFileSync(filePath, content);
            console.log(`Updated imports in ${filePath}`);
        }
    });
}

// Запускаем для директории src
updateImports('./src');
