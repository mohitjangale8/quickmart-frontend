import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { WishlistService } from '../../services/wishlist.service';
import { Breadcrumbs, Crumb } from '../../components/breadcrumbs/breadcrumbs';
import { Product, Review } from '../../models';
import { discountPercent, imageFor, mrpOf, rupees } from '../../utils';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, FormsModule, Breadcrumbs],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss'
})
export class ProductDetail {
  private readonly productsApi = inject(ProductService);
  private readonly cart = inject(CartService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly wishlist = inject(WishlistService);

  readonly product = signal<Product | null>(null);
  readonly qty = signal(1);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly reviews = signal<Review[]>([]);
  readonly reviewRating = signal(5);
  readonly reviewComment = signal('');
  readonly submittingReview = signal(false);

  readonly crumbs = computed<Crumb[]>(() => {
    const p = this.product();
    if (!p) return [];
    const list: Crumb[] = [];
    if (p.category) list.push({ label: p.category });
    list.push({ label: p.name });
    return list;
  });

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productsApi.get(id).subscribe({
      next: (p) => {
        this.product.set(p);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Product not found');
        this.loading.set(false);
      }
    });
    this.productsApi.reviews(id).subscribe({
      next: (reviews) => this.reviews.set(reviews),
      error: () => undefined
    });
  }

  inWishlist(): boolean {
    const p = this.product();
    return !!p && this.wishlist.has(p.id);
  }

  toggleWishlist(): void {
    const p = this.product();
    if (!p) return;
    this.wishlist.toggle(p);
    this.toast.info(this.wishlist.has(p.id) ? 'Added to wishlist' : 'Removed from wishlist');
  }

  submitReview(): void {
    const p = this.product();
    if (!p || this.submittingReview()) return;
    if (!this.isBuyer()) {
      this.router.navigate(['/login'], { queryParams: { next: `/product/${p.id}` } });
      return;
    }
    this.submittingReview.set(true);
    this.productsApi.addReview(p.id, { rating: this.reviewRating(), comment: this.reviewComment().trim() || undefined })
      .subscribe({
        next: (review) => {
          this.submittingReview.set(false);
          this.reviews.set([review, ...this.reviews().filter((r) => r.userId !== review.userId)]);
          this.reviewComment.set('');
          this.toast.success('Thanks for your review!');
          this.productsApi.get(p.id).subscribe((updated) => this.product.set(updated));
        },
        error: (err) => {
          this.submittingReview.set(false);
          this.toast.error(err.error?.message ?? 'Failed to submit review');
        }
      });
  }

  image(): string | null {
    const p = this.product();
    return p ? imageFor(p) : null;
  }

  mrp(): number {
    const p = this.product();
    return p ? mrpOf(p) : 0;
  }

  off(): number {
    const p = this.product();
    return p ? discountPercent(p) : 0;
  }

  money(v: number): string {
    return rupees(v);
  }

  isBuyer(): boolean {
    return this.auth.role() === 'BUYER';
  }

  isOwner(): boolean {
    const p = this.product();
    return !!p && p.sellerId === this.auth.user()?.userId;
  }

  sellerLabel(): string {
    const p = this.product();
    return p?.sellerId ? `Seller #${p.sellerId}` : 'QuickMart';
  }

  addToCart(): void {
    const p = this.product();
    if (!p) return;
    if (!this.isBuyer()) {
      this.router.navigate(['/login'], { queryParams: { next: `/product/${p.id}` } });
      return;
    }
    this.cart.add(p.id, this.qty());
    this.toast.success(`${p.name} added to cart`);
  }

  buyNow(): void {
    const p = this.product();
    if (!p) return;
    if (!this.isBuyer()) {
      this.router.navigate(['/login'], { queryParams: { next: `/product/${p.id}` } });
      return;
    }
    if (p.stockQty <= 0) return;
    this.cart.add(p.id, this.qty());
    this.toast.success(`${p.name} added to cart`);
    this.router.navigate(['/checkout']);
  }

  dec(): void {
    if (this.qty() > 1) this.qty.set(this.qty() - 1);
  }

  inc(): void {
    const p = this.product();
    if (p && this.qty() < p.stockQty) this.qty.set(this.qty() + 1);
  }
}