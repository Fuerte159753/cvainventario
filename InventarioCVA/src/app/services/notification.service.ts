// notification.service.ts
import { Injectable } from '@angular/core';
import { Notyf } from 'notyf';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notyf: Notyf;

  constructor() {
    this.notyf = new Notyf({
      duration: 5000,
      position: {
        x: 'right',
        y: 'top'
      },
      types: [
        {
          type: 'success',
          background: '#4CAF50',
          dismissible: true
        },
        {
          type: 'error',
          background: '#F44336',
          dismissible: true
        },
        {
          type: 'warning',
          background: '#FF9800',
          dismissible: true
        }
      ]
    });
  }

  success(message: string): void {
    this.notyf.success(message);
  }

  error(message: string): void {
    this.notyf.error(message);
  }

  warning(message: string): void {
    this.notyf.open({
      type: 'warning',
      message: message
    });
  }
}