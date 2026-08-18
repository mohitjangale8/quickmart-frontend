import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../models';
import { discountPercent, imageFor, mrpOf, rupees } from '../../utils';

@Component({
  selector: 'app-product-quick-view',
  imports: [RouterLink],
  templateUrl: './product-quick-view.html',
  styleUrl: './product-quick-view.scss'
})
export class ProductQuickView {
  @Input({ required: true }) product!: Product;
  @Input() isBuyer = false;
  @Input() inWishlist = false;

  @Output() closed = new EventEmitter<void>();
  @Output() addToCart = new EventEmitter<Product>();
  @Output() wishlistToggled = new EventEmitter<Product>();

  image(): string | null {
    return imageFor(this.product);
  }

  mrp(): number {
    return mrpOf(this.product);
  }

  off(): number {
    return discountPercent(this.product);
  }

  money(v: number): string {
    return rupees(v);
  }

  close(): void {
    this.closed.emit();
  }

  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close();
  }

  add(): void {
    this.addToCart.emit(this.product);
  }

  toggleWishlist(): void {
    this.wishlistToggled.emit(this.product);
  }
}
