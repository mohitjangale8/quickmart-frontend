import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  imports: [],
  templateUrl: './toast.html',
  styleUrl: './toast.scss'
})
export class Toast {
  readonly toast = inject(ToastService);
  readonly toasts = this.toast.toasts;
}