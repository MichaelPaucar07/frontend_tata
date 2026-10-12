export type NotificationType = 'success' | 'error';

export interface ToastNotification {
  id: number;
  type: NotificationType;
  message: string;
}
