// Prisma configuration for Phở Video
// Prisma 7.x - All database URLs configured here

import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // Datasource configuration for Neon PostgreSQL
  // In Prisma 7.x, directUrl was removed - use DATABASE_URL for migrations
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
