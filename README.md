# Sistema de Gestión Ganadera 🐄

"EL PROYECTO/REPOSITORIO ACTUAL SOLO ES LA PARTE DEL FRONTEND, LA PARTE BACKEND ESTARA EN OTRO PROYECTO/REPOSITORIO"

Sistema web integral para la gestión de operaciones ganaderas, permitiendo administrar ganado, pastos, reproducción, sanidad, producción y reportes.

## 🚀 Tecnologías

**Frontend:**
- React.js + Vite
- TailwindCSS
- React Router
- Axios
- React Hook Form + Zod
- Recharts

**Backend:**
- Node.js + Express.js
- JWT Authentication
- Prisma ORM
- bcrypt
- multer

**Base de Datos:**
- PostgreSQL

## 📋 Requisitos Previos

- Node.js >= 18
- PostgreSQL >= 14
- npm o yarn

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone <url-repo>
cd Gestion_Ganadera
```

### 2. Configurar Base de Datos

Crear una base de datos PostgreSQL:

```sql
CREATE DATABASE gestion_ganadera;
```

### 3. Configurar Backend

```bash
cd backend
npm install
```

Configurar variables de entorno en `backend/.env`:

```env
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
PORT=3000
```

Ejecutar migraciones:

```bash
npm run db:migrate
```

### 4. Configurar Frontend

```bash
cd frontend
npm install
```

## 🏃‍♂️ Ejecución

### Backend

```bash
cd backend
npm run dev
```

El servidor se ejecutará en `http://localhost:3000`

### Frontend

```bash
cd frontend
npm run dev
```

La aplicación se ejecutará en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
Gestion_Ganadera/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── uploads/
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── .env
│   └── package.json
├── database/
├── docs/
├── ARQUITECTURA.md
└── README.md
```

## 👥 Roles de Usuario

- **Administrador**: Acceso completo al sistema
- **Operador/Veterinario**: Gestión de ganado, sanidad y reproducción

## 📚 Documentación

Ver [ARQUITECTURA.md](./ARQUITECTURA.md) para detalles completos de la arquitectura y plan de desarrollo.

## 📝 Licencia

ISC
# Gestion_Ganadera_Front
