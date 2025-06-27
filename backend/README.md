# Notion Clone - Backend API

A FastAPI-based backend for the Notion Clone application with PostgreSQL, real-time collaboration, and AI integration.

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- User registration and login
- Role-based access control
- Password hashing with bcrypt

### 📄 Page Management
- CRUD operations for pages
- Hierarchical page structure
- Page versioning
- Search functionality
- Page collaboration

### 👥 Collaboration
- Real-time WebSocket connections
- Multi-user editing
- Comments system
- Permission management (read/write/admin)
- Live cursor tracking

### 🤖 AI Integration
- Claude AI integration for content generation
- Multiple AI commands (improve, summarize, expand, etc.)
- Context-aware responses

### 🗄️ Database
- PostgreSQL with SQLAlchemy ORM
- Alembic migrations
- Optimized queries
- Data relationships

## 🛠️ Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT with python-jose
- **Password Hashing**: bcrypt
- **Real-time**: WebSockets
- **AI**: Claude API (Anthropic)
- **Migrations**: Alembic
- **Validation**: Pydantic

## 📋 Prerequisites

- Python 3.8+
- PostgreSQL
- Redis (for production)
- Claude API key (optional)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Environment Variables

Create a `.env` file:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost/notion_clone

# Security
SECRET_KEY=your-super-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Redis (for production)
REDIS_URL=redis://localhost:6379

# AI Integration
CLAUDE_API_KEY=your-claude-api-key

# Environment
ENVIRONMENT=development
DEBUG=true

# CORS
ALLOWED_ORIGINS=["http://localhost:3000"]
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb notion_clone

# Run migrations
alembic upgrade head
```

### 4. Run the Application

```bash
# Development
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 5. Access the API

- **API Documentation**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/token` - OAuth2 token endpoint
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/` - Get all users
- `GET /api/users/{user_id}` - Get specific user
- `PUT /api/users/me` - Update current user

### Pages
- `POST /api/pages/` - Create page
- `GET /api/pages/` - Get user's pages
- `GET /api/pages/{page_id}` - Get specific page
- `PUT /api/pages/{page_id}` - Update page
- `DELETE /api/pages/{page_id}` - Archive page
- `POST /api/pages/{page_id}/duplicate` - Duplicate page
- `POST /api/pages/search` - Search pages

### Collaboration
- `POST /api/pages/{page_id}/collaborate` - Add collaborator
- `GET /api/pages/{page_id}/collaborators` - Get collaborators
- `POST /api/pages/{page_id}/comments` - Add comment
- `GET /api/pages/{page_id}/comments` - Get comments

### AI
- `POST /api/ai/claude` - Generate content with Claude

### WebSocket
- `WS /api/ws/{page_id}?token={token}` - Real-time collaboration

## 🔧 Development

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app
```

### Code Quality

```bash
# Format code
black .

# Lint code
flake8 .

# Type checking
mypy .
```

## 🚀 Deployment

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set Environment Variables**
   - Go to Vercel dashboard
   - Add environment variables:
     - `DATABASE_URL`
     - `SECRET_KEY`
     - `CLAUDE_API_KEY`
     - `ALLOWED_ORIGINS`

### Docker Deployment

```bash
# Build image
docker build -t notion-clone-backend .

# Run container
docker run -p 8000:8000 notion-clone-backend
```

### Production Considerations

1. **Database**: Use managed PostgreSQL (e.g., Supabase, Neon)
2. **Redis**: Use managed Redis (e.g., Upstash, Redis Cloud)
3. **Environment**: Set `ENVIRONMENT=production`
4. **Security**: Use strong `SECRET_KEY`
5. **CORS**: Configure `ALLOWED_ORIGINS` for your domain
6. **SSL**: Use HTTPS in production

## 🔌 Database Schema

### Users
- `id` (UUID) - Primary key
- `email` (String) - Unique email
- `username` (String) - Unique username
- `hashed_password` (String) - Bcrypt hash
- `full_name` (String) - Optional full name
- `is_active` (Boolean) - Account status
- `is_verified` (Boolean) - Email verification
- `created_at` (DateTime) - Account creation
- `updated_at` (DateTime) - Last update

### Pages
- `id` (UUID) - Primary key
- `title` (String) - Page title
- `content` (Text) - Page content
- `icon` (String) - Page icon
- `parent_id` (UUID) - Parent page reference
- `owner_id` (UUID) - Owner user reference
- `is_public` (Boolean) - Public visibility
- `is_archived` (Boolean) - Archive status
- `metadata` (JSON) - Additional data
- `created_at` (DateTime) - Creation time
- `updated_at` (DateTime) - Last update

### Collaborations
- `id` (UUID) - Primary key
- `page_id` (UUID) - Page reference
- `user_id` (UUID) - User reference
- `permission` (String) - Permission level
- `created_at` (DateTime) - Creation time

### Comments
- `id` (UUID) - Primary key
- `page_id` (UUID) - Page reference
- `author_id` (UUID) - Author reference
- `content` (Text) - Comment content
- `parent_comment_id` (UUID) - Parent comment
- `created_at` (DateTime) - Creation time
- `updated_at` (DateTime) - Last update

## 🔐 Security

- JWT tokens with expiration
- Password hashing with bcrypt
- CORS protection
- Input validation with Pydantic
- SQL injection protection with SQLAlchemy
- Rate limiting (can be added with FastAPI middleware)

## 📊 Performance

- Database connection pooling
- Optimized queries with SQLAlchemy
- Async/await for I/O operations
- WebSocket connection management
- Caching with Redis (optional)

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection**
   - Check `DATABASE_URL` format
   - Ensure PostgreSQL is running
   - Verify database exists

2. **Authentication**
   - Check `SECRET_KEY` is set
   - Verify JWT token format
   - Check token expiration

3. **WebSocket**
   - Ensure proper token authentication
   - Check CORS configuration
   - Verify WebSocket URL format

4. **AI Integration**
   - Check `CLAUDE_API_KEY` is valid
   - Verify API quota/limits
   - Check network connectivity

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Happy coding! 🚀** 