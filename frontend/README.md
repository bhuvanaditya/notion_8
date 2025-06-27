# Notion Clone - Frontend

A modern, feature-rich note-taking application built with Next.js, React, and TypeScript.

## ✨ Features

### 🎯 Core Features
- **Rich Text Editor** with toolbar and formatting options
- **AI-Powered Writing Assistant** (Claude AI integration)
- **Command Palette** (Ctrl+P) for quick actions
- **Keyboard Shortcuts** for enhanced productivity
- **Auto-save** functionality
- **Word Count** and **Last Saved** indicators

### 📁 Page Management
- **Create, edit, and delete pages**
- **Duplicate pages** with one click
- **Hierarchical page structure** (parent-child relationships)
- **Search functionality** across all pages
- **Recent pages** view
- **Page icons** with random emoji selection

### 🎨 User Interface
- **Modern, clean design** with dark/light mode support
- **Responsive layout** for mobile and desktop
- **Smooth animations** and transitions
- **Toast notifications** for user feedback
- **Loading states** and error handling

### 🤖 AI Features
- **Improve writing** with AI suggestions
- **Continue writing** from where you left off
- **Summarize content** to make it shorter
- **Expand content** with more details
- **Simplify language** for better readability
- **Formal/Casual tone** adjustment
- **Convert to bullet points**
- **Custom AI prompts**

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd notion-clone-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🧪 Testing the Application

### 1. **Create New Pages**
- Click the "New Page" button in the sidebar
- Try creating sub-pages by clicking the "+" icon next to existing pages
- Test the page hierarchy by expanding/collapsing pages

### 2. **Rich Text Editor**
- Type in the editor and see real-time word count updates
- Use the toolbar buttons for formatting (Bold, Italic, Code, etc.)
- Try keyboard shortcuts:
  - `Ctrl+B` - Bold
  - `Ctrl+I` - Italic
  - `Ctrl+K` - Open AI Assistant
  - `Ctrl+P` - Open Command Palette
  - `Ctrl+S` - Auto-save (shows toast notification)

### 3. **AI Features** (Mock Mode)
- Press `Ctrl+K` or click the 🤖 button to open AI Assistant
- Select text and try AI commands like "Improve writing", "Summarize", etc.
- Write custom prompts in the textarea
- Note: Currently uses mock responses (see AI Setup below)

### 4. **Command Palette**
- Press `Ctrl+P` or type "/" in the editor
- Search for commands like "Heading 1", "Bullet List", "Code Block"
- Try the search functionality

### 5. **Page Management**
- Click the page icon to change it randomly
- Use the action buttons (copy, add sub-page, delete) on hover
- Test the search functionality in the sidebar
- Switch between "All Pages", "Recent", and "Favorites" tabs

### 6. **Responsive Design**
- Resize your browser window to test mobile responsiveness
- Check that all features work on smaller screens

## 🤖 AI Setup (Optional)

To enable real AI features with Claude:

1. **Get a Claude API Key**
   - Sign up at [Anthropic Console](https://console.anthropic.com/)
   - Create an API key

2. **Set Environment Variable**
   ```bash
   # Create .env.local file
   echo "CLAUDE_API_KEY=your_api_key_here" > .env.local
   ```

3. **Update API Route**
   - Uncomment the Claude API code in `app/api/claude/route.ts`
   - Remove the mock response code

## 🚀 Deployment to Vercel

### Option 1: Deploy from GitHub

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"

### Option 2: Deploy with Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Follow the prompts**
   - Link to existing project or create new
   - Set environment variables if needed
   - Deploy!

### Environment Variables for Production

If using AI features, add to Vercel:
- `CLAUDE_API_KEY` - Your Claude API key

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js 13+ app directory
│   ├── api/               # API routes
│   │   └── claude/        # Claude AI integration
│   ├── workspace/         # Workspace pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── Editor/           # Rich text editor
│   ├── Sidebar/          # Page navigation
│   ├── CommandPalette/   # Command interface
│   └── AIPanel/          # AI assistant
├── lib/                  # Utilities and stores
│   ├── store.ts          # Page store (in-memory)
│   └── types.ts          # TypeScript types
└── public/               # Static assets
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🎯 Next Steps

After testing the current features, you can enhance the application with:

### Backend Integration
- **FastAPI backend** for data persistence
- **PostgreSQL database** for storing pages
- **User authentication** system
- **Real-time collaboration** features

### Advanced Features
- **Markdown support** with live preview
- **File uploads** (images, documents)
- **Templates** for common page types
- **Export functionality** (PDF, Markdown)
- **Version history** for pages
- **Comments and annotations**

### Performance & UX
- **Offline support** with service workers
- **Progressive Web App** features
- **Advanced search** with filters
- **Keyboard shortcuts** customization
- **Themes and customization**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues:
1. Check the browser console for errors
2. Ensure all dependencies are installed
3. Try clearing browser cache
4. Create an issue with detailed steps to reproduce

## Linking Frontend and Backend

To connect the Next.js frontend to your FastAPI backend:

1. **Start the backend** (from the `backend` directory):
   ```sh
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   Or use Docker Compose if you prefer.

2. **Set the backend URL for API routes**:
   - By default, the frontend proxies API requests to `http://localhost:8000`.
   - To use a different backend URL, create a `.env.local` file in the `frontend` directory:
     ```env
     BACKEND_URL=http://localhost:8000
     ```

3. **Start the frontend** (from the `frontend` directory):
   ```sh
   npm install
   npm run dev
   ```

4. **Access the app** at [http://localhost:3000](http://localhost:3000)

---

- The frontend uses Next.js API routes to proxy requests to the backend, avoiding CORS issues.
- For password reset, registration, login, and social login, all requests are routed through `/api/auth/*` endpoints.

---

**Happy coding! 🚀**
