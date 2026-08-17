import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-product-form',
  imports: [FormsModule, RouterLink],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss'
})
export class ProductForm {
  private readonly productsApi = inject(ProductService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly editId = signal<number | null>(null);
  readonly name = signal('');
  readonly brand = signal('');
  readonly description = signal('');
  readonly price = signal<number>(0);
  readonly stockQty = signal<number>(0);
  readonly category = signal('');
  readonly imageUrl = signal('');
  readonly error = signal<string | null>(null);
  readonly loading = signal(false);
  readonly uploading = signal(false);
  readonly previewUrl = signal<string | null>(null);

  readonly categories = ['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty', 'Books', 'Sports'];

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(Number(id));
      this.productsApi.get(Number(id)).subscribe({
        next: (p) => {
          if (p.sellerId !== this.auth.user()?.userId) {
            this.error.set('You can only edit your own products');
            this.router.navigate(['/']);
            return;
          }
          this.name.set(p.name);
          this.brand.set(p.brand ?? '');
          this.description.set(p.description ?? '');
          this.price.set(p.price);
          this.stockQty.set(p.stockQty);
          this.category.set(p.category ?? '');
          this.imageUrl.set(p.imageUrl ?? '');
        },
        error: (err) => this.error.set(err.error?.message ?? 'Failed to load product')
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.error.set(null);
    this.uploading.set(true);
    this.previewUrl.set(URL.createObjectURL(file));
    this.productsApi.uploadImage(file).subscribe({
      next: (res) => {
        this.uploading.set(false);
        this.imageUrl.set(res.imageUrl);
      },
      error: (err) => {
        this.uploading.set(false);
        this.previewUrl.set(null);
        this.error.set(err.error?.message ?? 'Upload failed');
      }
    });
  }

  submit(): void {
    this.error.set(null);
    this.loading.set(true);
    const payload = {
      name: this.name(),
      brand: this.brand(),
      description: this.description(),
      price: this.price(),
      stockQty: this.stockQty(),
      category: this.category(),
      imageUrl: this.imageUrl()
    };
    const request = this.editId()
      ? this.productsApi.update(this.editId()!, payload)
      : this.productsApi.create(payload);
    request.subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Save failed');
      }
    });
  }
}
