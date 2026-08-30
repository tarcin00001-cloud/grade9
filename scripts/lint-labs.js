const fs = require('fs');
const path = require('path');

const LABS_DIR = path.join(__dirname, '../labs');
const BANNED_WORDS = [
  "Array", "Sorted Array", "Binary Word", "Binary Bus", "Positional", "Sequential", 
  "MegaWatts", "Conduit", "Candidates", "Active Span", "Sorted", "Index notation",
  "kHz", "MHz", "Script Execution", "Automation", "Harness", "Cartridge", "Bootloader", "Firmware"
];

function lintFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let hasError = false;
  
  BANNED_WORDS.forEach(word => {
    // Only check for exact word matches, but exclude common code usages like Array.from or Array<T>
    let regex;
    if (word === "Array") {
      // For Array, only flag if it's preceded by a space and followed by space or punctuation, NOT dot or bracket
      regex = /(?<![a-zA-Z0-9_])Array(?![.\(<a-zA-Z0-9_])/i;
    } else {
      regex = new RegExp(`\\b${word}\\b`, 'i');
    }
    
    if (regex.test(content)) {
      console.error(`❌ [LINT ERROR] Banned word "${word}" found in ${filePath}`);
      hasError = true;
    }
  });

  return !hasError;
}

function runLint() {
  if (!fs.existsSync(LABS_DIR)) {
    console.log("No labs directory found. Skipping.");
    process.exit(0);
  }

  const files = fs.readdirSync(LABS_DIR).filter(f => f.endsWith('.tsx'));
  let allPass = true;

  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;

  files.forEach(file => {
    const filePath = path.join(LABS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check banned words
    if (!lintFile(filePath)) {
      allPass = false;
    }

    // Check emojis
    if (emojiRegex.test(content)) {
      console.error(`❌ [LINT ERROR] Emoji found in ${filePath}`);
      allPass = false;
    }
  });

  if (allPass) {
    console.log("✅ Lab linting passed.");
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runLint();
