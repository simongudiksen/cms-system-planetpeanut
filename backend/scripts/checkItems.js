const mongoose = require("mongoose");
const Item = require("../src/models/Item");
require("dotenv").config();

async function checkItems() {
  await mongoose.connect(process.env.MONGODB_URI);

  const totalCount = await Item.countDocuments();
  const withOriginalId = await Item.countDocuments({
    originalId: { $exists: true },
  });
  const withImages = await Item.countDocuments({
    imageRaisedUrl: { $exists: true },
    imageShopUrl: { $exists: true },
  });

  // Get some sample items to verify
  const sampleItems = await Item.find({})
    .select("title originalId price currency level")
    .limit(5);

  console.log("📊 Database Status:");
  console.log(`Total items: ${totalCount}`);
  console.log(`Items with originalId: ${withOriginalId}`);
  console.log(`Items with both images: ${withImages}`);
  console.log("");

  if (totalCount === 46 && withOriginalId === 46 && withImages === 46) {
    console.log("✅ SUCCESS: All 46 items uploaded correctly!");
  } else {
    console.log("⚠️ Some items may be missing or incomplete");
  }

  console.log("\n🔍 Sample items:");
  sampleItems.forEach((item) => {
    console.log(
      `- ${item.title} (ID: ${item.originalId}) - ${item.price} ${
        item.currency || "peanuts"
      } - Level ${item.level || "N/A"}`
    );
  });

  await mongoose.disconnect();
}

checkItems().catch(console.error);
