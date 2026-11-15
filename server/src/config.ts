import "dotenv/config";

export const config = {
  port: Number(process.env.PORT ?? 3000),
  mongoUri: process.env.MONGO_URI ?? "mongodb://localhost:27017/service-manager",
  jwtSecret: process.env.JWT_SECRET ?? "dev-only-secret-change-me",
};
