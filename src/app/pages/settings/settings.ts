import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { ToastService } from '../../services/toast.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-settings',
  imports: [FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class Settings {
  private readonly auth = inject(AuthService);
  private readonly theme = inject(ThemeService);
  private readonly toast = inject(ToastService);
  private readonly cart = inject(CartService);

  readonly user = this.auth.user;
  readonly isLoggedIn = this.auth.isLoggedIn;
  readonly isDark = this.theme.isDark;

  readonly name = signal('');
  readonly saving = signal(false);

  readonly currentPassword = signal('');
  readonly newPassword = signal('');
  readonly confirmPassword = signal('');
  readonly changing = signal(false);

  constructor() {
    const u = this.auth.user();
    if (u) this.name.set(u.name);
  }

  initial(): string {
    return (this.user()?.name || '?').charAt(0).toUpperCase();
  }

  saveName(): void {
    if (this.saving()) return;
    if (!this.name().trim()) {
      this.toast.error('Name cannot be empty');
      return;
    }
    this.saving.set(true);
    this.auth
      .updateProfile(this.name().trim())
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => this.toast.success('Profile updated'),
        error: (err) => this.toast.error(err.error?.message ?? 'Failed to update profile')
      });
  }

  changePassword(): void {
    if (this.changing()) return;
    if (!this.currentPassword()) {
      this.toast.error('Enter your current password');
      return;
    }
    if (this.newPassword().length < 6 || !/[A-Z]/.test(this.newPassword())) {
      this.toast.error('New password must be at least 6 chars with one uppercase letter');
      return;
    }
    if (this.newPassword() !== this.confirmPassword()) {
      this.toast.error('New passwords do not match');
      return;
    }
    this.changing.set(true);
    this.auth
      .changePassword(this.currentPassword(), this.newPassword())
      .pipe(finalize(() => this.changing.set(false)))
      .subscribe({
        next: () => {
          this.toast.success('Password changed successfully');
          this.currentPassword.set('');
          this.newPassword.set('');
          this.confirmPassword.set('');
        },
        error: (err) => this.toast.error(err.error?.message ?? 'Failed to change password')
      });
  }

  toggleTheme(): void {
    this.theme.toggle();
    this.toast.info(this.theme.isDark() ? 'Dark mode enabled' : 'Light mode enabled');
  }

  signOut(): void {
    this.cart.reset();
    this.auth.logout();
  }
}