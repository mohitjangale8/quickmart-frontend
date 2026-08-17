import { Component, effect, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  private readonly auth = inject(AuthService);
  private readonly cart = inject(CartService);
  private readonly router = inject(Router);
  private readonly theme = inject(ThemeService);

  readonly isLoggedIn = this.auth.isLoggedIn;
  readonly role = this.auth.role;
  readonly user = this.auth.user;
  readonly cartCount = this.cart.count;
  readonly isDark = this.theme.isDark;

  readonly term = signal('');
  readonly menuOpen = signal(false);

  readonly categories = ['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty', 'Books', 'Sports'];

  constructor() {
    effect(() => {
      if (this.auth.isLoggedIn() && this.auth.role() === 'BUYER') {
        this.cart.load();
      } else if (!this.auth.isLoggedIn()) {
        this.cart.reset();
      }
    });
  }

  search(): void {
    this.router.navigate(['/'], { queryParams: { q: this.term() || null, category: null } });
  }

  selectCategory(category: string): void {
    this.term.set('');
    this.menuOpen.set(false);
    this.router.navigate(['/'], { queryParams: { category } });
  }

  toggleMenu(): void {
    this.menuOpen.set(!this.menuOpen());
  }

  toggleTheme(): void {
    this.theme.toggle();
  }

  goSettings(): void {
    this.menuOpen.set(false);
    this.router.navigate(['/settings']);
  }

  logout(): void {
    this.menuOpen.set(false);
    this.auth.logout();
  }
}