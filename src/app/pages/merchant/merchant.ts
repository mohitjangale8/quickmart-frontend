import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { Role } from '../../models';

@Component({
  selector: 'app-merchant',
  imports: [FormsModule, RouterLink],
  templateUrl: './merchant.html',
  styleUrl: './merchant.scss'
})
export class Merchant {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly name = signal('');
  readonly email = signal('');
  readonly password = signal('');
  readonly error = signal<string | null>(null);
  readonly loading = signal(false);

  submit(): void {
    if (this.loading()) return;
    this.error.set(null);
    this.loading.set(true);
    this.auth
      .registerSeller({ name: this.name().trim(), email: this.email().trim(), password: this.password(), role: 'BUYER' })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => this.error.set(err.error?.message ?? 'Registration failed')
      });
  }
}