import { Injectable, signal } from '@angular/core';
import { Notification, NotificationType } from '@core/models/notify/notify';

export const NOTIFY_DURATION_MS = 4000;

@Injectable({ providedIn: 'root' })
export class NotifyService {
  private readonly _notifications = signal<Notification[]>([]);
  readonly notifications = this._notifications.asReadonly();

  private nextId = 0;

  success(message: string): void {
    this.push('success', message);
  }

  error(message: string): void {
    this.push('error', message);
  }

  info(message: string): void {
    this.push('info', message);
  }

  dismiss(id: number): void {
    this._notifications.update((list) => list.filter((n) => n.id !== id));
  }

  private push(type: NotificationType, message: string): void {
    const id = ++this.nextId;
    this._notifications.update((list) => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), NOTIFY_DURATION_MS);
  }
}
