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
   DEFAULT_CURRENCY=USD
   ASSET_BASE_URL=http://localhost:3000/assets
   NEWNESS_WINDOW_DAYS=30
   DEFAULT_TAX_CLASS=standard
   ```
   Variables principales:
   - `DEFAULT_CURRENCY`: moneda por defecto para nuevos precios.
   - `ASSET_BASE_URL`: URL base para medios e imágenes de productos.
   - `NEWNESS_WINDOW_DAYS`: días que un producto se considera nuevo desde su `release_year`.
   - `DEFAULT_TAX_CLASS`: clase de impuesto aplicada por defecto a los productos.
3. Aplicar la migración SQL inicial antes de iniciar el servidor. Ejemplo con SQLite:
   ```bash
   sqlite3 <ruta_de_la_base_de_datos> < src/infra/migrations/001_init.sql
   ```
4. (Opcional) Poblar la base de datos con datos de ejemplo:
   ```bash
   npm run seed
   ```

## Esquema de base de datos

```mermaid
erDiagram
  users {
    int id PK
    string name
    string email
    string password_hash
    string role
  }
  social_identities {
    int id PK
    string provider
    string provider_id
    int user_id FK
  }
  refresh_tokens {
    string token PK
    int user_id FK
    datetime expires_at
    datetime revoked_at
  }
  idempotency_keys {
    string key PK
    string endpoint
    string ref_id
    int user_id FK
  }
  addresses {
    int id PK
    string street
    string city
    int user_id FK
  }
  wishlists {
    int id PK
    int user_id FK
  }
  wishlist_items {
    int id PK
    int wishlist_id FK
    int product_id FK
  }
  products {
    int id PK
    string code
    string slug
    string set_number
    string name
    text description
    decimal price
    string currency
    string image_url
    string instructions_url
    int piece_count
    int minifig_count
    int weight_grams
    int box_width_mm
    int box_height_mm
    int box_depth_mm
    int release_year
    int retired_year
    decimal msrp
    boolean is_new
    boolean is_on_sale
    string status
    int stock
    int max_qty_per_order
    boolean allow_coupon
  }
  categories {
    int id PK
    string name
  }
  product_categories {
    int id PK
    int product_id FK
    int category_id FK
  }
  carts {
    int id PK
    int user_id FK
    string coupon_code
    decimal discount_total
  }
  cart_items {
    int id PK
    int cart_id FK
    int product_id FK
    int quantity
    decimal unit_price
    decimal subtotal
    string display_name
    string thumbnail_url
  }
  orders {
    int id PK
    int user_id FK
    decimal subtotal
    decimal discount_total
    decimal shipping_total
    decimal tax_total
    decimal grand_total
    decimal total (alias)
    string status
    int coupon_id FK
    string coupon_code
  }
  order_items {
    int id PK
    int order_id FK
    int product_id FK
    int quantity
    decimal unit_price
    decimal subtotal
  }
  payments {
    int id PK
    int order_id FK
    string provider
    string status
    decimal amount
    string external_id
    json raw_payload
  }
  shipments {
    int id PK
    int order_id FK
    string carrier
    string tracking
    string status
  }
  coupons {
    int id PK
    string code
    string type (percent|fixed)
    decimal value
    datetime valid_from
    datetime valid_to
    decimal min_subtotal
    int max_uses
    int per_user_limit
    json allowed_themes
    json disallow_products
    string status (active|paused)
    boolean stackable
    int created_by FK(users)
  }
  coupon_usages {
    int id PK
    int coupon_id FK
    int user_id FK
    int order_id FK
    datetime used_at
  }
  reviews {
    int id PK
    int product_id FK
    int user_id FK
    smallint rating
    text comment
  }
  product_media {
    int id PK
    int product_id FK
    string url
    string type
    datetime created_at
  }
  product_price_history {
    int id PK
    int product_id FK
    decimal price
    datetime recorded_at
  }

  users ||--o{ addresses : tiene
  users ||--o{ refresh_tokens : tiene
  users ||--o{ social_identities : tiene
  users ||--o{ idempotency_keys : tiene
  users ||--o{ wishlists : tiene
  users ||--o{ carts : tiene
  users ||--o{ orders : tiene
  users ||--o{ reviews : tiene
  wishlists ||--o{ wishlist_items : tiene
  products ||--o{ wishlist_items : incluye
  products ||--o{ product_media : tiene
  products ||--o{ product_price_history : tiene
  products ||--o{ cart_items : tiene
  products ||--o{ order_items : tiene
  products }o--o{ categories : pertenece
  carts ||--o{ cart_items : tiene
  orders ||--o{ order_items : tiene
  orders ||--o| payments : tiene
  orders ||--o| shipments : tiene
  coupons ||--o{ orders : aplica
  coupons ||--o{ coupon_usages : registra
  products ||--o{ reviews : recibe
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

## Cupones y reglas de carrito

- Endpoints REST:
  - `POST /cart/apply-coupon` body: `{ code }` — valida reglas y aplica el descuento al carrito.
  - `DELETE /cart/coupon` — remueve el cupón aplicado.
  - `POST /orders` — persiste `couponCode` y `discountTotal` en la orden y registra `coupon_usages`.
- Endpoints Admin:
  - `GET /admin/coupons?q=&status=&page=` — listar cupones con filtros.
  - `POST /admin/coupons` — crear cupón.
  - `PUT /admin/coupons/:id` — actualizar cupón.
  - `GET /admin/coupons/:id/usages` — usos por cupón.
- Reglas de validación:
  - `status = active` y fecha actual dentro de `[validFrom, validTo]` (UTC).
  - `uses < maxUses` y `usesByUser < perUserLimit` (según `coupon_usages`).
  - `cart.subtotal >= minSubtotal`.
  - Ningún ítem en `disallowProducts` y todos con `allowCoupon=true`.
  - Si `allowedThemes` no está vacío ⇒ al menos un ítem con ese tema.
- Tipos y cálculo:
  - `fixed`: descuenta hasta el subtotal (nunca negativo).
  - `percent`: descuento proporcional, con redondeo financiero (banker's rounding).
- Errores estructurados:
  - `COUPON_INVALID`, `COUPON_EXPIRED`, `COUPON_LIMIT_REACHED`, `COUPON_NOT_APPLICABLE`, `COUPON_MIN_SUBTOTAL`.

Consulta `src/app/openapi.yaml` para el detalle de contratos OpenAPI actualizados.
  - `createOrder`
  - `createMpPreference`

## Inventario y anti-oversell

Se añadió un control de inventario con reservas y auditoría de movimientos para evitar sobreventa.

Modelos nuevos:
- `inventory` (1:1 con producto): `product_id PK/FK`, `stock`, `safety_stock`, `reserved`, `warehouse_location`, timestamps.
- `inventory_movements`: `id`, `product_id`, `type` (`adjust|reserve|release|sale|return`), `qty` (con signo), `reason`, `order_id?`, `user_id?`, `created_at`.

Reglas y hooks en órdenes:
- Al crear orden `pending`: se generan movimientos `reserve` y se incrementa `reserved` por ítem.
- Al pasar a `paid`: se crean `sale`, se descuenta `stock` (en `products` e `inventory`) y se reduce `reserved`.
- Cancelación desde `pending|picking`: `release` (baja `reserved`).
- Cancelación/refund tras `paid|shipped|delivered`: `return` (reposición de `stock`).

Carrito y oversell:
- Las operaciones de carrito validan `available = Product.stock - Inventory.reserved` además de `max_qty_per_order`.

Migraciones y seed:
- SQL: `src/infra/migrations/004_inventory.sql` crea `inventory` e `inventory_movements`.
- Seed: `src/infra/seeds/seed.js` inicializa `inventory` espejando `Product.stock`.

Endpoints Admin (RBAC `admin`):
- `GET /admin/inventory?lowStockOnly=&q=&page=&pageSize=`
- `PATCH /admin/inventory/:productId/adjust` body `{ qty, reason }` (qty ≠ 0; valida `stock+qty ≥ 0`).
- `PUT /admin/inventory/:productId/safety` body `{ safetyStock }`.
- `GET /admin/inventory/:productId/movements?limit=`.

Front-end Admin:
- Panel “Inventario” con buscador por set/nombre, filtro “Bajo stock”, acciones Ajustar (±), Editar mínimo y vista de movimientos.
- Badge “Bajo stock” cuando `stock - reserved <= safetyStock`.

Compatibilidad:
- `products.stock` se mantiene para compatibilidad; `inventory.stock` se mantiene sincronizado por hooks/servicio.

## REST API

Endpoints disponibles:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET    | `/products` | Lista productos con filtros y paginación |
| GET    | `/cart` | Obtiene el carrito del usuario autenticado |
| POST   | `/cart/items` | Agrega un producto al carrito |
| PATCH  | `/cart/items/:id` | Actualiza la cantidad de un ítem del carrito |
| DELETE | `/cart/items/:id` | Elimina un ítem del carrito |
| POST   | `/orders` | Crea una orden a partir del carrito |
| POST   | `/payments/mp/preference` | Genera una preferencia de pago en Mercado Pago |
| POST   | `/webhooks/mp` | Recibe notificaciones de Mercado Pago |

### Reportes (Admin)

Endpoints bajo `/admin/reports` protegidos con rol `admin`.

- `GET /admin/reports/sales/summary?from=&to=&groupBy=day|week|month&status=paid,shipped,delivered&format=csv`
  - Devuelve `buckets[]` con: `periodStart`, `orders`, `qty`, `gross`, `discount`, `net`, `avgOrderValue`.
  - `groupBy=week` agrupa por semana iniciando en lunes.
  - `from`/`to` aceptan `YYYY-MM-DD`. Si `format=csv` responde como `text/csv` para descarga.

- `GET /admin/reports/sales/by-theme?from=&to=&status=&format=csv`
  - Devuelve `rows[]` por tema (categoría): `theme`, `orders`, `qty`, `net`.
  - El neto se prorratea por línea en función del subtotal de cada pedido.

- `GET /admin/reports/sales/top-products?from=&to=&status=&limit=10&format=csv`
  - Devuelve `rows[]` con `productId`, `setNumber`, `name`, `qty`, `net`, ordenado por `qty desc`.

- `GET /admin/reports/stock/low?threshold=&format=csv`
  - Devuelve `rows[]` con `productId`, `name`, `stock`, `reserved`, `safetyStock` y filtra `stock - reserved <= safetyStock`.

Índices usados: `orders(status)`, `orders(created_at)`, `order_items(order_id)`. Para SQLite se utilizan expresiones `date()` con parámetros `YYYY-MM-DD` para asegurar comparaciones correctas.

Los campos monetarios como `subtotal` y `total` se devuelven como cadenas con dos decimales,
por ejemplo `"19.99"`.

### `GET /products`

Lista productos con paginación y filtros.

**Parámetros de consulta**

- `search`: texto a buscar en nombre o descripción.
- `theme`: filtra por nombre de categoría.
- `slug`, `setNumber`.
- `minPrice`, `maxPrice`.
- `minPieces`, `maxPieces`.
- `ageMin`, `ageMax`.
- `status`, `visibility`.
- `isOnSale`, `isNew` (booleanos).
- `page`, `limit` (paginación).
- `order`: `price_asc`, `price_desc`, `msrp_asc`, `msrp_desc`, `newest`, `oldest`, `name_asc`, `name_desc`, `pieces_asc`, `pieces_desc`.

**Respuesta**

```json
{
  "total": 0,
  "page": 1,
  "limit": 10,
  "items": [
    {
      "id": 1,
      "code": "",
      "slug": "",
      "setNumber": "",
      "name": "",
      "description": "",
      "msrp": 0,
      "salePrice": 0,
      "priceEffective": 0,
      "isOnSale": false,
      "isNew": false,
      "primaryImageUrl": ""
    }
  ],
  "facets": {
    "status": {},
    "visibility": {},
    "isOnSale": {},
    "isNew": {}
  }
}
```

### `GET /products/:idOrSlug`

Obtiene el detalle de un producto por ID numérico o `slug`.

**Respuesta**

```json
{
  "id": 1,
  "code": "",
  "slug": "",
  "setNumber": "",
  "name": "",
  "description": "",
  "msrp": 0,
  "salePrice": 0,
  "priceEffective": 0,
  "isOnSale": false,
  "isNew": false,
  "primaryImageUrl": "",
  "categories": [],
  "reviews": []
}
```

### `GET /cart`

Obtiene el carrito del usuario autenticado. Requiere JWT en la cabecera `Authorization`.

**Respuesta**

```json
{
  "id": 1,
  "items": [
    {
      "id": 10,
      "productId": 5,
      "quantity": 2,
      "unitPrice": "15.00",
      "subtotal": "30.00",
      "product": { "id": 5, "name": "Set Example", "price": "15.00" }
    }
  ],
  "total": "30.00"
}
```

### `POST /cart/items`

Agrega un producto al carrito. Si el producto ya existe, incrementa su cantidad.

**Body**

```json
{ "productId": 5, "quantity": 1 }
```

**Respuesta**

```json
{
  "id": 11,
  "productId": 5,
  "quantity": 1,
  "unitPrice": "15.00",
  "subtotal": "15.00"
}
```

### `PATCH /cart/items/:id`

Actualiza la cantidad de un ítem del carrito.

**Body**

```json
{ "quantity": 3 }
```

**Respuesta**

```json
{
  "id": 11,
  "productId": 5,
  "quantity": 3,
  "unitPrice": "15.00",
  "subtotal": "45.00"
}
```

### `DELETE /cart/items/:id`

Elimina un ítem del carrito y devuelve el carrito actualizado.

**Respuesta**

```json
{
  "id": 1,
  "items": [],
  "total": "0.00"
}
```

### `POST /orders`

Crea una orden basada en el carrito actual. Acepta un cupón opcional en el cuerpo.

**Body**

```json
{ "couponCode": "DESCUENTO10" }
```

**Respuesta**

```json
{ "id": 99, "status": "pending", "total": "45.00" }
```

### `POST /payments/mp/preference`

Genera una preferencia de pago de Mercado Pago para la orden indicada.

**Body**

```json
{ "orderId": 99 }
```

**Respuesta**

```json
{
  "preferenceId": "abc123",
  "initPoint": "https://www.mercadopago.com/init"
}
```

### `POST /webhooks/mp`

Endpoint para recibir notificaciones de Mercado Pago.

**Body**

```json
{ "paymentId": "123456789", "status": "approved" }
```

**Respuesta**

```json
{ "received": true }
```

### Autenticación OAuth

- `GET /auth/login/:provider` inicia el flujo Authorization Code + PKCE para `google` o `facebook`.
- `GET /auth/callback/:provider` procesa el código de autorización, crea el usuario y devuelve:
  - JWT de corta duración (15min).
  - `refreshToken` para solicitar nuevos JWT vía `POST /auth/refresh`.

### Idempotencia

Los endpoints `POST /orders` y `POST /webhooks/mp` aceptan el header `Idempotency-Key` para evitar
peticiones duplicadas. Se almacena una clave de deduplicación en la tabla `idempotency_keys`.

## Reglas de negocio

- **Ventanas de precio**: cada modificación de precio se registra en `product_price_history` con `recorded_at`, permitiendo analizar periodos de vigencia. El precio efectivo corresponde al último registro; si `salePrice` es menor a `msrp`, el producto está en oferta.
- **Límites de cantidad**: el campo `max_qty_per_order` en `products` establece cuántas unidades se pueden comprar por pedido. Las operaciones de carrito respetan este límite.

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
