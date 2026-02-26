const fs = require('fs');
const path = require('path');

function generateInventory(profileName, outputFileName) {
    // Looks for the folder inside the 'public' directory
    const folderPath = path.join(__dirname, 'public', profileName);
    
    // Check if folder exists
    if (!fs.existsSync(folderPath)) {
        console.log(`⚠️ Folder not found: ${folderPath}`);
        return;
    }

    fs.readdir(folderPath, (err, files) => {
        if (err) return console.log(`Error reading folder ${profileName}`, err);

        let inventory = [];
        let idCounter = 1;

        files.forEach(file => {
            if (file.match(/\.(png|jpg|jpeg|webp)$/i)) {
                let nameWithoutExt = file.split('.')[0];
                let parts = nameWithoutExt.split('-');
                let code = parts[0];
                let price = parts[1] ? parts[1].replace(/[^0-9]/g, '') : "0";

                inventory.push({
                    id: idCounter.toString(),
                    code: code,
                    title: code,
                    price: price,
                    "Sort by": price,
                    img: `/${profileName}/${file}` 
                });
                idCounter++;
            }
        });

        // Write directly to the public folder so the app can fetch it
        const outputPath = path.join(__dirname, 'public', outputFileName);
        fs.writeFileSync(outputPath, JSON.stringify(inventory, null, 2));
        console.log(`✅ Generated ${inventory.length} items for ${outputFileName}`);
    });
}

// Generate for both profiles
generateInventory('profile1', 'inventory1.json');
generateInventory('profile2', 'inventory2.json');