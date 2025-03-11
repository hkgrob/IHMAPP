
#!/usr/bin/env node

/**
 * This script clears the Expo/React Native cache and temporary files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = process.cwd();
const dirsToClean = [
  '.expo',
  'node_modules/.cache',
  'web-build'
];

console.log('🧹 Cleaning Expo and React Native cache...');

// Clean directories
dirsToClean.forEach(dir => {
  const dirPath = path.join(root, dir);
  if (fs.existsSync(dirPath)) {
    try {
      console.log(`Cleaning ${dir}...`);
      execSync(`rm -rf ${dirPath}/*`, { stdio: 'inherit' });
      console.log(`✅ Cleaned ${dir}`);
    } catch (error) {
      console.error(`❌ Error cleaning ${dir}: ${error.message}`);
    }
  } else {
    console.log(`⚠️ Directory ${dir} does not exist, skipping.`);
  }
});

// Run expo commands to clear cache
try {
  console.log('📦 Clearing Expo cache...');
  execSync('npx expo-cli start --clear', { stdio: 'inherit' });
} catch (error) {
  console.error(`❌ Error clearing Expo cache: ${error.message}`);
}

console.log('🔄 Rebuilding node modules cache...');
execSync('npm cache clean --force', { stdio: 'inherit' });

console.log('🚀 Cache reset complete! Restart your app to see the changes.');
