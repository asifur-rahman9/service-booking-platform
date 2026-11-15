import mongoose from "mongoose";
import { config } from "./config.js";
import { createApp } from "./app.js";

export async function start(mongoUri = config.mongoUri) {
  await mongoose.connect(mongoUri);
  console.log(`Connected to MongoDB`);
  createApp().listen(config.port, () => console.log(`API running on http://localhost:${config.port}`));
}

// Only auto-start when run directly (dev-memory.ts imports start()).
if (process.argv[1] && /index\.(ts|js)$/.test(process.argv[1])) {
  start().catch((err) => {
    console.error("Could not connect to MongoDB. Is it running? Try `docker compose up -d` or `npm run dev:memory`.");
    console.error(err.message);
    process.exit(1);
  });
}
