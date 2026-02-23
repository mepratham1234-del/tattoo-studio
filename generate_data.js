const fs = require('fs');
const path = require('path');

// Points to your "public/tattoo" folder
const directoryPath = path.join(__dirname, 'public/tattoo');
// Points to the file we will create
const outputPath = path.join(__dirname, 'inventory.txt');

fs.readdir(directoryPath, (err, files) => {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }

    const inventory = [];
    let idCounter = 1;

    files.forEach((file) => {
        if (file.startsWith('.')) return; 

        const nameWithoutExt = path.parse(file).name;
        // Logic: Split by the last hyphen (e.g., "1-100" -> Code: 1, Price: 100)
        const lastHyphenIndex = nameWithoutExt.lastIndexOf('-');
        
        let code = 'Unknown';
        let price = '0';

        if (lastHyphenIndex !== -1) {
            code = nameWithoutExt.substring(0, lastHyphenIndex);
            price = nameWithoutExt.substring(lastHyphenIndex + 1);
        } else {
            code = nameWithoutExt;
        }

        inventory.push({
            id: idCounter.toString(),
            code: code,
            title: code, 
            price: price,
            category: 'All', 
            img: `/tattoo/${file}` // Matches your public folder structure
        });

        idCounter++;
    });

    // WRITE TO FILE INSTEAD OF CONSOLE
    fs.writeFileSync(outputPath, JSON.stringify(inventory, null, 2));
    console.log(`✅ Success! Data for ${inventory.length} designs saved to 'inventory.txt'.`);
    console.log(`👉 Open 'inventory.txt' in your project folder to copy the code.`);
});