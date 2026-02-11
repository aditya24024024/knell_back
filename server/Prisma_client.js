// // prismaClient.js
// import { PrismaClient } from '@prisma/client';

// let prisma;

// prisma = new PrismaClient();

// export default prisma;
// Prisma_client.js
import { PrismaClient } from "@prisma/client";

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

async function connectWithRetry() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (err) {
    console.error("❌ Database connection failed. Retrying in 5 seconds...");
    setTimeout(connectWithRetry, 5000);
  }
}

connectWithRetry();

export default prisma;
