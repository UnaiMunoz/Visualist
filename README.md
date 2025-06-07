# Visualist 🎬

Visualist es una aplicación web para hacer tracking de pelis y series que has visto, quieres ver o estas viendo actualmente. Hecha con React y PHP, Visualist te permite llevar control de tus listas, puntuar contenido y descubrir cosas nuevas para ver.

## ¿Qué puedes hacer? ✨

- **🔍 Descubrir contenido**: Navega por las pelis y series mejor puntuadas
- **📝 Listas personales**: Gestiona lo que has visto, estás viendo, quieres ver y favoritos
- **⭐ Sistema de puntuación**: Puntúa contenido y lleva control de tu progreso
- **📊 Seguimiento de progreso**: Controla episodios vistos y tiempo dedicado
- **💭 Notas personales**: Añade tus propias notas y comentarios
- **🎯 Función sorpresa**: Un botón que te lleva a contenido aleatorio (porque a veces no sabes qué ver)

## 🌐 Demo en vivo

**Frontend**: [https://visualist.netlify.app](https://visualist.netlify.app)

**API Backend**: [https://visualist-production.up.railway.app](https://visualist-production.up.railway.app)

## 🛠️ Tecnologías usadas

### Frontend
- **React** - Para hacer la interfaz
- **React Router** - Para navegar entre páginas
- **CSS3** - Estilos custom (nada de frameworks pesados)
- **Fetch API** - Para hablar con el backend

### Backend (la parte que hace la magia)
- **PHP 7.4+** - Vieja escuela pero funciona
- **MySQL** - Base de datos
- **Apache** - Servidor web
- **TMDb API** - Información de todos los datos de pelis y series

### Hosting
- **Netlify** - Para el frontend (gratis y fácil)
- **Railway** - Para el backend y la BD
- **TMDb API** - La fuente de toda la info

## 📋 ¿Qué necesitas para montarlo?

- **Node.js** 16+ y npm
- **PHP** 7.4+
- **MySQL** 5.7+
- **Apache** con mod_rewrite habilitado
- **Clave de TMDb API** (es gratuita, solo hace falta registrarse)

## 🔧 Intalación

### Montar el Frontend

1. **Clona el repositorio**
```bash
git clone https://github.com/UnaiMunoz/Visualist.git
cd visualist/frontend
```

2. **Instala las dependencias**
```bash
npm install
```

3. **Configura la URL del backend**
```bash
# Edita los archivos en src/services/ y cambia la API_URL
# Por defecto apunta a: https://visualist-production.up.railway.app/api
```

4. **Arranca el servidor de desarrollo**
```bash
npm run dev
```

¡Ya tienes el frontend corriendo en http://localhost:5173!

### Montar el Backend

1. **Ve a la carpeta del backend**
```bash
cd ../backend
```

2. **Copia el archivo de configuración**
```bash
cp .env.example .env
```

3. **Edita el archivo `.env` con tus datos**
```env
# Configuración de la base de datos
DB_HOST=tu_host_de_bd
DB_NAME=nombre_de_tu_bd
DB_USER=tu_usuario_bd
DB_PASS=tu_contraseña_bd

# Claves API
TMDB_API_KEY=tu_clave_de_tmdb

# Configuración de la app
APP_URL=la_url_de_tu_backend
FRONTEND_URL=la_url_de_tu_frontend
SESSION_SECRET=una_clave_secreta_random
SESSION_LIFETIME=604800

# Para desarrollo
DEBUG=false
```

4. **Crea las tablas en tu base de datos**
```sql
-- Necesitarás crear estas tablas:
-- Users (usuarios)
-- Content_References (referencias de contenido)
-- User_Content_Status (estado del contenido del usuario)
-- Favorites (favoritos)
```

5. **Sube todo a tu servidor Apache**
- Sube los archivos a tu servidor web (recomendable XAMPP)
- Asegúrate de que el `.htaccess` esté bien configurado

## 🎯 Endpoints de la API

### Autenticación 
- `POST /api/auth/register.php` - Registrarse
- `POST /api/auth/login.php` - Iniciar sesión
- `POST /api/auth/logout.php` - Cerrar sesión
- `GET /api/auth/session.php` - Comprobar el estado de la sesión
- `POST /api/auth/update-profile.php` - Actualizar perfil

### Películas
- `GET /api/movies/index.php` - Lista de pelis
- `GET /api/movies/top.php` - Pelis mejor puntuadas
- `GET /api/movies/search.php` - Buscar pelis
- `GET /api/movies/detail.php` - Detalles de una peli

### Series
- `GET /api/series/index.php` - Lista de series
- `GET /api/series/top.php` - Series mejor puntuadas
- `GET /api/series/search.php` - Buscar series
- `GET /api/series/detail.php` - Detalles de una serie

### Listas del usuario
- `POST /api/lists/add.php` - Añadir algo a una lista
- `POST /api/lists/remove.php` - Quitar algo de una lista
- `GET /api/lists/check.php` - Ver en qué listas está algo
- `GET /api/lists/get.php` - Obtener tus listas
- `POST /api/lists/update-data.php` - Actualizar datos (puntuación, progreso, etc.)
- `GET /api/lists/get-data.php` - Obtener datos extras

**Hecho por  [Unai Muñoz](https://github.com/UnaiMunoz)**
