# Lego Ecommerce Backend

Service de backend para una tienda B2C de Lego construido con Node.js, Express y GraphQL.

## Requisitos

- Node.js 18+
- npm

## Instalación

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Crear un archivo `.env` en la raíz del proyecto con las variables necesarias. Ejemplo:
   ```env
   PORT=3000
   BASE_URL=http://localhost:3000
   DB_URI=sqlite::memory:
   JWT_SECRET=cambia_este_secreto
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   FACEBOOK_APP_ID=
   FACEBOOK_APP_SECRET=
   MP_ACCESS_TOKEN=
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   ```
3. Aplicar la migración SQL inicial antes de iniciar el servidor. Ejemplo con SQLite:
   ```bash
   sqlite3 <ruta_de_la_base_de_datos> < src/infra/migrations/001_init.sql
   ```
4. (Opcional) Poblar la base de datos con datos de ejemplo:
   ```bash
   npm run seed
   ```

## Ejecución

- Modo desarrollo con recarga automática:
  ```bash
  npm run dev
  ```
- Modo producción:
  ```bash
  npm start
  ```

## GraphQL

- Implementado con [Apollo Server 5](https://www.apollographql.com/docs/apollo-server/).
- Endpoint principal: `/graphql`.
- Mutaciones disponibles:
  - `addToCart`
  - `updateCartItem`
  - `createOrder`
  - `createMpPreference`

## REST API

Endpoints disponibles:

- `GET /products`
- `POST /cart/items`
- `PATCH /cart/items/:id`
- `POST /orders`
- `POST /payments/mp/preference`
- `POST /webhooks/mp`

### Autenticación OAuth

- `GET /auth/login/:provider` inicia el flujo Authorization Code + PKCE para `google` o `facebook`.
- `GET /auth/callback/:provider` procesa el código de autorización, crea el usuario y devuelve:
  - JWT de corta duración (15min).
  - `refreshToken` para solicitar nuevos JWT vía `POST /auth/refresh`.

### Idempotencia

Los endpoints `POST /orders` y `POST /webhooks/mp` aceptan el header `Idempotency-Key` para evitar
peticiones duplicadas. Se almacena una clave de deduplicación en la tabla `idempotency_keys`.

### Seguridad HTTP

Se usa `helmet` con políticas CSP, HSTS, `noSniff`, `frameguard`, `Referrer-Policy` y CORP/COEP.
Ejemplo de CSP compatible con Bootstrap/CDN:

```js
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", 'https://cdn.jsdelivr.net', 'https://stackpath.bootstrapcdn.com'],
    styleSrc: ["'self'", 'https://cdn.jsdelivr.net', 'https://stackpath.bootstrapcdn.com', "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https://cdn.jsdelivr.net'],
  },
}
```

Para detalles de parámetros y respuestas consulta `src/app/openapi.yaml`.

## Pruebas

- Ejecutar todos los tests:
  ```bash
  npm test
  ```
- Pruebas de integración GraphQL (`test/graphqlIntegration.test.js`):
  ```bash
  npm test test/graphqlIntegration.test.js
  ```

## Estructura del proyecto

```
src/
  app/        Configuración y arranque del servidor
  config/     Configuración de entorno y base de datos
  graphql/    Definiciones del esquema y resolvers GraphQL
  infra/      Servicios externos, modelos y seeds
  modules/    Lógica de negocio organizada por módulos
  shared/     Utilidades compartidas
```
