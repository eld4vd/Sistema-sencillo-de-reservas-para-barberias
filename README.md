# 💈 Sistema de Reservas para Barberías

Sistema web completo de reservas para barberías/peluquerías con panel de administración moderno. Desarrollado con las últimas tecnologías y estándares de UX/UI 2025.

## ✨ Características Principales

### Para Clientes
- 📅 **Reserva de citas online** con calendario interactivo
- 👨‍💼 **Selección de peluquero** y servicios personalizados
- 📱 **Interfaz responsive** optimizada para móviles y tablets
- 🎨 **Diseño moderno** con animaciones fluidas y efectos visuales
- 📧 **Newsletter** integrado en el footer
- 💬 **WhatsApp directo** para consultas rápidas

### Para Administradores
- 📊 **Panel de administración** completo y optimizado
- 👥 **Gestión de peluqueros** con especialidades y horarios
- 💇‍♂️ **Gestión de servicios** con precios y duraciones
- 📅 **Gestión de citas** con múltiples estados (Pendiente, Confirmada, Completada, Cancelada)
- 🔔 **Sistema de notificaciones** en tiempo real con limpieza automática
- 🎯 **Interfaz CRUD modernizada** con búsqueda inline y contadores dinámicos
- ⚡ **Polling inteligente** solo en vista de reservas (45s)

### Seguridad
- 🔐 **Autenticación JWT** con refresh tokens automáticos
- 🍪 **Cookies HTTP-only** para almacenamiento seguro
- 🛡️ **CSRF protection** con doble validación (cookie + header)
- 🔄 **Auto-refresh silencioso** que no causa re-renders
- 🚫 **Rate limiting** en endpoints sensibles
- 🔒 **Guards** personalizados para protección de rutas


## 🛠️ Stack Tecnológico

### Frontend
- ⚛️ **React 19** con las últimas características
- 🔷 **TypeScript** para type safety completo
- ⚡ **Vite 7** como build tool (ESM nativo)
- 🎨 **TailwindCSS 4** con variables CSS nativas
- 🎭 **Framer Motion 12** para animaciones suaves
- 🛣️ **React Router 7** con data loading
- 🎯 **Context API** optimizado con useMemo
- 🎪 **React Icons 5** para iconografía consistente

### Backend
- 🟢 **NestJS 11** (framework Node.js escalable)
- 🔷 **TypeScript** completo con decorators
- 🗄️ **TypeORM 0.3** para ORM robusto
- 🔐 **Passport JWT** para autenticación
- 📝 **Class Validator** para validación de DTOs
- 🍪 **Cookie Parser** para manejo seguro de cookies
- 🛡️ **Helmet** para headers de seguridad
- 🚦 **Throttler** para rate limiting

### Base de Datos
- 🐘 **PostgreSQL 17 Alpine** (optimizada)
- 🔗 Relaciones bien definidas con TypeORM
- 📊 Índices optimizados para búsquedas rápidas
- 🔄 Migraciones automáticas con CLI

### DevOps
- 🐳 **Docker 24+** para contenedores
- 🎯 **Docker Compose** para orquestación
- 🔧 Multi-stage builds optimizados
- 🌐 **Nginx** para servir frontend (gzip, caché)
- 💚 Health checks automáticos para todos los servicios


## 🚀 Instalación Rápida

### Prerrequisitos

```bash
node >= 20.x
npm >= 10.x
docker >= 24.x
docker-compose >= 2.x
```

### 1. Clonar el repositorio

```bash
git clone https://github.com/eld4vd/Sistema-sencillo-de-reservas-para-barberias.git
cd Sistema-sencillo-de-reservas-para-barberias
```

### 2. Configurar variables de entorno

Crea un archivo `backend/.env`:

```env
# Database
DB_HOST=db
DB_PORT=5432
DB_USERNAME=david_bases
DB_PASSWORD=123456
DB_NAME=bd_barberia
DB_SYNCHRONIZE=true
RUN_MIGRATIONS=false

# JWT Secrets (cambiar en producción)
JWT_ACCESS_SECRET=tu-secret-access-super-seguro-cambiar-en-prod
JWT_REFRESH_SECRET=tu-secret-refresh-super-seguro-cambiar-en-prod
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Seed inicial
SEED_ON_BOOT=true
SEED_ADMIN_USERNAME=admin
SEED_ADMIN_EMAIL=admin@barberia.com
SEED_ADMIN_PASSWORD=Admin123!

# CORS
FRONTEND_URL=http://localhost:5173
```

Crea un archivo `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

### 3. Levantar con Docker (recomendado)

```bash
# Construir y levantar servicios
docker compose up --build

# O en modo detached
docker compose up -d
```

**URLs disponibles:**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- PostgreSQL: `localhost:5432`

**Credenciales admin por defecto:**
- Usuario: `admin`
- Email: `admin@barberia.com`
- Contraseña: `Admin123!`

### 4. Desarrollo local (sin Docker)

#### Backend

```bash
cd backend
npm install
npm run start:dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```


## 📁 Estructura del Proyecto

```
.
├── backend/
│   ├── src/
│   │   ├── admins/              # Módulo de administradores
│   │   ├── auth/                # Autenticación JWT + guards
│   │   │   ├── decorators/      # @CurrentUser, @Public
│   │   │   ├── guards/          # JwtAuthGuard, RolesGuard
│   │   │   └── strategies/      # JWT strategy
│   │   ├── citas/               # Gestión de reservas/citas
│   │   ├── common/              # Utilidades compartidas
│   │   │   ├── middlewares/     # CSRF, logging
│   │   │   ├── utils/           # Helpers generales
│   │   │   └── validators/      # Validadores custom
│   │   ├── pagos/               # Sistema de pagos
│   │   ├── peluqueros/          # Gestión de barberos/staff
│   │   ├── peluqueros_servicios/# Relación many-to-many
│   │   ├── productos/           # Catálogo de productos
│   │   ├── seed/                # Datos de prueba iniciales
│   │   ├── servicios/           # Servicios/tratamientos
│   │   └── main.ts              # Bootstrap aplicación
│   ├── test/                    # Tests E2E
│   ├── Dockerfile
│   ├── docker-entrypoint.sh
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Componentes reutilizables
│   │   │   ├── Navbar.tsx       # Nav con glassmorphism
│   │   │   ├── Footer.tsx       # Footer moderno 2025
│   │   │   └── AdminModal.tsx   # Modal para CRUDs
│   │   ├── context/             # Context providers
│   │   │   ├── AuthProvider.tsx # Auth con silent refresh
│   │   │   └── NotificationsProvider.tsx # Notifs optimizado
│   │   ├── hooks/               # Custom hooks
│   │   ├── pages/               # Páginas/vistas
│   │   │   ├── admin/           # Panel administración
│   │   │   │   ├── Reservas.tsx # Con polling 45s
│   │   │   │   ├── Servicios.tsx# CRUD modernizado
│   │   │   │   └── Peluqueros.tsx# CRUD modernizado
│   │   ├── routes/              # Configuración de rutas
│   │   ├── services/            # API calls con fetch
│   │   └── types/               # TypeScript interfaces
│   ├── docs/
│   │   └── datosNegocio.txt     # Info del negocio
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml           # Orquestación servicios
├── LICENSE
└── README.md
```


## 🎨 Mejoras de Diseño 2025

### Footer Modernizado
- ✅ Layout de 4 columnas responsive
- ✅ Formulario de newsletter con validación
- ✅ Botón WhatsApp prominente con animación
- ✅ Badges con indicadores de estado (dot pulsante)
- ✅ Íconos sociales animados con Framer Motion
- ✅ Divider decorativo entre secciones
- ✅ Optimización móvil con colapso a 1 columna

### Navbar Optimizado
- ✅ Glassmorphism con backdrop-blur
- ✅ Indicador animado de página activa
- ✅ Menú móvil con smooth transitions
- ✅ Prefetching de rutas con React Router
- ✅ Logo con hover effects

### CRUDs Modernizados (Servicios y Peluqueros)
- ✅ **Eliminación de métricas redundantes**: Reducción de 280px a 140px en altura
- ✅ **Búsqueda inline con contador**: "4 de 4 servicios • 4 activos"
- ✅ **Badges modernos**: Con dot indicators y mejor UX
- ✅ **Tablas limpias**: Mejor jerarquía visual y espaciado
- ✅ **Sin polling innecesario**: Solo en vista de Reservas


## ⚡ Optimizaciones de Performance

### Context Providers
- **AuthProvider**: Refresh silencioso que no causa re-renders en componentes
- **NotificationsProvider**: Valor memoizado con `useMemo` para evitar actualizaciones innecesarias
- **Cleanup inteligente**: Notificaciones antiguas se eliminan cada 5 minutos (300s)

### Polling Strategy
- **Solo en Reservas**: El polling de 45s únicamente se activa en `/admin/reservas`
- **Visibility-aware**: Pausa automática cuando tab está inactivo
- **Sin duplicados**: Listener de visibilitychange optimizado

### Auto-refresh Tokens
- **Silent mode**: Renovación de JWT cada 12 minutos sin actualizar estado React
- **Solo cookies**: Tokens se actualizan en cookies HTTP-only sin re-renders
- **Verificación de expiración**: Chequeo antes de cada request API


## 🔑 Sistema de Autenticación

Flujo completo implementado:

1. **Login**: Usuario envía credenciales
2. **Token generation**: Backend crea access token (15m) + refresh token (7d)
3. **Cookies HTTP-only**: Tokens almacenados de forma segura
4. **CSRF Token**: Doble validación (cookie + header)
5. **Auto-refresh silencioso**: Renovación cada 12min sin re-renders
6. **Logout**: Limpieza completa de tokens y caché

### Endpoints principales

```typescript
POST /auth/login          // Login con credenciales
POST /auth/refresh        // Renovar tokens (automático)
POST /auth/logout         // Cerrar sesión
GET  /auth/profile        // Obtener usuario actual
```


## 🐳 Docker y Contenedores

### Servicios configurados

```yaml
services:
  db:              # PostgreSQL 17 con health checks
  backend:         # NestJS con TypeORM
  backend-cli:     # Contenedor auxiliar para migraciones
  frontend:        # React con Nginx
```

### Comandos útiles

```bash
# Ver logs de un servicio específico
docker compose logs -f backend

# Reiniciar un servicio
docker compose restart backend

# Ejecutar migraciones (usando backend-cli)
docker compose run --rm backend-cli npm run migration:run

# Generar nueva migración
docker compose run --rm backend-cli npm run migration:generate -- -n NombreMigracion

# Acceder a PostgreSQL
docker compose exec db psql -U david_bases -d bd_barberia

# Detener y eliminar todo
docker compose down -v
```


## 📝 Scripts Disponibles

### Backend

```bash
npm run start:dev       # Desarrollo con watch mode
npm run build           # Compilar TypeScript
npm run start:prod      # Producción (requiere build)
npm run lint            # ESLint con auto-fix
npm run test            # Tests unitarios
npm run test:e2e        # Tests end-to-end
npm run migration:generate -- -n Name  # Nueva migración
npm run migration:run   # Ejecutar migraciones
```

### Frontend

```bash
npm run dev             # Servidor desarrollo (Vite)
npm run build           # Build producción
npm run preview         # Preview build local
npm run lint            # ESLint
```


## 🗄️ Modelo de Base de Datos

### Entidades principales

- **Admin**: Usuarios administradores del sistema
- **Peluquero**: Barberos/staff con especialidades y horarios
- **Servicio**: Catálogo de servicios con precios y duraciones
- **PeluqueroServicio**: Relación many-to-many (peluqueros ↔ servicios)
- **Cita**: Reservas con estados (Pendiente, Confirmada, Completada, Cancelada)
- **Pago**: Registro de pagos asociados a citas
- **Producto**: Catálogo de productos adicionales

### Relaciones clave

```
Admin 1--* Cita
Peluquero 1--* Cita
Peluquero *--* Servicio (through PeluqueroServicio)
Cita 1--1 Pago
```


## 🚀 Despliegue en Producción

### Checklist de seguridad

1. **Variables de entorno**:
   - ✅ Cambiar `JWT_ACCESS_SECRET` y `JWT_REFRESH_SECRET`
   - ✅ Usar contraseña fuerte en `DB_PASSWORD`
   - ✅ Cambiar `SEED_ADMIN_PASSWORD`
   - ✅ Configurar `VITE_API_URL` con dominio real

2. **Base de datos**:
   - ✅ `DB_SYNCHRONIZE=false` (evita pérdida de datos)
   - ✅ `RUN_MIGRATIONS=true` para cambios controlados
   - ✅ `SEED_ON_BOOT=false` después del primer deploy

3. **Seguridad**:
   - ✅ Configurar CORS con dominio específico (no `*`)
   - ✅ Habilitar HTTPS/TLS con certificado válido
   - ✅ Rate limiting configurado correctamente
   - ✅ Helmet con CSP policies
   - ✅ No commitear archivos `.env`

4. **Nginx**:
   - ✅ Gzip compression habilitado
   - ✅ Caché headers para assets estáticos
   - ✅ Rate limiting por IP
   - ✅ Headers de seguridad (HSTS, X-Frame-Options)

### Ejemplo producción

```bash
# Build optimizado
docker compose -f docker-compose.prod.yml build

# Levantar en detached
docker compose -f docker-compose.prod.yml up -d

# Monitorear logs
docker compose logs -f backend frontend

# Health check
curl http://localhost:3000/health
```


## 🧪 Testing

### Tests unitarios (Jest)

```bash
cd backend
npm run test

# Con coverage
npm run test:cov
```

### Tests E2E

```bash
cd backend
npm run test:e2e
```


## 📊 Endpoints API Principales

### Autenticación
```
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
GET    /auth/profile
```

### Administradores
```
GET    /admins
GET    /admins/:id
POST   /admins
PATCH  /admins/:id
DELETE /admins/:id
```

### Peluqueros
```
GET    /peluqueros
GET    /peluqueros/:id
POST   /peluqueros
PATCH  /peluqueros/:id
DELETE /peluqueros/:id
GET    /peluqueros/:id/disponibilidad
```

### Servicios
```
GET    /servicios
GET    /servicios/:id
POST   /servicios
PATCH  /servicios/:id
DELETE /servicios/:id
```

### Citas/Reservas
```
GET    /citas
GET    /citas/:id
POST   /citas
PATCH  /citas/:id
DELETE /citas/:id
PATCH  /citas/:id/estado
```

### Pagos
```
GET    /pagos
GET    /pagos/:id
POST   /pagos
PATCH  /pagos/:id
```


## 🤝 Contribución

Las contribuciones son bienvenidas:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: add amazing feature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Convenciones

- **Commits**: Seguir [Conventional Commits](https://www.conventionalcommits.org/)
- **TypeScript**: Código 100% tipado
- **ESLint**: Pasar linting antes de commit
- **Tests**: Agregar tests para nuevas features


## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.


## 👤 Autor

**David**
- GitHub: [@eld4vd](https://github.com/eld4vd)


## 🙏 Agradecimientos

- NestJS por el excelente framework backend
- React team por React 19
- Vercel por Vite y las mejoras continuas
- Toda la comunidad open source

---

⭐ Si este proyecto te resulta útil, considera darle una estrella en GitHub
