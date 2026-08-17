import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { TrackingResponse, Order, ReturnStatus } from '../../models';
import { rupees } from '../../utils';

const DELIVERY_STAGES = ['ORDERED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const RETURN_STAGES = [
  'RETURN_REQUESTED',
  'RETURN_APPROVED',
  'PICKUP_SCHEDULED',
  'PICKED_UP',
  'REFUND_INITIATED',
  'REFUNDED'
];

@Component({
  selector: 'app-tracking',
  imports: [RouterLink, DatePipe],
  templateUrl: './tracking.html',
  styleUrl: './tracking.scss'
})
export class Tracking {
  private readonly ordersApi = inject(OrderService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);

  readonly order = signal<Order | null>(null);
  readonly tracking = signal<TrackingResponse | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly role = this.auth.role;

  readonly deliveryStages = DELIVERY_STAGES;
  readonly returnStages = RETURN_STAGES;

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.load(id);
  }

  load(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.ordersApi.get(id).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loadTracking(id);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Failed to load order');
        this.loading.set(false);
      }
    });
  }

  loadTracking(id: number): void {
    this.ordersApi.tracking(id).subscribe({
      next: (tracking) => {
        this.tracking.set(tracking);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Failed to load tracking');
        this.loading.set(false);
      }
    });
  }

  money(v: number): string {
    return rupees(v);
  }

  deliveryStepIndex(): number {
    const s = this.tracking()?.trackingStatus;
    return s ? this.deliveryStages.indexOf(s) : -1;
  }

  returnStepIndex(): number {
    const s = this.tracking()?.returnStatus as ReturnStatus | null | undefined;
    return s ? this.returnStages.indexOf(s) : -1;
  }

  deliveryDone(stage: string): boolean {
    const idx = this.deliveryStepIndex();
    return idx >= 0 && this.deliveryStages.indexOf(stage) < idx;
  }

  deliveryCurrent(stage: string): boolean {
    return this.tracking()?.trackingStatus === stage;
  }

  returnDone(stage: string): boolean {
    const idx = this.returnStepIndex();
    return idx >= 0 && this.returnStages.indexOf(stage) < idx;
  }

  returnCurrent(stage: string): boolean {
    return this.tracking()?.returnStatus === stage;
  }

  canRequestReturn(): boolean {
    const t = this.tracking();
    return this.role() === 'BUYER' && !!t && t.trackingStatus === 'DELIVERED' && !t.returnStatus;
  }

  canCancelReturn(): boolean {
    return this.tracking()?.returnStatus === 'RETURN_REQUESTED';
  }

  requestReturn(): void {
    const order = this.order();
    if (!order) return;
    this.ordersApi.requestReturn(order.id).subscribe({
      next: (tracking) => {
        this.tracking.set(tracking);
        this.toast.success('Return request submitted');
      },
      error: (err) => this.toast.error(err.error?.message ?? 'Failed to request return')
    });
  }

  cancelReturn(): void {
    const order = this.order();
    if (!order) return;
    this.ordersApi.cancelReturn(order.id).subscribe({
      next: (tracking) => {
        this.tracking.set(tracking);
        this.toast.success('Return request cancelled');
      },
      error: (err) => this.toast.error(err.error?.message ?? 'Failed to cancel return')
    });
  }

  label(stage: string): string {
    return stage.replaceAll('_', ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase());
  }
}