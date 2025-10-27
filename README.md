# 💈 Sistema de Reservas para Barbería

Sistema completo de gestión de citas y servicios para barberías, desarrollado con arquitectura moderna cliente-servidor. Incluye panel de administración, sistema de autenticación robusto, gestión de pagos simulados y notificaciones en tiempo real.

![Demo del Sistema](Recursos/Animacion.gif)


## 🚀 Tecnologías

### Frontend
- **React 19** con TypeScript
- **Vite** - Build tool de última generación
- **React Router 7** - Navegación SPA
- **Framer Motion** - Animaciones fluidas
- **TailwindCSS** - Estilos utility-first
- **Fetch API** - Cliente HTTP nativo con interceptores custom

### Backend
- **NestJS 11** - Framework Node.js escalable
- **TypeORM** - ORM para PostgreSQL
- **JWT** - Autenticación con tokens
- **CSRF Protection** - Seguridad doble token
- **Class Validator** - Validación de DTOs

### Infraestructura
- **Docker & Docker Compose** - Contenedorización
- **PostgreSQL 17** - Base de datos relacional
- **Nginx** - Servidor web para producción

## 📋 Características

### Para Clientes
- ✅ Catálogo de servicios y peluqueros
- ✅ Sistema de reservas con selección de fecha/hora
- ✅ Confirmación de citas
- ✅ Historial de servicios
- ✅ Galería de trabajos realizados

### Panel de Administración
- 🔐 Autenticación segura con JWT + CSRF
- 📅 Gestión completa de citas (CRUD)
- 💇 Administración de peluqueros y servicios
- 💰 Registro de pagos
- 📊 Dashboard con métricas
- 🔔 Sistema de notificaciones en tiempo real
- 🛡️ Control de acceso basado en roles

### Seguridad
- HTTP-only cookies para tokens
- CSRF double token validation
- Refresh token rotation
- Password hashing con bcrypt
- Validación exhaustiva de inputs
- Rate limiting en endpoints críticos

## 🛠️ Instalación

### Prerrequisitos
- Node.js 20+
- Docker y Docker Compose
- Git

### Configuración Rápida con Docker

1. **Clonar el repositorio**
```bash
git clone https://github.com/eld4vd/Barberia-Reservas-Simple-Project.git
cd Barberia-Reservas-Simple-Project
```

2. **Configurar variables de entorno**

Backend:
```bash
cd backend
cp .env.example .env
# Editar .env con tus valores
```

Frontend:
```bash
cd frontend
cp .env.example .env
# Editar .env con tus valores
```

3. **Levantar servicios con Docker**
```bash
# Construir imágenes
docker-compose build

# Levantar servicios en segundo plano
docker-compose up -d
```

4. **Acceder a la aplicación**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Admin Panel: http://localhost:5173/admin

**Credenciales por defecto** (cambiar en producción):
- Email: `admin@barberia.com`
- Password: (definido en `SEED_ADMIN_PASSWORD`)

### Desarrollo Local (sin Docker)

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

#### Base de datos
```bash
# PostgreSQL debe estar corriendo localmente
createdb barberia_db
```

## 📁 Estructura del Proyecto

```
proyecto/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── admins/         # Módulo de administradores
│   │   ├── auth/           # Autenticación y autorización
│   │   ├── citas/          # Gestión de citas
│   │   ├── peluqueros/     # Gestión de peluqueros
│   │   ├── servicios/      # Catálogo de servicios
│   │   ├── pagos/          # Registro de pagos
│   │   ├── seed/           # Datos iniciales
│   │   └── common/         # Utilidades compartidas
│   ├── Dockerfile
│   └── docker-entrypoint.sh
│
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/         # Vistas principales
│   │   ├── context/       # Estado global (Auth, Notifications)
│   │   ├── services/      # API client
│   │   ├── hooks/         # Custom hooks
│   │   └── routes/        # Configuración de rutas
│   ├── Dockerfile
│   └── nginx.conf
│
└── docker-compose.yml      # Orquestación de servicios
```

## 🔧 Scripts Disponibles

### Backend
```bash
npm run start:dev      # Modo desarrollo con hot-reload
npm run build          # Compilar para producción
npm run start:prod     # Ejecutar versión compilada
npm run lint           # Verificar código con ESLint
```

### Frontend
```bash
npm run dev            # Servidor de desarrollo
npm run build          # Build optimizado para producción
npm run preview        # Preview del build de producción
npm run lint           # Verificar código con ESLint
```

## 🐳 Docker

### Arquitectura de contenedores
- **backend**: NestJS en modo producción (puerto 3000)
- **frontend**: React servido por Nginx (puerto 80)
- **postgres**: PostgreSQL 17 (puerto 5432)

### Healthchecks
Todos los servicios incluyen healthchecks para asegurar disponibilidad:
- PostgreSQL: `pg_isready`
- Backend: endpoint `/health`
- Frontend: Nginx status

### Volúmenes persistentes
```yaml
volumes:
  postgres-data:      # Datos de PostgreSQL (persistentes entre reinicios)
```

**Nota**: Los `node_modules` se construyen dentro de las imágenes Docker y no se montan como volúmenes externos.

## 🔐 Autenticación

El sistema implementa un flujo de autenticación seguro:

1. **Login**: Usuario envía credenciales
2. **Tokens**: Backend genera access + refresh tokens
3. **Cookies HTTP-only**: Tokens almacenados de forma segura
4. **CSRF Token**: Doble validación (cookie + header)
5. **Auto-refresh**: Renovación automática antes de expiración
6. **Logout**: Limpieza completa de tokens y caché


## 📚 Documentación Adicional

- [Guía de Autenticación Frontend](frontend/docs/frontend-auth-guide.md)
- [Guía de Migraciones](backend/docs/MIGRATION_GUIDE.md)
- [Sistema de Notificaciones](frontend/docs/SISTEMA_NOTIFICACIONES.md)
- [Mejoras Futuras](backend/docs/NOTAS_MEJORAS_FUTURAS.md)

## 🚀 Despliegue en Producción

### Consideraciones importantes

1. **Variables de entorno**:
   - Cambiar todos los secretos (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`)
   - Usar contraseñas seguras para `DB_PASSWORD` y `SEED_ADMIN_PASSWORD`
   - Configurar `VITE_API_URL` con tu dominio real

2. **Base de datos**:
   - Usar `DB_SYNCHRONIZE=false` en producción
   - Habilitar `RUN_MIGRATIONS=true` para cambios de esquema
   - `SEED_ON_BOOT=true` solo en primer deploy

3. **Seguridad**:
   - Configurar CORS con dominios específicos
   - Habilitar HTTPS/TLS
   - Usar secrets management (no .env en repositorio)

4. **Nginx**:
   - Configurar gzip compression
   - Ajustar caché headers para assets estáticos
   - Configurar rate limiting

### Ejemplo de deploy con Docker Compose

```bash
# Construir imágenes de producción
docker-compose build

# Levantar servicios en segundo plano
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f backend

# Detener servicios
docker-compose down
```


## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👤 Autor

**David**
- GitHub: [@eld4vd](https://github.com/eld4vd)

## 🙏 Agradecimientos

- NestJS por el excelente framework backend
- React team por React 19
- Vercel por Vite
- Toda la comunidad open source

---

⭐ Si este proyecto te resulta útil, considera darle una estrella en GitHub
