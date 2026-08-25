# quickmart-frontend

QuickMart's storefront and seller portal - a single Angular application serving both the Buyer and Seller experiences (no separate apps, split by route/guard instead).

## Tech stack

- **Angular 20**, standard Angular CLI project structure and builder - not React, not Vite (an older version of this document hedged on this incorrectly).
- TypeScript, RxJS
- Plain component-scoped SCSS - no separate UI/CSS framework

## Structure

```
src/app/
 ├── pages/         # one folder per route - home, login, register, seller-login,
 │                  # dashboard, product-detail, product-form (seller CRUD), cart,
 │                  # checkout, payment-result, orders, tracking, wishlist,
 │                  # merchant, profile, settings
 ├── components/    # shared/reusable UI pieces used across pages
 ├── services/      # HTTP calls to the backend API + client-side state
 ├── guards/        # auth.guard.ts - route protection based on login state
 ├── interceptors/  # auth.interceptor.ts - attaches the JWT to outgoing requests
 ├── models.ts       # shared TypeScript interfaces/types
 ├── app.routes.ts   # route table
 └── app.config.ts   # application-level providers (HttpClient, router, etc.)
```

Buyer and Seller are both handled by this one app - `seller-login`/`merchant`/`product-form` are just routes gated by `auth.guard.ts`, not a separate deployable frontend.

## Delivery - no chart, no Kubernetes, on purpose

This app never runs inside Kubernetes and has no Helm chart or ArgoCD Application anywhere in `pinakaone-gitops` - it's a static build. The pipeline (`pinakaone-gitops`'s `vars/buildAndDeployFrontend.groovy`) builds it, syncs the output straight to an S3 bucket, and invalidates CloudFront - `quickmart.pinakaone.in` is served by CloudFront reading directly from that bucket. See the platform handbook for the full CloudFront + cross-account setup.

## Testing

Angular's CLI scaffolds one default test, `app.spec.ts` (checks the root component renders) - it's never been extended, and nothing else in the app has test coverage. `angular.json`/`package.json` are correctly wired for Karma/Jasmine (`npm test` would genuinely run), but no CI pipeline actually invokes it.

## Local development

```bash
npm ci
npm start        # ng serve - dev server with hot reload
```
There is no `npm run dev` script - this project uses the standard Angular CLI script names (`start`, `build`, `test`), not Vite's conventions.

## Build

```bash
npm run build     # ng build - outputs to dist/quickmart-frontend/browser
```
The pipeline syncs `dist/quickmart-frontend/browser` (not `dist/` directly - Angular 17+'s application builder nests the actual output one level deeper) to S3.

## License

Private repository - no license granted.
