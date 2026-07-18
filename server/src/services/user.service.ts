import { prisma } from "@/prisma/client";
import { NotFoundError } from "@/utils/errors";

export class UserService {
  // Sync Clerk profile and initialize wallet products
  public static async syncUser(
    id: string,
    data: {
      firstName: string;
      lastName: string;
      email: string;
      avatarUrl?: string | null;
    }
  ) {
    // Resolve email collision in development to allow seamless switching between login modes
    if (data.email) {
      const existingEmailUser = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingEmailUser && existingEmailUser.id !== id) {
        if (process.env.NODE_ENV !== "production") {
          await prisma.user.delete({ where: { id: existingEmailUser.id } });
        } else {
          throw new Error("Email already registered with another account");
        }
      }
    }

    // Upsert user profile
    await prisma.user.upsert({
      where: { id },
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        avatarUrl: data.avatarUrl,
      },
      create: {
        id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        avatarUrl: data.avatarUrl,
      },
    });

    // Check and initialize Main Wallet
    const wallet = await prisma.wallet.findUnique({ where: { userId: id } });
    if (!wallet) {
      // Create random card number mimic
      const cardSuffix = Math.floor(1000 + Math.random() * 9000).toString();
      await prisma.wallet.create({
        data: {
          userId: id,
          balance: 1000.00, // Pre-fund with $1000 for ease of testing!
          cardNumber: `**** **** **** ${cardSuffix}`,
        },
      });
    }

    // Check and initialize Normal Savings
    const normalSavings = await prisma.normalSavings.findUnique({ where: { userId: id } });
    if (!normalSavings) {
      await prisma.normalSavings.create({
        data: {
          userId: id,
          balance: 0.00,
          monthlyGrowth: 2.4,
        },
      });
    }

    // Check and initialize Strict Savings
    const strictSavings = await prisma.strictSavings.findUnique({ where: { userId: id } });
    if (!strictSavings) {
      const defaultEndDate = new Date();
      defaultEndDate.setDate(defaultEndDate.getDate() + 30);
      await prisma.strictSavings.create({
        data: {
          userId: id,
          balance: 0.00,
          withdrawalThreshold: 500.00,
          totalSaved: 0.00,
          endDate: defaultEndDate,
        },
      });
    }

    // Check and initialize Settings
    const settings = await prisma.settings.findUnique({ where: { userId: id } });
    if (!settings) {
      await prisma.settings.create({
        data: {
          userId: id,
          theme: "dark",
        },
      });
    }

    return prisma.user.findUnique({
      where: { id },
      include: {
        wallet: true,
        normalSavings: true,
        strictSavings: true,
        settings: true,
      },
    });
  }

  public static async getUserProfile(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        wallet: true,
        normalSavings: true,
        strictSavings: true,
        settings: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User profile not found");
    }

    return user;
  }

  public static async updateSettings(
    userId: string,
    data: {
      biometricsEnabled?: boolean;
      notificationsEnabled?: boolean;
      strictModeEnabled?: boolean;
      theme?: string;
      withdrawalThreshold?: number;
      endDate?: string;
    }
  ) {
    const settingsUpdate: any = {};
    if (data.biometricsEnabled !== undefined) settingsUpdate.biometricsEnabled = data.biometricsEnabled;
    if (data.notificationsEnabled !== undefined) settingsUpdate.notificationsEnabled = data.notificationsEnabled;
    if (data.strictModeEnabled !== undefined) settingsUpdate.strictModeEnabled = data.strictModeEnabled;
    if (data.theme !== undefined) settingsUpdate.theme = data.theme;

    const settings = await prisma.settings.upsert({
      where: { userId },
      update: settingsUpdate,
      create: {
        userId,
        biometricsEnabled: data.biometricsEnabled ?? true,
        notificationsEnabled: data.notificationsEnabled ?? true,
        strictModeEnabled: data.strictModeEnabled ?? true,
        theme: data.theme ?? "dark",
      },
    });

    if (data.withdrawalThreshold !== undefined || data.endDate !== undefined) {
      const strictSavings = await prisma.strictSavings.findUnique({ where: { userId } });
      if (strictSavings) {
        const updateData: any = {};
        if (data.withdrawalThreshold !== undefined) {
          updateData.withdrawalThreshold = data.withdrawalThreshold;
        }
        if (data.endDate !== undefined) {
          const now = new Date();
          const currentEndDate = new Date(strictSavings.endDate);
          if (now < currentEndDate) {
            updateData.endDate = new Date(data.endDate);
          }
        }
        if (Object.keys(updateData).length > 0) {
          await prisma.strictSavings.update({
            where: { userId },
            data: updateData,
          });
        }
      }
    }

    // Generate notification for settings change (Requirement 10)
    await prisma.notification.create({
      data: {
        userId,
        type: "INFO",
        title: "Settings Updated",
        message: "Your preference settings have been successfully updated.",
      },
    });

    return settings;
  }
}
