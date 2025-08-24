# OWASP ASVS Level 2 Checklist

- [x] **Input Validation** – User input is validated on controllers and ORM layer to prevent injection.
- [x] **Rate Limiting** – Custom rate limiting per IP is enforced on `/auth/*` and `/webhooks/*` routes.
- [x] **Logs without PII** – Structured logs use request IDs and avoid storing personally identifiable information.
- [x] **CSRF Protection** – Mutations require a CSRF token matched against an HttpOnly, `SameSite=Lax`, `Secure` cookie.
- [x] **Security Headers** – Helmet configures HSTS, frameguard, and other standard security headers.
