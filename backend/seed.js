const mongoose = require("mongoose");
const settings = require("./config/settings");
const { ensureSeedData } = require("./services/seedService");

async function seed() {
    try {
        await mongoose.connect(settings.MONGODB_URI, { dbName: settings.APP_NAME });
        console.log("Connected to MongoDB for seeding");
        await ensureSeedData();
        await mongoose.connection.close();
        console.log("Seeding complete.");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
}

seed();
