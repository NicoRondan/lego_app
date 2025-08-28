# Lego Ecommerce Frontend

Aplicación web en React para la tienda B2C de Lego.

Incluye rutas protegidas (Checkout, Orders, Admin), wishlist, reseñas y un formulario de checkout con validación usando React Hook Form y Zod. El consumo de API se centraliza y muestra errores mediante toasts.

## Requisitos

- Node.js 18+
- npm

## Instalación

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Configurar variables de entorno en un archivo `.env` (opcional):
   ```env
   REACT_APP_API_URL=http://localhost:3000
   ```
   El proyecto incluye un `proxy` en `package.json` apuntando a `http://localhost:3000` para redirigir automáticamente las solicitudes durante el desarrollo.

## Ejecución

- Servidor de desarrollo:
  ```bash
  npm start
  ```
- Compilación para producción:
  ```bash
  npm run build
  ```

## Lighthouse CI

Ejecutar auditorías de rendimiento en la carpeta `build` con el presupuesto definido en `.lighthouserc.json`:

```bash
npm run build
npm run lhci
```

## Depuración de llamadas a la API

El cliente de API (`src/services/api.js`) registra en la consola la URL base y cada solicitud/respuesta, lo que facilita verificar que las peticiones lleguen al backend.

## Pruebas

Ejecutar los tests de la aplicación:
```bash
npm test
```

## Estructura del proyecto

```
public/                 Archivos estáticos y plantilla HTML
src/
  components/           Componentes reutilizables
  contexts/             Contextos de React
  pages/                Páginas principales de la aplicación
  services/             Clientes y utilidades para APIs
  App.js                Componente raíz
  index.js              Punto de entrada
```

## Panel de administración

Los usuarios con rol `admin` cuentan con un tablero accesible desde `/admin`.
La página **Agregar producto** (`/admin/products/new`) está construida con React
Hook Form y Zod e incluye:

- Pestañas de Bootstrap 5 para organizar la información en secciones: Básicos,
  Construcción, Precio, Estado & Stock, Medios y SEO.
- Sugerencia automática del *slug* combinando el número de set y el nombre
  (`slugify`).
- Validaciones y tooltips que describen cada campo, con marcadores de
  obligatoriedad.
- Gestión de galería de imágenes con arrastrar y soltar, soporte para URLs y
  archivos locales, posibilidad de elegir imagen principal, texto alternativo y
  ordenamiento.
- Botones para **Guardar borrador**, **Publicar** y **Cancelar**. Al publicar se
  muestra un toast "Producto creado" y se redirige a `/admin/products/:id` (o a
  `/products/:slug`).

## Tema y paleta

Los colores del tema se extraen del logo y se armonizan con los tonos clásicos de Lego.
Para regenerar los tokens ejecutá:

```bash
node ../scripts/extract-palette.mjs
```

Esto generará `src/theme/tokens.json`. Podés editar este archivo para extender
los colores semánticos o ajustar valores específicos.
## Admin

- Página de cupones: `/admin/coupons` para crear, editar y filtrar cupones (requiere usuario con rol `admin`).

### Reportes

- Página: `/admin/reports` (solo `admin`).
- Tabs: Ventas, Por tema, Top sets, Bajo stock.
- Filtros:
  - Rango de fechas (`Desde/Hasta`) con presets: Últimos 7 días, Últimos 30 días, Este mes, Mes anterior.
  - Estados por defecto: `pending, picking, paid, shipped, delivered` (multi toggle).
  - Agrupar por: día, semana (lunes), mes.
- KPIs con tooltips: Pedidos, Net, AOV (Net/Órdenes), % OFF prom. (Descuento/Gross).
- Tablas con paginación en cliente (10/20/50 por página) y exportación CSV.

## Carrito y cupones

- En Checkout se puede aplicar/quitar un cupón y ver el descuento reflejado en el total.
