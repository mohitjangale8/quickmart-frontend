import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly email = signal('');
  readonly password = signal('');
  readonly error = signal<string | null>(null);
  readonly loading = signal(false);

  submit(): void {
    if (this.loading()) return;
    this.error.set(null);
    this.loading.set(true);
    this.auth.login({ email: this.email().trim(), password: this.password() })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          const role = this.auth.role();
          const next = this.route.snapshot.queryParamMap.get('next');
          const fallback = role === 'SELLER' ? '/dashboard' : '/';
          this.router.navigate(next && next.startsWith('/') ? [next] : [fallback]);
        },
        error: (err) => this.error.set(err.error?.message ?? 'Login failed')
      });
  }
}
