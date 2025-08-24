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
3. (Opcional) Poblar la base de datos con datos de ejemplo:
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

## Pruebas

Ejecutar los tests unitarios:
```bash
npm test
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
