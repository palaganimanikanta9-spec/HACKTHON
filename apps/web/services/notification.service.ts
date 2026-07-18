import { useSmartSaveStore } from "@/store/use-smartsave-store";

export const notificationService = {
  getNotifications: () => {
    return useSmartSaveStore.getState().notifications;
  },

  getUnreadCount: () => {
    return useSmartSaveStore.getState().notifications.filter((n) => !n.read).length;
  },

  markAsRead: () => {
    useSmartSaveStore.getState().markNotificationsAsRead();
  },

  clearAll: () => {
    useSmartSaveStore.getState().clearNotifications();
  },

};
