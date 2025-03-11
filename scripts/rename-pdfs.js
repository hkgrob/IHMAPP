
const fs = require('fs');
const path = require('path');

// Directory containing PDF files
const pdfDir = path.join(__dirname, '../attached_assets');

// Function to rename files
const renameFiles = () => {
  const files = fs.readdirSync(pdfDir);
  
  const renamedFiles = {};
  
  files.forEach(file => {
    // Only process PDF files
    if (file.endsWith('.pdf')) {
      const newName = file.replace(/\s+/g, '_');
      
      if (newName !== file) {
        const oldPath = path.join(pdfDir, file);
        const newPath = path.join(pdfDir, newName);
        
        // Rename the file
        fs.renameSync(oldPath, newPath);
        console.log(`Renamed: ${file} → ${newName}`);
        
        // Store the mapping for updating references
        renamedFiles[file] = newName;
      }
    }
  });
  
  return renamedFiles;
};

// Execute the renaming
const renamedFiles = renameFiles();

// Output the mapping for reference
console.log('\nFile mapping for code updates:');
console.log(JSON.stringify(renamedFiles, null, 2));
