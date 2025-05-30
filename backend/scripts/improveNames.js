// Helper script to improve auto-generated item names
const nameImprovements = {
  // Fix specific cases
  "3dglasses": "3D Glasses",
  christmashat: "Christmas Hat",
  gasmask: "Gas Mask",
  mouthmask: "Mouth Mask",
  peanutheadband: "Peanut Headband",
  peanutrobe: "Peanut Robe",
  skullhelmet: "Skull Helmet",
  leathergear: "Leather Gear",
  neckscrap: "Neck Scrap",
  multibelt: "Multi Belt",
  ungabunga: "Unga Bunga",

  // Color variants - make them more readable
  helmetblue: "Blue Helmet",
  helmetpink: "Pink Helmet",
  helmetred: "Red Helmet",
  helmetwhite: "White Helmet",
  hoodieblue: "Blue Hoodie",
  hoodiepink: "Pink Hoodie",
  hoodiered: "Red Hoodie",
  sweatsblue: "Blue Sweats",
  sweatspink: "Pink Sweats",
  sweatsred: "Red Sweats",
  indoorsuitblue: "Blue Indoor Suit",
  indoorsuitgreen: "Green Indoor Suit",
  indoorsuitorange: "Orange Indoor Suit",
  indoorsuitpink: "Pink Indoor Suit",
  indoorsuitpurple: "Purple Indoor Suit",
  spacesuitorange: "Orange Space Suit",
  spacesuitwhite: "White Space Suit",

  // Weapon names
  gun1: "Assault Rifle",
  gun2: "Plasma Cannon",
  gun3: "Energy Blaster",
  gun4: "Laser Pistol",
  knife: "Combat Knife",

  // Other improvements
  banana: "Banana Peel",
  potato: "Potato Costume",
  tire: "Tire Accessory",
  cable: "Power Cable",
  cables: "Cable Harness",
  scouter: "Battle Scouter",
  necklace: "Peanut Necklace",
};

/**
 * Improve the automatically generated item name
 * @param {string} normalizedName - The normalized filename
 * @param {string} originalName - Original generated name
 * @returns {string} Improved name
 */
function improveItemName(normalizedName, originalName) {
  // Check if we have a specific improvement
  if (nameImprovements[normalizedName.toLowerCase()]) {
    return nameImprovements[normalizedName.toLowerCase()];
  }

  // Apply general improvements
  let improved = originalName
    .replace(/([a-z])([A-Z])/g, "$1 $2") // Add spaces before capitals
    .replace(/\b\w/g, (l) => l.toUpperCase()) // Capitalize first letters
    .replace(/3d/gi, "3D")
    .replace(/Sv\b/gi, "")
    .replace(/\s+/g, " ") // Remove multiple spaces
    .trim();

  // Handle color + item patterns
  const colorPattern =
    /^(Red|Blue|Pink|Green|Orange|Purple|White|Black)\s*(.+)/i;
  const match = improved.match(colorPattern);
  if (match) {
    const color = match[1];
    const item = match[2];
    improved = `${color} ${item}`;
  }

  return improved || originalName;
}

module.exports = { improveItemName, nameImprovements };

// Test the function if run directly
if (require.main === module) {
  const testNames = [
    "3dglasses",
    "helmetblue",
    "gun1",
    "christmashat",
    "ungabunga",
    "indoorsuitpurple",
  ];

  console.log("Name Improvement Tests:");
  testNames.forEach((name) => {
    const improved = improveItemName(name, name);
    console.log(`${name} -> ${improved}`);
  });
}
