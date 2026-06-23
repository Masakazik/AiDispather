export const NOTIFICATIONS_QUEUE = 'notifications';

export interface NotificationJobData {
  type: 'REQUEST_CREATED' | 'REQUEST_ASSIGNED' | 'REQUEST_STATUS_CHANGED';
  requestId: string;
  message: string;
}
