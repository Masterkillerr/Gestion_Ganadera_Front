# 🐄 Gestión Ganadera - Frontend

Modern React-based livestock management system frontend. Part of the **Gestion Ganadera** monorepo (also includes Java Spring Boot backend).

## 🚀 Technology Stack

- **React 19** with hooks
- **Vite** for fast build & dev server
- **TailwindCSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **React Hook Form** + **Zod** for form validation
- **Recharts** for data visualization
- **Dark mode** with glassmorphic UI

## 📋 Features

- ✅ **Livestock Management**: Track animals, genealogy, status
- ✅ **Farm Operations**: Manage fincas (farms), lotes (lots), movements
- ✅ **Health Tracking**: Treatments, vaccinations, alerts
- ✅ **Breeding Records**: Montas (mating), estimated/actual birth dates
- ✅ **Production Metrics**: Milk production records, daily statistics
- ✅ **Dashboard**: KPI metrics, charts, system alerts
- ✅ **Accessibility**: WCAG 2.1 Level AA compliant
- ✅ **Multi-User**: User isolation, role-based access

## 📦 Prerequisites

- **Node.js** >= 20
- **npm** or **yarn**
- Backend API running (Spring Boot Java application)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/Masterkillerr/Gestion_Ganadera.git
cd Gestion_Ganadera/frontend
```

### 2. Install dependencies

```bash
npm install
```

## 🏃 Running

### Development Server

```bash
npm run dev
```

Starts Vite dev server on `http://localhost:5173`

### Production Build

```bash
npm run build
```

Creates optimized build in `dist/` directory

### Preview Build

```bash
npm run preview
```

Serves production build locally for testing

## 🔐 Environment Configuration

Create `.env` file in `frontend/` directory:

```env
VITE_API_URL=http://localhost:8080/api
VITE_JWT_EXPIRES_IN=86400
```

### Production:
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_JWT_EXPIRES_IN=86400
```

## 📁 Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── Layout.jsx     # App layout with navbar + sidebar
│   ├── Navbar.jsx     # Navigation bar
│   ├── Sidebar.jsx    # Left navigation menu
│   ├── LoadingButton.jsx     # Button with loading state
│   ├── EmptyState.jsx        # Empty data placeholder
│   ├── AccessibleLink.jsx    # Keyboard-accessible links
│   └── ...
├── pages/             # Route pages
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Ganado/        # Livestock management
│   ├── Reproduccion/  # Breeding records
│   ├── Sanidad/       # Health tracking
│   ├── Produccion/    # Production records
│   ├── Movimientos/   # Movement tracking
│   └── ...
├── services/          # API clients
│   └── api.js        # Axios instance + endpoints
├── hooks/             # Custom React hooks
├── utils/             # Helper functions
├── styles/            # Global styles
├── index.css          # Tailwind + accessibility styles
└── App.jsx           # Root component
```

## 🔗 API Integration

The frontend expects a Spring Boot backend with:
- JWT authentication
- User isolation (multi-tenant)
- RESTful endpoints for all resources

**Base API URL**: Configured via `VITE_API_URL` environment variable

### Key Endpoints:
```
POST   /auth/login
POST   /auth/register
POST   /auth/logout
POST   /auth/forgot-password
POST   /auth/reset-password
GET    /finca
GET    /animal
GET    /reproduccion
GET    /sanidad
GET    /produccion
GET    /movimiento
... (full REST CRUD)
```

## ♿ Accessibility

This application is WCAG 2.1 Level AA compliant:
- ✅ Touch targets: 44×44px minimum
- ✅ Color contrast: 4.5:1 ratio
- ✅ Keyboard navigation: Full support
- ✅ Screen reader: Compatible
- ✅ Focus indicators: Clear and visible
- ✅ Skip links: Jump to main content

See [`ACCESSIBILITY_GUIDE.md`](./ACCESSIBILITY_GUIDE.md) for detailed guidelines.

## 🧪 Testing

```bash
npm run test              # Run unit tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

## 📦 Build & Deploy

### AWS S3 + CloudFront

1. **Build:**
   ```bash
   npm run build
   ```

2. **Deploy to S3:**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. **Invalidate CloudFront (optional):**
   ```bash
   aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
   ```

### Docker (Optional)

```bash
docker build -t gestion-ganadera-frontend .
docker run -p 3000:80 gestion-ganadera-frontend
```

## 📚 Documentation

- [`docs/DESIGN.md`](../docs/DESIGN.md) - Design decisions
- [`docs/ARQUITECTURA.md`](../docs/ARQUITECTURA.md) - System architecture
- [`ACCESSIBILITY_GUIDE.md`](./ACCESSIBILITY_GUIDE.md) - Accessibility patterns
- [`DESIGN.md`](./DESIGN.md) - Component design guide

## 🐛 Troubleshooting

### Port 5173 already in use
```bash
npm run dev -- --port 5174
```

### API connection errors
- Check `VITE_API_URL` matches your backend endpoint
- Verify backend is running (`http://localhost:8080/api/health`)
- Check CORS configuration in backend

### Build size too large
```bash
npm run build -- --analyze  # Analyze bundle
```

## 📝 License

Part of the Gestion Ganadera academic project.

---

**Backend**: Java Spring Boot (separate in `backend/` directory)  
**Database**: PostgreSQL  
**Deployment**: AWS (S3 + CloudFront for frontend, Elastic Beanstalk for backend)

See the [main README](../README.md) for full project context.
# Cache buster
