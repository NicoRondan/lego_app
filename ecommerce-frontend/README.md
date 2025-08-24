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

## Tema y paleta

Los colores del tema se extraen del logo y se armonizan con los tonos clásicos de Lego.
Para regenerar los tokens ejecutá:

```bash
node ../scripts/extract-palette.mjs
```

Esto generará `src/theme/tokens.json`. Podés editar este archivo para extender
los colores semánticos o ajustar valores específicos.
