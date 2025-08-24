# Lego Ecommerce Monorepo

Repositorio que agrupa el backend y frontend de una tienda B2C de Lego.

Incluye autenticación OAuth (Google/Facebook) con PKCE, idempotencia para creación de
órdenes y webhooks, y configuración de seguridad HTTP con Helmet.

## Requisitos

- Node.js 18+
- npm

## Estructura del repositorio

```
├── ecommerce-backend/   # API en Node.js, Express y GraphQL
├── ecommerce-frontend/  # Aplicación web en React
├── cypress/             # Pruebas end-to-end con Cypress
└── cypress.config.js    # Configuración de Cypress
```

## Configuración

1. Clonar este repositorio.
2. Instalar dependencias en cada paquete:
   ```bash
   cd ecommerce-backend && npm install
   cd ../ecommerce-frontend && npm install
   ```

## Ejecución

- **Backend**
  ```bash
  cd ecommerce-backend
  npm run dev    # modo desarrollo
  npm start      # modo producción
  ```
- **Frontend**
  ```bash
  cd ecommerce-frontend
  npm start      # servidor de desarrollo
  npm run build  # compilación para producción
  ```

## Pruebas

- **Backend**: `cd ecommerce-backend && npm test`
- **Frontend**: `cd ecommerce-frontend && npm test`
- **End-to-end**: con el backend y frontend ejecutándose, correr `npx cypress run`

Para más detalles de variables de entorno y estructuras internas, revisar los README de cada paquete.
