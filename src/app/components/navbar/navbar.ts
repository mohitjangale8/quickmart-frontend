import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  private readonly auth = inject(AuthService);

  readonly isLoggedIn = this.auth.isLoggedIn;
  readonly role = this.auth.role;
  readonly user = this.auth.user;

  logout(): void {
    this.auth.logout();
  }
}
