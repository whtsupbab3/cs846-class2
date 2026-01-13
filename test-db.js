const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  try {
    console.log("Testing database connection...");
    const users = await prisma.user.findMany();
    console.log("Users in DB:", users);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    console.error("Stack:", err.stack);
    process.exit(1);
  }
})();
