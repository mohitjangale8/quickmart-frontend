import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { map, of } from 'rxjs';
import { AddressService } from '../../services/address.service';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { PaymentService } from '../../services/payment.service';
import { ToastService } from '../../services/toast.service';
import { CouponService } from '../../services/coupon.service';
import { Breadcrumbs, Crumb } from '../../components/breadcrumbs/breadcrumbs';
import { Address, Order, RazorpayOrderResponse } from '../../models';
import { imageFor, rupees } from '../../utils';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

interface Line {
  name: string;
  qty: number;
  amount: number;
  imageUrl?: string;
}

@Component({
  selector: 'app-checkout',
  imports: [RouterLink, FormsModule, Breadcrumbs],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class Checkout {
  private readonly addressesApi = inject(AddressService);
  private readonly ordersApi = inject(OrderService);
  private readonly paymentsApi = inject(PaymentService);
  private readonly couponsApi = inject(CouponService);
  private readonly cart = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly crumbs: Crumb[] = [{ label: 'Cart', link: ['/cart'] }, { label: 'Checkout' }];

  readonly couponCode = signal('');
  readonly couponApplying = signal(false);
  readonly couponMessage = signal<string | null>(null);
  readonly couponError = signal<string | null>(null);
  readonly discountAmount = signal(0);

  readonly step = signal<1 | 2>(1);
  readonly loading = signal(true);
  readonly addresses = signal<Address[]>([]);
  readonly selectedAddressId = signal<number | null>(null);
  readonly saving = signal(false);
  readonly paying = signal(false);
  readonly error = signal<string | null>(null);

  readonly orderId = signal<number | null>(null);
  readonly order = signal<Order | null>(null);
  readonly cartMode = signal(true);

  readonly showForm = signal(false);
  readonly form = {
    name: signal(''),
    phone: signal(''),
    line1: signal(''),
    line2: signal(''),
    city: signal(''),
    state: signal(''),
    pincode: signal(''),
    isDefault: signal(false)
  };

  constructor() {
    const q = this.route.snapshot.queryParamMap.get('order');
    this.orderId.set(q ? Number(q) : null);
    this.cartMode.set(!this.orderId());
    this.load();
  }

  readonly lines = computed<Line[]>(() => {
    if (this.cartMode()) {
      return this.cart.items().map((i) => ({
        name: i.name,
        qty: i.quantity,
        amount: i.price * i.quantity,
        imageUrl: i.imageUrl
      }));
    }
    const o = this.order();
    if (!o) return [];
    return o.items.map((i) => ({
      name: i.productName,
      qty: i.quantity,
      amount: i.unitPrice * i.quantity,
      imageUrl: i.imageUrl
    }));
  });

  readonly subtotalAmount = computed<number>(() =>
    this.cartMode() ? this.cart.subtotal() : (this.order()?.totalAmount ?? 0)
  );

  readonly total = computed<number>(() => Math.max(0, this.subtotalAmount() - this.discountAmount()));

  readonly selectedAddress = computed<Address | null>(
    () => this.addresses().find((a) => a.id === this.selectedAddressId()) ?? null
  );

  readonly cartEmpty = computed<boolean>(
    () => this.cartMode() && this.cart.items().length === 0
  );

  load(): void {
    this.addressesApi.list().subscribe({
      next: (addrs) => {
        this.addresses.set(addrs);
        const def = addrs.find((a) => a.isDefault) ?? addrs[0] ?? null;
        this.selectedAddressId.set(def ? def.id : null);
        this.showForm.set(addrs.length === 0);
        this.loadOrder();
      },
      error: () => {
        this.error.set('Failed to load addresses');
        this.loading.set(false);
      }
    });
  }

  loadOrder(): void {
    if (this.cartMode()) {
      this.cart.load();
      this.loading.set(false);
      return;
    }
    this.ordersApi.get(this.orderId()!).subscribe({
      next: (o) => {
        this.order.set(o);
        if (o.address) this.selectedAddressId.set(o.address.id);
        this.loading.set(false);
        if (o.status !== 'PENDING') {
          this.error.set('This order is not pending payment.');
        }
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Order not found');
        this.loading.set(false);
      }
    });
  }

  money(v: number): string {
    return rupees(v);
  }

  image(line: Line): string | null {
    return imageFor(line as never);
  }

  select(a: Address): void {
    this.selectedAddressId.set(a.id);
  }

  submitForm(): void {
    const f = this.form;
    if (!f.name() || !f.phone() || !f.line1() || !f.city() || !f.state() || !f.pincode()) {
      this.error.set('Please fill all the required fields');
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    this.addressesApi
      .create({
        name: f.name(),
        phone: f.phone(),
        addressLine1: f.line1(),
        addressLine2: f.line2() || undefined,
        city: f.city(),
        state: f.state(),
        pincode: f.pincode(),
        isDefault: f.isDefault()
      })
      .subscribe({
        next: (a) => {
          this.saving.set(false);
          this.addresses.set([...this.addresses(), a]);
          this.selectedAddressId.set(a.id);
          this.showForm.set(false);
          this.form.name.set('');
          this.form.phone.set('');
          this.form.line1.set('');
          this.form.line2.set('');
          this.form.city.set('');
          this.form.state.set('');
          this.form.pincode.set('');
          this.form.isDefault.set(false);
          this.toast.success('Address saved');
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set(err.error?.message ?? 'Failed to save address');
        }
      });
  }

  applyCoupon(): void {
    const code = this.couponCode().trim();
    if (!code) return;
    if (!this.cartMode()) {
      this.couponError.set('Coupons can only be applied before the order is placed');
      return;
    }
    this.couponApplying.set(true);
    this.couponError.set(null);
    this.couponMessage.set(null);
    this.couponsApi.validate({ code, orderTotal: this.subtotalAmount() }).subscribe({
      next: (resp) => {
        this.couponApplying.set(false);
        this.discountAmount.set(resp.discountAmount);
        this.couponMessage.set(`Coupon applied! You saved ${this.money(resp.discountAmount)}`);
      },
      error: (err) => {
        this.couponApplying.set(false);
        this.discountAmount.set(0);
        this.couponError.set(err.error?.message ?? 'Invalid coupon code');
      }
    });
  }

  removeCoupon(): void {
    this.couponCode.set('');
    this.discountAmount.set(0);
    this.couponMessage.set(null);
    this.couponError.set(null);
  }

  next(): void {
    if (!this.selectedAddressId()) {
      this.toast.info('Select a delivery address first');
      return;
    }
    this.error.set(null);
    this.step.set(2);
  }

  back(): void {
    this.step.set(1);
  }

  pay(): void {
    if (this.paying()) return;
    const addressId = this.selectedAddressId();
    if (!addressId) {
      this.toast.info('Select a delivery address first');
      return;
    }
    this.paying.set(true);
    this.error.set(null);

    const startPayment = (orderId: number) =>
      this.paymentsApi.razorpayOrder(orderId).subscribe({
        next: (resp) => this.openCheckout(orderId, resp),
        error: (err) => {
          this.paying.set(false);
          this.error.set(err.error?.message ?? 'Checkout failed');
        }
      });

    if (this.cartMode()) {
      const items = this.cart.items().map((i) => ({ productId: i.productId, quantity: i.quantity }));
      const couponCode = this.discountAmount() > 0 ? this.couponCode().trim() : undefined;
      this.ordersApi.create({ items, addressId, couponCode }).subscribe({
        next: (order) => {
          this.cart.clear();
          startPayment(order.id);
        },
        error: (err) => {
          this.paying.set(false);
          this.error.set(err.error?.message ?? 'Failed to place order');
        }
      });
      return;
    }

    const id = this.orderId()!;
    const o = this.order();
    const addressChanged = !o?.address || o.address.id !== addressId;
    const save = addressChanged
      ? this.ordersApi.updateAddress(id, addressId).pipe(map(() => true))
      : of(true);
    save.subscribe({
      next: () => startPayment(id),
      error: (err) => {
        this.paying.set(false);
        this.error.set(err.error?.message ?? 'Failed to update order');
      }
    });
  }

  private openCheckout(orderId: number, resp: RazorpayOrderResponse): void {
    this.loadRazorpayScript()
      .then(() => {
        const options: Record<string, unknown> = {
          key: resp.keyId,
          amount: resp.amountPaise,
          currency: resp.currency,
          name: 'QuickMart',
          description: 'Order #' + orderId,
          order_id: resp.razorpayOrderId,
          handler: (res: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
            this.paymentsApi
              .razorpayVerify({
                razorpayOrderId: res.razorpay_order_id,
                razorpayPaymentId: res.razorpay_payment_id,
                razorpaySignature: res.razorpay_signature
              })
              .subscribe({
                next: () => {
                  this.goToResult('success', orderId);
                },
                error: (err) => {
                  this.paying.set(false);
                  this.goToResult('failed', orderId, err.error?.message ?? 'Payment verification failed');
                }
              });
          },
          modal: {
            ondismiss: () => {
              this.paying.set(false);
              this.goToResult('cancelled', orderId);
            }
          }
        };
        new window.Razorpay!(options).open();
      })
      .catch((e: Error) => {
        this.paying.set(false);
        this.goToResult('failed', orderId, e.message);
      });
  }

  private goToResult(status: 'success' | 'failed' | 'cancelled', orderId: number, message?: string): void {
    this.router.navigate(['/payment/result'], {
      queryParams: { status, orderId, message: message ?? null }
    });
  }

  private loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay checkout'));
      document.body.appendChild(script);
    });
  }
}