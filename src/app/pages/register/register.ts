import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Role } from '../../models';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly name = signal('');
  readonly email = signal('');
  readonly password = signal('');
  readonly role = signal<Role>('BUYER');
  readonly error = signal<string | null>(null);
  readonly loading = signal(false);

  submit(): void {
    if (this.loading()) return;
    this.error.set(null);
    this.loading.set(true);
    this.auth
      .register({ name: this.name().trim(), email: this.email().trim(), password: this.password(), role: this.role() })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          const fallback = this.role() === 'SELLER' ? '/dashboard' : '/';
          this.router.navigate([fallback]);
        },
        error: (err) => this.error.set(err.error?.message ?? 'Registration failed')
      });
  }
}
