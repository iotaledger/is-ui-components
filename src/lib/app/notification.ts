import { writable } from 'svelte/store'
import { generateRandomId } from './utils'
import type { Notification } from '$lib/app/types/notification'
import { NOTIFICATION_TIMEOUT_DEFAULT, NOTIFICATION_TIMEOUT_NEVER } from '$lib/app/constants/notification'

export const notifications = writable<Array<Notification>>([])

export function showNotification(Notification: Notification): string {
  Notification.id = generateRandomId()
  Notification.timeout = Notification.timeout ?? NOTIFICATION_TIMEOUT_DEFAULT

  notifications.update((_currentNotification) => {
    _currentNotification.push(Notification)
    return _currentNotification
  })

  if (Notification.timeout !== NOTIFICATION_TIMEOUT_NEVER) {
    setTimeout(() => removeNotification(Notification.id), Notification.timeout)
  }

  return Notification.id
}

export function removeNotification(id: string | undefined): void {
  notifications.update((_currentNotification) => {
    const idx = _currentNotification.findIndex((n) => n.id === id)
    if (idx >= 0) {
      _currentNotification.splice(idx, 1)
    }
    return _currentNotification
  })
}

export function updateNotification(id: string, updateData: Notification): void {
  notifications.update((_currentNotification) => {
    const notification = _currentNotification.find((n) => n.id === id)
    if (notification) {
      notification.message = updateData.message;
      notification.timeout = updateData.timeout ?? NOTIFICATION_TIMEOUT_DEFAULT;

      if (notification.timeout !== NOTIFICATION_TIMEOUT_NEVER) {
        setTimeout(() => removeNotification(notification.id), notification.timeout);
      }
    }
    return _currentNotification
  })
}

