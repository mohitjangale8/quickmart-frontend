import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { ToastService } from '../../services/toast.service';
import { Product } from '../../models';
import { discountPercent, imageFor, mrpOf, rupees } from '../../utils';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  private readonly productsApi = inject(ProductService);
  private readonly cart = inject(CartService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly orderApi = inject(OrderService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly searchTerm = signal('');
  readonly category = signal<string | null>(null);
  readonly categories = signal(['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty', 'Books', 'Sports']);

  readonly isBuyer = computed(() => this.auth.role() === 'BUYER');
  readonly isSeller = computed(() => this.auth.role() === 'SELLER');
  readonly user = this.auth.user;
  readonly cartCount = this.cart.count;

  constructor() {
    if (this.auth.isLoggedIn() && this.auth.role() === 'SELLER') {
      this.router.navigate(['/dashboard']);
    }
    this.route.queryParamMap.subscribe((params) => {
      this.searchTerm.set(params.get('q') ?? '');
      this.category.set(params.get('category'));
      this.load();
    });
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.productsApi
      .list({ q: this.searchTerm() || undefined, category: this.category() ?? undefined, size: 60 })
      .subscribe({
        next: (page) => {
          this.products.set(page.content);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.message ?? 'Failed to load products');
          this.loading.set(false);
        }
      });
  }

  image(p: Product): string | null {
    return imageFor(p);
  }

  mrp(p: Product): number {
    return mrpOf(p);
  }

  off(p: Product): number {
    return discountPercent(p);
  }

  money(v: number): string {
    return rupees(v);
  }

  addToCart(p: Product): void {
    if (!this.isBuyer()) {
      this.router.navigate(['/login'], { queryParams: { next: '/' } });
      return;
    }
    if (p.stockQty <= 0) return;
    this.cart.add(p.id, 1);
    this.toast.success(`${p.name} added to cart`);
  }

  buyNow(p: Product): void {
    if (!this.isBuyer()) {
      this.router.navigate(['/login'], { queryParams: { next: '/' } });
      return;
    }
    this.orderApi.create({ items: [{ productId: p.id, quantity: 1 }] }).subscribe({
      next: (order) => this.router.navigate(['/payment', order.id]),
      error: (err) => this.toast.error(err.error?.message ?? 'Failed to place order')
    });
  }

  owned(p: Product): boolean {
    return this.auth.user()?.userId === p.sellerId;
  }

  goCategory(category: string | null): void {
    this.router.navigate(['/'], { queryParams: { category } });
  }
}