import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../services/wishlist.service';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { rupees } from '../../utils';

@Component({
  selector: 'app-wishlist',
  imports: [RouterLink],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss'
})
export class Wishlist {
  private readonly wishlist = inject(WishlistService);
  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);

  readonly items = this.wishlist.items;

  money(v: number): string {
    return rupees(v);
  }

  initial(name: string, brand?: string): string {
    return (brand || name).charAt(0).toUpperCase();
  }

  remove(productId: number): void {
    this.wishlist.remove(productId);
    this.toast.info('Removed from wishlist');
  }

  addToCart(productId: number): void {
    this.cart.add(productId, 1);
    this.toast.success('Added to cart');
  }
}
