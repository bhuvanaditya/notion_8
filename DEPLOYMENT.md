# 🚀 Deployment Guide - Notion Clone

This guide covers deploying both the frontend (Next.js) and backend (FastAPI) to production.

## 📋 Prerequisites

- GitHub account
- Vercel account (for frontend)
- PostgreSQL database (Supabase, Neon, or similar)
- Redis instance (Upstash, Redis Cloud, or similar)
- Claude API key (optional)

## 🎯 Quick Deployment

### Option 1: One-Click Deploy (Recommended)

1. **Fork this repository** to your GitHub account
2. **Deploy to Vercel** using the button below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/notion-clone)

3. **Configure environment variables** in Vercel dashboard
4. **Set up database** (see Database Setup section)

### Option 2: Manual Deployment

## 🗄️ Database Setup

### Option A: Supabase (Recommended)

1. **Create Supabase account** at [supabase.com](https://supabase.com)
2. **Create new project**
3. **Get connection string** from Settings > Database
4. **Update environment variables**:

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

### Option B: Neon

1. **Create Neon account** at [neon.tech](https://neon.tech)
2. **Create new project**
3. **Get connection string** from dashboard
4. **Update environment variables**

### Option C: Railway

1. **Create Railway account** at [railway.app](https://railway.app)
2. **Create PostgreSQL service**
3. **Get connection string** from service
4. **Update environment variables**

## 🔧 Environment Variables

### Frontend (Vercel)

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.vercel.app
NEXT_PUBLIC_WS_URL=wss://your-backend-domain.vercel.app
```

### Backend (Vercel)

```env
DATABASE_URL=postgresql://user:password@host:port/database
REDIS_URL=redis://user:password@host:port
SECRET_KEY=your-super-secret-key-at-least-32-characters
CLAUDE_API_KEY=your-claude-api-key
ENVIRONMENT=production
DEBUG=false
ALLOWED_ORIGINS=["https://your-frontend-domain.vercel.app"]
```

## 🚀 Step-by-Step Deployment

### 1. Frontend Deployment (Vercel)

```bash
# Clone repository
git clone https://github.com/your-username/notion-clone.git
cd notion-clone

# Deploy frontend
cd frontend
vercel

# Follow prompts:
# - Link to existing project or create new
# - Set project name
# - Set environment variables
```

### 2. Backend Deployment (Vercel)

```bash
# Deploy backend
cd backend
vercel

# Follow prompts:
# - Link to existing project or create new
# - Set project name
# - Set environment variables
```

### 3. Database Migration

```bash
# Connect to your database and run migrations
cd backend
alembic upgrade head
```

### 4. Update Frontend API URL

1. **Get backend URL** from Vercel dashboard
2. **Update frontend environment variables**:
   - Go to Vercel dashboard > Frontend project
   - Settings > Environment Variables
   - Add `NEXT_PUBLIC_API_URL` with your backend URL

## 🔐 Security Configuration

### 1. Generate Secret Key

```bash
# Generate a secure secret key
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 2. Update Environment Variables

```env
SECRET_KEY=your-generated-secret-key
ENVIRONMENT=production
DEBUG=false
```

### 3. Configure CORS

```env
ALLOWED_ORIGINS=["https://your-frontend-domain.vercel.app"]
```

## 📊 Production Monitoring

### 1. Vercel Analytics

- Enable Vercel Analytics in dashboard
- Monitor performance and errors

### 2. Database Monitoring

- Set up database monitoring (Supabase/Neon provide this)
- Monitor query performance
- Set up alerts for high usage

### 3. Error Tracking

- Consider adding Sentry for error tracking
- Monitor API errors and performance

## 🔄 CI/CD Setup

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.FRONTEND_PROJECT_ID }}
          working-directory: ./frontend

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.BACKEND_PROJECT_ID }}
          working-directory: ./backend
```

## 🐳 Docker Deployment (Alternative)

### 1. Build Images

```bash
# Build frontend
cd frontend
docker build -t notion-clone-frontend .

# Build backend
cd ../backend
docker build -t notion-clone-backend .
```

### 2. Deploy with Docker Compose

```bash
# Production docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Post-Deployment

### 1. Test All Features

- [ ] User registration/login
- [ ] Page creation/editing
- [ ] Real-time collaboration
- [ ] AI features
- [ ] Search functionality
- [ ] Mobile responsiveness

### 2. Performance Optimization

- [ ] Enable Vercel Edge Functions
- [ ] Configure CDN caching
- [ ] Optimize database queries
- [ ] Enable compression

### 3. Security Audit

- [ ] Check HTTPS is enabled
- [ ] Verify CORS configuration
- [ ] Test authentication flows
- [ ] Review environment variables

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection**
   ```bash
   # Check connection
   psql $DATABASE_URL -c "SELECT 1;"
   ```

2. **CORS Errors**
   - Verify `ALLOWED_ORIGINS` includes your frontend domain
   - Check for trailing slashes

3. **WebSocket Issues**
   - Ensure WebSocket URL is correct
   - Check Vercel WebSocket support

4. **Environment Variables**
   - Verify all required variables are set
   - Check for typos in variable names

### Debug Commands

```bash
# Check backend health
curl https://your-backend.vercel.app/health

# Check database connection
curl https://your-backend.vercel.app/api/pages

# Test WebSocket connection
wscat -c "wss://your-backend.vercel.app/api/ws/test?token=test"
```

## 📈 Scaling Considerations

### 1. Database Scaling

- Use connection pooling
- Implement read replicas
- Consider database sharding

### 2. Application Scaling

- Use Vercel Edge Functions
- Implement caching strategies
- Consider microservices architecture

### 3. Monitoring

- Set up application monitoring
- Monitor database performance
- Track user metrics

## 🔄 Updates and Maintenance

### 1. Regular Updates

```bash
# Update dependencies
npm update  # Frontend
pip install -r requirements.txt --upgrade  # Backend

# Deploy updates
vercel --prod
```

### 2. Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "Description"

# Apply migration
alembic upgrade head
```

### 3. Backup Strategy

- Set up automated database backups
- Store backups in multiple locations
- Test restore procedures

## 📞 Support

If you encounter issues:

1. **Check logs** in Vercel dashboard
2. **Review documentation** in README files
3. **Create issue** on GitHub
4. **Contact support** for platform-specific issues

---

**Happy deploying! 🚀** 