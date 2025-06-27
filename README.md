# 📝 Notion Clone - Full Stack Application

A modern, feature-rich note-taking application built with Next.js, FastAPI, PostgreSQL, and real-time collaboration features.

![Notion Clone](https://img.shields.io/badge/Notion-Clone-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-13-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=for-the-badge&logo=postgresql)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)

## ✨ Features

### 🎯 Core Features
- **Rich Text Editor** with real-time collaboration
- **AI-Powered Writing Assistant** (Claude AI integration)
- **Command Palette** (Ctrl+P) for quick actions
- **Keyboard Shortcuts** for enhanced productivity
- **Auto-save** functionality with version history
- **Word Count** and **Last Saved** indicators

### 📁 Page Management
- **Create, edit, and delete pages**
- **Duplicate pages** with one click
- **Hierarchical page structure** (parent-child relationships)
- **Advanced search** across all pages
- **Recent pages** view with activity tracking
- **Page icons** with random emoji selection

### 👥 Collaboration
- **Real-time multi-user editing** with WebSockets
- **Live cursor tracking** for collaborative editing
- **Comments system** with threaded replies
- **Permission management** (read/write/admin)
- **User presence** indicators
- **Conflict resolution** for simultaneous edits

### 🤖 AI Integration
- **Improve writing** with AI suggestions
- **Continue writing** from where you left off
- **Summarize content** to make it shorter
- **Expand content** with more details
- **Simplify language** for better readability
- **Formal/Casual tone** adjustment
- **Convert to bullet points**
- **Custom AI prompts**

### 🔐 Authentication & Security
- **JWT-based authentication**
- **User registration and login**
- **Role-based access control**
- **Password hashing** with bcrypt
- **CORS protection**
- **Input validation** with Pydantic

### 🎨 User Interface
- **Modern, clean design** with dark/light mode support
- **Responsive layout** for mobile and desktop
- **Smooth animations** and transitions
- **Toast notifications** for user feedback
- **Loading states** and error handling
- **Accessibility** features

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 13+ (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules
- **State Management**: React Hooks + Context
- **Real-time**: WebSocket API
- **UI Components**: Custom components
- **Icons**: React Icons

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT with python-jose
- **Password Hashing**: bcrypt
- **Real-time**: WebSockets
- **AI**: Claude API (Anthropic)
- **Migrations**: Alembic
- **Validation**: Pydantic

### Infrastructure
- **Deployment**: Vercel (Frontend & Backend)
- **Database**: Supabase/Neon/Railway
- **Caching**: Redis (optional)
- **Containerization**: Docker
- **CI/CD**: GitHub Actions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL
- Git

### 1. Clone Repository

```bash
git clone https://github.com/your-username/notion-clone.git
cd notion-clone
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 3. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

### 4. Database Setup

```bash
# Create PostgreSQL database
createdb notion_clone

# Or use Docker
docker run --name notion-db -e POSTGRES_DB=notion_clone -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15
```

### 5. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🐳 Docker Setup (Alternative)

```bash
# Run entire stack with Docker Compose
docker-compose up -d

# Access services
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# Database: localhost:5432
# Redis: localhost:6379
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Fork this repository**
2. **Deploy to Vercel**:
   ```bash
   # Frontend
   cd frontend
   vercel

   # Backend
   cd backend
   vercel
   ```
3. **Set up database** (Supabase/Neon)
4. **Configure environment variables**

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Pages
- `GET /api/pages/` - Get user's pages
- `POST /api/pages/` - Create new page
- `PUT /api/pages/{id}` - Update page
- `DELETE /api/pages/{id}` - Archive page

### Collaboration
- `POST /api/pages/{id}/collaborate` - Add collaborator
- `POST /api/pages/{id}/comments` - Add comment
- `WS /api/ws/{page_id}` - Real-time collaboration

### AI
- `POST /api/ai/claude` - Generate content with Claude

Full API documentation available at `/docs` when running the backend.

## 🧪 Testing

### Frontend Tests

```bash
cd frontend
npm test
npm run test:coverage
```

### Backend Tests

```bash
cd backend
pytest
pytest --cov=app
```

## 🔧 Development

### Project Structure

```
notion-clone/
├── frontend/                 # Next.js frontend
│   ├── app/                 # App Router pages
│   │   ├── routers/         # API routes
│   │   ├── models.py        # Database models
│   │   ├── schemas.py       # Pydantic schemas
│   │   └── auth.py          # Authentication
│   ├── alembic/             # Database migrations
│   └── requirements.txt     # Python dependencies
├── docker-compose.yml       # Docker setup
└── DEPLOYMENT.md           # Deployment guide
```

### Code Quality

```bash
# Frontend
cd frontend
npm run lint
npm run type-check

# Backend
cd backend
black .
flake8 .
mypy .
```

### Database Migrations

```bash
cd backend
alembic revision --autogenerate -m "Description"
alembic upgrade head
```

## 🎯 Roadmap

### Phase 1: Core Features ✅
- [x] Basic page management
- [x] Rich text editor
- [x] User authentication
- [x] Real-time collaboration
- [x] AI integration

### Phase 2: Advanced Features 🚧
- [ ] File uploads and attachments
- [ ] Markdown support with live preview
- [ ] Templates system
- [ ] Advanced search with filters
- [ ] Export functionality (PDF, Markdown)

### Phase 3: Enterprise Features 📋
- [ ] Team workspaces
- [ ] Advanced permissions
- [ ] Audit logs
- [ ] API rate limiting
- [ ] Advanced analytics

### Phase 4: Mobile & Offline 📱
- [ ] Progressive Web App (PWA)
- [ ] Offline support
- [ ] Mobile app (React Native)
- [ ] Sync across devices

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests**
5. **Submit a pull request**

### Code Style

- **Frontend**: ESLint + Prettier
- **Backend**: Black + Flake8 + MyPy
- **Commits**: Conventional Commits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Notion** for inspiration
- **Vercel** for hosting
- **Supabase** for database
- **Anthropic** for Claude AI
- **FastAPI** and **Next.js** communities

## 📞 Support

- **Documentation**: Check the README files in each directory
- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions
- **Email**: [your-email@example.com]

## 🚀 Live Demo

- **Frontend**: [https://your-app.vercel.app](https://your-app.vercel.app)
- **Backend API**: [https://your-api.vercel.app](https://your-api.vercel.app)

---

**Built with ❤️ by [Your Name]**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/notion-clone) 