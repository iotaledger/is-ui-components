export type Notification = {
  type: NotificationType
  title?: string
  message: string
  id?: string
  timeout?: number
}

export enum NotificationType {
  Error = 'error',
}

