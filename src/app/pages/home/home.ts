import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  inject,
  signal
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { WishlistService } from '../../services/wishlist.service';
import { ProductQuickView } from '../../components/product-quick-view/product-quick-view';
import { Product } from '../../models';
import { discountPercent, imageFor, mrpOf, rupees } from '../../utils';

const PAGE_SIZE = 16;

@Component({
  selector: 'app-home',
  imports: [RouterLink, ProductQuickView],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements AfterViewInit, OnDestroy {
  private readonly productsApi = inject(ProductService);
  private readonly cart = inject(CartService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly wishlist = inject(WishlistService);
  private readonly route = inject(ActivatedRoute);

  @ViewChild('sentinel') sentinel?: ElementRef<HTMLDivElement>;
  private observer?: IntersectionObserver;

  readonly products = signal<Product[]>([]);
  readonly loading = signal(false);
  readonly loadingMore = signal(false);
  readonly error = signal<string | null>(null);
  readonly hasMore = signal(true);
  private page = 0;

  readonly searchTerm = signal('');
  readonly category = signal<string | null>(null);
  readonly brand = signal<string | null>(null);
  readonly categories = signal(['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty', 'Books', 'Sports']);
  readonly brands = signal<string[]>([]);

  readonly quickViewProduct = signal<Product | null>(null);

  readonly isBuyer = computed(() => this.auth.role() === 'BUYER');
  readonly isSeller = computed(() => this.auth.role() === 'SELLER');
  readonly user = this.auth.user;
  readonly cartCount = this.cart.count;

  constructor() {
    if (this.auth.isLoggedIn() && this.auth.role() === 'SELLER') {
      this.router.navigate(['/dashboard']);
    }
    this.productsApi.brands().subscribe({
      next: (brands) => this.brands.set(brands),
      error: () => undefined
    });
    this.route.queryParamMap.subscribe((params) => {
      this.searchTerm.set(params.get('q') ?? '');
      this.category.set(params.get('category'));
      this.brand.set(params.get('brand'));
      this.load(true);
    });
  }

  ngAfterViewInit(): void {
    if (!this.sentinel) return;
    this.observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && this.hasMore() && !this.loading() && !this.loadingMore()) {
        this.load(false);
      }
    });
    this.observer.observe(this.sentinel.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  load(reset: boolean): void {
    if (reset) {
      this.page = 0;
      this.products.set([]);
      this.hasMore.set(true);
      this.loading.set(true);
    } else {
      this.loadingMore.set(true);
    }
    this.error.set(null);
    this.productsApi
      .list({
        q: this.searchTerm() || undefined,
        category: this.category() ?? undefined,
        brand: this.brand() ?? undefined,
        page: this.page,
        size: PAGE_SIZE
      })
      .subscribe({
        next: (result) => {
          this.products.set(reset ? result.content : [...this.products(), ...result.content]);
          this.hasMore.set(!result.last);
          this.page += 1;
          this.loading.set(false);
          this.loadingMore.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.message ?? 'Failed to load products');
          this.loading.set(false);
          this.loadingMore.set(false);
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
    if (p.stockQty <= 0) return;
    this.cart.add(p.id, 1);
    this.toast.success(`${p.name} added to cart`);
    this.router.navigate(['/checkout']);
  }

  owned(p: Product): boolean {
    return this.auth.user()?.userId === p.sellerId;
  }

  inWishlist(p: Product): boolean {
    return this.wishlist.has(p.id);
  }

  toggleWishlist(p: Product, event?: Event): void {
    event?.stopPropagation();
    this.wishlist.toggle(p);
    this.toast.info(this.wishlist.has(p.id) ? 'Added to wishlist' : 'Removed from wishlist');
  }

  openQuickView(p: Product, event: Event): void {
    event.stopPropagation();
    this.quickViewProduct.set(p);
  }

  closeQuickView(): void {
    this.quickViewProduct.set(null);
  }

  quickViewAddToCart(p: Product): void {
    this.addToCart(p);
    this.closeQuickView();
  }

  goCategory(category: string | null): void {
    this.router.navigate(['/'], { queryParams: { category, brand: this.brand() } });
  }

  goBrand(brand: string | null): void {
    this.router.navigate(['/'], { queryParams: { category: this.category(), brand } });
  }
}
