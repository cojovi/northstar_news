export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration: number;
}

type NotificationCallback = (notification: Notification) => void;

let notificationCallback: NotificationCallback | null = null;

export function setNotificationCallback(callback: NotificationCallback) {
  notificationCallback = callback;
}

export function showNotification(message: string, type: NotificationType = 'info', duration: number = 3000) {
  if (notificationCallback) {
    const notification: Notification = {
      id: Math.random().toString(36),
      message,
      type,
      duration
    };
    notificationCallback(notification);
  }
}
