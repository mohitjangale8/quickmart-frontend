import { Product } from './models';

export function imageFor(p: Product): string | null {
  if (p.imageUrl && p.imageUrl.startsWith('http') && !p.imageUrl.includes('example.com')) {
    return p.imageUrl;
  }
  return null;
}

export function discountPercent(p: Product): number {
  const mrp = p.price * 1.25;
  return Math.round(((mrp - p.price) / mrp) * 100);
}

export function mrpOf(p: Product): number {
  return Math.round(p.price * 1.25);
}

export function rupees(value: number): string {
  return '₹' + value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
