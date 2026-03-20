# PW2 — Práctica 2: Frontend en Svelte 5

Frontend SPA desarrollado con **Vite + Svelte 5** que consume la API REST del backend Node.js con autenticación JWT. Implementa gestión completa de productos y usuarios con las runes de Svelte 5.

---

## Requisitos previos

- Node.js 18+
- MongoDB corriendo localmente (`mongodb://localhost:27017`)
- Redis corriendo localmente (`redis://localhost:6379`)

En macOS con Homebrew:

```bash
brew services start mongodb-community
brew services start redis
```

---

## Instalación y ejecución

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
node seed.js      # crea usuarios iniciales en la base de datos
npm run dev       # arranca en http://localhost:3000
```

### 2. Frontend

```bash
cd pw2-frontend
npm install
npm run dev       # arranca en http://localhost:5173
```

El frontend usa un proxy de Vite que redirige `/api/*` → `http://localhost:3000/api/*`, por lo que no hay problemas de CORS en desarrollo.

### Build de producción

```bash
npm run build
npm run preview
```

---

## Credenciales de prueba

El seed crea dos usuarios por defecto:

| Usuario | Contraseña | Rol   |
|---------|-----------|-------|
| celia1   | 1234  | admin |
| celia2   | 1234   | user  |

Para crear usuarios adicionales se puede usar el formulario de registro en la pantalla de login (el rol por defecto será `user`). O bien crearlos como adminstrador.

---

## Estructura del proyecto

```
pw2-frontend/
├── index.html
├── vite.config.js          # proxy /api → backend
├── svelte.config.js
├── package.json
├── package-lock.json
└── src/
    ├── main.js             # punto de entrada
    ├── App.svelte          # router SPA principal
    ├── stores/
    │   ├── auth.svelte.js  # estado global de autenticación
    │   └── toasts.svelte.js # notificaciones globales
    ├── services/
    │   └── api.js          # llamadas fetch al back
    ├── components/
    │   ├── Navbar.svelte
    │   ├── ProductCard.svelte
    │   ├── ProductForm.svelte
    │   ├── ProductDetail.svelte
    │   ├── UserRow.svelte
    │   └── ToastContainer.svelte
    └── pages/
        ├── LoginPage.svelte
        ├── ProductosPage.svelte
        ├── PerfilPage.svelte
        └── AdminPage.svelte
```

---

## Runes de Svelte 5 utilizadas

### `$state()` — Estado reactivo principal

| Archivo | Variables con `$state()` |
|---|---|
| `stores/auth.svelte.js` | `token`, `user` — inicializados desde `localStorage` para persistir la sesión entre recargas |
| `stores/toasts.svelte.js` | `toasts` — lista de notificaciones activas |
| `pages/ProductosPage.svelte` | `products`, `loading`, `searchQuery`, `minPrice`, `maxPrice`, `formOpen`, `editingProduct`, `detailProduct`, `formLoading`, `confirmDelete` |
| `pages/AdminPage.svelte` | `users`, `loading`, `newUsername`, `newPassword`, `newRole`, `createLoading`, `confirmDelete` |
| `pages/LoginPage.svelte` | `username`, `password`, `loading`, `errors`, `mode` |
| `pages/PerfilPage.svelte` | `editing`, `newUsername`, `newPassword`, `loading`, `errors` |
| `App.svelte` | `currentPage` — página activa del router SPA |

### `$derived()` — Valores calculados reactivos

| Archivo | Derivados |
|---|---|
| `stores/auth.svelte.js` | `isAuthenticated` (booleano), `isAdmin` (rol admin), `displayName` (username del usuario) |
| `pages/ProductosPage.svelte` | `filteredProducts` — productos filtrados por nombre y rango de precio sin recargar del servidor; `productCount` — contador actualizado; `hasFilters` — si hay filtros activos |
| `pages/AdminPage.svelte` | `adminCount`, `userCount` — contadores por rol |
| `pages/PerfilPage.svelte` | `initials` — iniciales del avatar, `roleLabel` — texto del rol |

### `$effect()` — Efectos secundarios y sincronización

| Archivo | Efecto |
|---|---|
| `App.svelte` | Redirige a login automáticamente si `auth.isAuthenticated` pasa a `false` (por ejemplo al borrar el token); redirige a productos si un no-admin intenta acceder al panel admin |
| `pages/ProductosPage.svelte` | Carga los productos del backend cuando el componente se monta (reacciona al token de `auth`) |
| `pages/AdminPage.svelte` | Carga la lista de usuarios cuando el componente se monta si el usuario tiene rol admin |

### `$props()` — Props y callbacks entre componentes

| Componente | Props recibidas | Callbacks |
|---|---|---|
| `Navbar.svelte` | `currentPage`, `onNavigate` | `onNavigate(page)` — navega a una pantalla |
| `ProductCard.svelte` | `product`, `isAdmin` | `onView(p)`, `onEdit(p)`, `onDelete(p)` |
| `ProductForm.svelte` | `product` (null = nuevo), `loading` | `onSave({nombre, precio, imagen})`, `onCancel()` |
| `ProductDetail.svelte` | `product` | `onClose()` |
| `UserRow.svelte` | `user`, `currentUserId` | `onChangeRole(u)`, `onDelete(u)` |

---

## Endpoints del backend utilizados

### Autenticación

| Método | Endpoint | Descripción | Auth requerida |
|---|---|---|---|
| POST | `/api/login` | Login con `username` y `password`, devuelve `{ token }` | No |
| POST | `/api/register` | Registro de nuevo usuario (rol `user` por defecto) | No |

### Productos

| Método | Endpoint | Descripción | Auth requerida |
|---|---|---|---|
| GET | `/api/productos` | Listar todos los productos. Acepta `?name=` para filtrar | No |
| POST | `/api/productos` | Crear producto (`multipart/form-data`: `nombre`, `precio`, `imagen`) | JWT + rol admin |
| PUT | `/api/productos/:id` | Editar producto (`nombre`, `precio`) | JWT + rol admin |
| DELETE | `/api/productos/:id` | Eliminar producto | JWT + rol admin |

**Nota:** El modelo `Producto` del backend no incluye campo `activo`, por lo que el requisito de mostrar estado activo/inactivo no está disponible en este backend.

### Usuarios

| Método | Endpoint | Descripción | Auth requerida |
|---|---|---|---|
| GET | `/api/users` | Listar todos los usuarios | JWT |
| POST | `/api/users` | Crear usuario con rol | JWT + admin |
| PUT | `/api/users/:id` | Editar usuario (`username`, `password`, `role`) | JWT |
| DELETE | `/api/users/:id` | Eliminar usuario | JWT |

---

## Funcionalidades implementadas


- Proyecto Vite + Svelte 5 con organización en carpetas `components`, `pages`, `services`, `stores`
- Pantalla de login con usuario y contraseña; pantalla de registro integrada
- Envío de credenciales al backend con gestión de errores (credenciales incorrectas, error de servidor)
- Token JWT almacenado en `localStorage` con restauración automática al recargar
- Rutas privadas protegidas: sin token activo solo se muestra la pantalla de login
- Listado de productos con nombre y precio
- Detalle de producto en modal al hacer clic en la tarjeta
- Formulario de creación de producto con subida de imagen
- Edición y borrado de productos (solo visible y funcional para rol admin)
- Navegación SPA con 4 pantallas: Login, Productos, Perfil, Admin
- Pantalla activa resaltada en la barra de navegación
- Layout con estilos, tipografía y diseño cohesivo
- Diseño responsive que no se rompe en móvil

### Runes de Svelte 5 

- `$state()` para todo el estado principal de la aplicación
- `$derived()` para filtros de productos, contadores y valores calculados
- `$effect()` para redirecciones automáticas y carga de datos al montar
- `$props()` y callbacks en todos los componentes reutilizables

### Funcionalidades avanzadas 

- Panel de administración solo accesible a rol `admin`
- Gestión completa de usuarios: listado, cambio de rol, creación y eliminación
- Acciones de producto (editar/borrar) ocultas para usuarios sin rol admin
- Persistencia de sesión en `localStorage`; al recargar la página se restaura el estado
- Cerrar sesión limpia el estado y el almacenamiento
- Búsqueda de productos por nombre en tiempo real
- Filtros combinados por nombre y rango de precio usando `$derived()`
- Validaciones en frontend con mensajes de error por campo
- Mensajes de éxito y error mediante toasts globales
- Botones deshabilitados con spinner durante operaciones asíncronas
- Skeleton loaders animados mientras se cargan los productos
- Manejo de errores HTTP 401, 403 y 500 con toast descriptivo
- Diálogo de confirmación antes de borrar productos y usuarios