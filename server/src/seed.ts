// npm run seed: resets the database in MONGO_URI to the demo data.
import mongoose from "mongoose";
import { config } from "./config.js";
import { DEMO_PASSWORD, seedDatabase } from "./lib/seedData.js";

await mongoose.connect(config.mongoUri);
const counts = await seedDatabase();
console.log("Seeded:", counts);
console.log(`Demo logins (password "${DEMO_PASSWORD}"): maya@sparkle.ca (business), alex@example.com (customer)`);
await mongoose.disconnect();
