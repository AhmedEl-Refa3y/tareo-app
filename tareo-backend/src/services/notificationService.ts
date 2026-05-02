import admin from "firebase-admin";
import { logger } from "../utils/logger";
import User from "../models/User";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    logger.info("🔥 Firebase Admin initialized");
  } catch (error) {
    logger.error("Firebase Admin initialization error:", error);
  }
}

class NotificationService {
  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user?.pushEnabled || !user.notificationTokens.length) {
        logger.info(
          `User ${userId} has push notifications disabled or no tokens`,
        );
        return;
      }

      const messages = user.notificationTokens.map((token) => ({
        token,
        notification: { title, body },
        data: data || {},
        apns: {
          payload: {
            aps: {
              sound: "default",
              badge: 1,
            },
          },
        },
        android: {
          priority: "high" as const,
          notification: {
            sound: "default",
            channelId: "tareo_notifications",
          },
        },
      }));

      const response = await admin.messaging().sendEach(messages);
      logger.info(
        `📱 Push notifications sent to ${userId}: ${response.successCount} successful, ${response.failureCount} failed`,
      );

      // Handle failed tokens
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(user.notificationTokens[idx]);
          }
        });
        if (failedTokens.length) {
          await User.findByIdAndUpdate(userId, {
            $pull: { notificationTokens: { $in: failedTokens } },
          });
          logger.info(
            `Removed ${failedTokens.length} invalid tokens for user ${userId}`,
          );
        }
      }
    } catch (error) {
      logger.error("Failed to send push notification:", error);
    }
  }

  async sendNewMessageNotification(
    userId: string,
    senderName: string,
    sessionId: string,
  ): Promise<void> {
    await this.sendPushNotification(
      userId,
      "New Message",
      `${senderName} sent you a message`,
      {
        type: "message",
        sessionId,
      },
    );
  }

  async sendSessionReminder(
    userId: string,
    sessionType: string,
    sessionId: string,
  ): Promise<void> {
    await this.sendPushNotification(
      userId,
      "Session Reminder",
      `Your ${sessionType} session starts soon!`,
      {
        type: "reminder",
        sessionId,
      },
    );
  }

  async sendFeedbackRequest(userId: string, sessionId: string): Promise<void> {
    await this.sendPushNotification(
      userId,
      "How was your session?",
      "Please rate your recent session and share your feedback",
      {
        type: "feedback",
        sessionId,
      },
    );
  }

  async savePushToken(userId: string, token: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { notificationTokens: token },
    });
  }

  async removePushToken(userId: string, token: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $pull: { notificationTokens: token },
    });
  }
}

export default new NotificationService();
