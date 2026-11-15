// npm run dev:memory: runs the API against an in-memory MongoDB with demo data.
// Handy when Docker isn't available. Data resets every time the server restarts.
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { start } from "./index.js";
import { DEMO_PASSWORD, seedDatabase } from "./lib/seedData.js";

const mongo = await MongoMemoryServer.create();
await start(mongo.getUri("service-manager"));
await seedDatabase();
console.log(`In-memory database seeded. Log in with maya@sparkle.ca or alex@example.com / ${DEMO_PASSWORD}`);

const stop = async () => {
  await mongoose.disconnect();
  await mongo.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
