import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const userId = "user_2t18bXzV8vPjWj6y1F3y2D4z6k7"; // Clerk mock tester ID
  const email = "demo@smartsave.ai";
  const firstName = "Jane";
  const lastName = "SmartSave";

  console.log("🌱 Start seeding mock demo data...");

  // 1. Upsert User
  const user = await prisma.user.upsert({
    where: { id: userId },
    update: { email, firstName, lastName },
    create: {
      id: userId,
      email,
      firstName,
      lastName,
    },
  });
  console.log(`👤 Seeded User: ${user.firstName} ${user.lastName} (${user.id})`);

  // 2. Upsert Wallet
  const wallet = await prisma.wallet.upsert({
    where: { userId },
    update: { balance: 250.00 },
    create: {
      userId,
      balance: 250.00,
      cardNumber: "4111222233334444",
      currency: "USD",
    },
  });
  console.log(`💳 Seeded Main Wallet. Balance: $${wallet.balance}`);

  // 3. Upsert Normal Savings
  const normalSavings = await prisma.normalSavings.upsert({
    where: { userId },
    update: { balance: 1200.00 },
    create: {
      userId,
      balance: 1200.00,
      currency: "USD",
    },
  });
  console.log(`📈 Seeded Flexible Savings. Balance: $${normalSavings.balance}`);

  // 4. Upsert Strict Savings
  const strictSavings = await prisma.strictSavings.upsert({
    where: { userId },
    update: {
      balance: 5000.00,
      withdrawalThreshold: 1000.00,
      totalSaved: 5000.00,
      startDate: new Date("2026-07-10T00:00:00Z"),
      endDate: new Date("2026-08-10T00:00:00Z"),
    },
    create: {
      userId,
      balance: 5000.00,
      withdrawalThreshold: 1000.00,
      totalSaved: 5000.00,
      currency: "USD",
      startDate: new Date("2026-07-10T00:00:00Z"),
      endDate: new Date("2026-08-10T00:00:00Z"),
    },
  });
  console.log(`🔒 Seeded Protected Strict Vault. Balance: $${strictSavings.balance}, Reserve Threshold: $${strictSavings.withdrawalThreshold}`);

  // 5. Delete existing and Seed clean Notifications list
  await prisma.notification.deleteMany({ where: { userId } });
  await prisma.notification.createMany({
    data: [
      {
        userId,
        type: "SUCCESS",
        title: "Welcome to SmartSave AI Wallet!",
        message: "Your production-ready AI-powered savings engine is fully functional.",
        read: false,
      },
      {
        userId,
        type: "INFO",
        title: "Flexible Savings Deposited",
        message: "You moved $200.00 from Main Wallet to Flexible Savings.",
        read: true,
      },
      {
        userId,
        type: "WARNING",
        title: "Protected Vault Funded",
        message: "You deposited $5,000.00 to Strict Savings. Your Protected Reserve threshold limit is set to $1,000.00.",
        read: true,
      }
    ]
  });
  console.log("🔔 Seeded Notification history items.");

  // 6. Delete existing and Seed clean Transactions list
  await prisma.transaction.deleteMany({ where: { userId } });
  await prisma.transaction.createMany({
    data: [
      {
        userId,
        type: "RECEIVE",
        direction: "CREDIT",
        amount: 250.00,
        currency: "USD",
        description: "Initial card deposit",
        status: "COMPLETED",
        walletType: "MAIN",
      },
      {
        userId,
        type: "DEPOSIT",
        direction: "CREDIT",
        amount: 1200.00,
        currency: "USD",
        description: "Transfer from Main Wallet",
        status: "COMPLETED",
        walletType: "SAVINGS",
      },
      {
        userId,
        type: "DEPOSIT",
        direction: "CREDIT",
        amount: 5000.00,
        currency: "USD",
        description: "Transfer from Main Wallet",
        status: "COMPLETED",
        walletType: "STRICT",
      }
    ]
  });
  console.log("📊 Seeded Transaction logs.");

  // 7. Seed sample VerificationRequest items
  await prisma.verificationRequest.deleteMany({ where: { userId } });
  await prisma.verificationRequest.create({
    data: {
      userId,
      amount: 1500.00,
      status: "APPROVED",
      documentName: "hospital_invoice.png",
      documentSize: 120485,
      mimeType: "image/png",
      documentUrl: "uploads/hospital_invoice.png",
      classification: "ALL_APPROVED",
      confidence: 0.98,
      reasoning: "Hospital ER visit invoice validated. Medical expenditures classified as essential.",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    }
  });
  console.log("📁 Seeded Verification requests logs.");

  console.log("🏁 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("🛑 Seeding script crashed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
