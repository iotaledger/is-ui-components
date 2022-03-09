import { writable } from 'svelte/store'
import { generateRandomId } from './utils'
import type { Notification } from './types/notificacion'
import { NOTIFICATION_TIMEOUT_DEFAULT, NOTIFICATION_TIMEOUT_NEVER } from './constants/notificacion'

export const notifications = writable<Array<Notification>>([])

export function showNotification(Notification: Notification): string {
  Notification.id = generateRandomId()
  Notification.timeout = Notification.timeout ?? NOTIFICATION_TIMEOUT_DEFAULT

  notifications.update((_currentNotification) => {
    _currentNotification.push(Notification)
    return _currentNotification
  })

  if (Notification.timeout !== NOTIFICATION_TIMEOUT_NEVER) {
    setTimeout(() => removeNotificacion(Notification.id), Notification.timeout)
  }

  return Notification.id
}

export function removeNotificacion(id: string | undefined): void {
  notifications.update((_currentNotification) => {
    const idx = _currentNotification.findIndex((n) => n.id === id)
    if (idx >= 0) {
      _currentNotification.splice(idx, 1)
    }
    return _currentNotification
  })
}

export function updateNotificacion(id: string, updateData: Notification): void {
  notifications.update((_currentNotification) => {
    const notification = _currentNotification.find((n) => n.id === id)
    if (notification) {
      notification.message = updateData.message;
      notification.timeout = updateData.timeout ?? NOTIFICATION_TIMEOUT_DEFAULT;

      if (notification.timeout !== NOTIFICATION_TIMEOUT_NEVER) {
        setTimeout(() => removeNotificacion(notification.id), notification.timeout);
      }
    }
    return _currentNotification
  })
}

