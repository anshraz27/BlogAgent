# 🚀 Complete Setup & Running Guide

Follow these steps to run the full AI Blog Generator application with seamless frontend-backend integration.

## Directory Structure

```
blog_agent_flask/
├── frontend/                    # React Vite app
│   ├── src/
│   ├── package.json
│   ├── .env.local              # VITE_API_URL=http://localhost:5000
│   └── ...
├── app.py                       # Flask backend (UPDATED)
├── requirements.txt             # Python dependencies
├── nodes/
├── graphs/
├── states/
├── services/
│   └── llm.py
├── prompts/
├── blogs.json                   # Auto-generated blog storage
└── .env                         # Backend env vars
```

## Step 1: Backend Setup (Flask)

### 1a. Install Flask-CORS

```bash
# In project root
pip install flask-cors
```

Or update your virtual environment:

```bash
pip install -r requirements.txt
```

### 1b. Verify Environment Variables

Create/update `.env` in project root:

```
GEMINI_API_KEY=your_actual_api_key
FIRECRAWL_API_KEY=your_firecrawl_key
```

### 1c. Backend API Routes (Updated)

The backend now listens on:

- `POST /api/generate` - Generate blog (takes `topic`)
- `GET /api/blogs` - Get all blogs
- `GET /api/blogs/<id>` - Get specific blog
- `DELETE /api/blogs/<id>` - Delete blog
- `GET /api/stream` - Stream events

## Step 2: Frontend Setup (React)

### 2a. Install Dependencies

```bash
cd frontend
npm install
```

### 2b. Configure Environment

Verify `.env.local` exists:

```
VITE_API_URL=http://localhost:5000
```

### 2c. Frontend Features

- **GeneratorPage**: Create new blogs
- **ViewBlogsPage**: List, view, download, delete blogs
- **BlogForm**: Input topic and generate
- **BlogPreview**: Display generated content

## Step 3: Run Both Services

### Option A: Two Terminal Windows (Recommended)

**Terminal 1 - Backend:**

```bash
cd c:\Users\thean\Desktop\blog_agent_flask
python app.py
```

Backend runs on: `http://localhost:5000`

**Terminal 2 - Frontend:**

```bash
cd c:\Users\thean\Desktop\blog_agent_flask\frontend
npm run dev
```

Frontend runs on: `http://localhost:5173`

### Option B: Single Terminal (Sequential)

```bash
# Backend
python app.py &

# Frontend (in new terminal)
cd frontend && npm run dev
```

## Step 4: Usage Flow

### Generate a Blog

1. Open `http://localhost:5173`
2. Go to "Generate" page
3. Enter topic (e.g., "AI trends in 2026")
4. Click "Generate Blog"
5. Wait for completion
6. View generated content
7. Download as `.md` file

### View All Blogs

1. Click "View Blogs" in navbar
2. See all generated blogs in sidebar
3. Click a blog to view full content
4. Download or delete blogs

## Step 5: Verify Integration

### Check Backend Health

```bash
curl http://localhost:5000/api/blogs
```

Should return: `[]` (empty list initially)

### Check Frontend Connection

- Open browser Inspector (F12)
- Go to Network tab
- Generate a blog
- Should see POST request to `/api/generate`

## Troubleshooting

### CORS Error

If you see CORS errors:

- Verify `flask_cors` is installed: `pip install flask-cors`
- Check `app.py` has CORS enabled for `http://localhost:5173`
- Restart Flask server

### Blog Not Saving

- Check `blogs.json` is writable in project root
- Verify backend has write permissions
- Check for error in Flask terminal

### Frontend Can't Connect to Backend

- Ensure Flask is running on port 5000
- Check `.env.local` has `VITE_API_URL=http://localhost:5000`
- Check browser console for network errors
- Try: `curl http://localhost:5000/api/blogs`

### Blogs Not Showing

- Check Flask terminal for errors
- Verify `blogs.json` exists
- Try refreshing page
- Check Network tab in browser (F12)

## API Request/Response Examples

### Generate Blog

```bash
curl -X POST http://localhost:5000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"topic": "React best practices"}'
```

Response:

```json
{
  "id": "uuid-here",
  "blog": "# React Best Practices\n...",
  "topic": "React best practices",
  "created_at": "2026-02-24"
}
```

### Get All Blogs

```bash
curl http://localhost:5000/api/blogs
```

Response:

```json
[
  {
    "id": "uuid-1",
    "topic": "AI trends",
    "content": "# AI Trends...",
    "created_at": "2026-02-24",
    "thread_id": "uuid"
  },
  ...
]
```

### Delete Blog

```bash
curl -X DELETE http://localhost:5000/api/blogs/uuid-here
```

## File Storage

Generated blogs are stored in `blogs.json` in the project root:

```json
[
  {
    "id": "unique-id",
    "topic": "Blog topic",
    "content": "Complete markdown content",
    "created_at": "YYYY-MM-DD",
    "thread_id": "langgraph-thread-id"
  }
]
```

## Production Deployment

For production, update:

### Backend (`app.py`)

```python
CORS(app, resources={r"/api/*": {"origins": ["https://yourdomain.com"]}})
app.run(debug=False, host='0.0.0.0', port=5000)
```

### Frontend (`.env.local`)

```
VITE_API_URL=https://api.yourdomain.com
```

### Build Frontend

```bash
cd frontend
npm run build
# Deploy `dist/` folder
```

## Common Commands

```bash
# Start backend
python app.py

# Start frontend dev server
cd frontend && npm run dev

# Build frontend for production
cd frontend && npm run build

# Check if ports are in use
netstat -ano | findstr :5000
netstat -ano | findstr :5173

# Kill process on specific port (Windows)
taskkill /PID <process_id> /F
```

## Performance Tips

1. **Blog Generation**: May take 1-2 minutes depending on API latency
2. **Large Blogs**: View page handles markdown efficiently
3. **Downloads**: Markdown files are lightweight
4. **Image Generation**: Requires `GEMINI_API_KEY`, may fail gracefully

## Next Steps

1. ✅ Verify both services are running
2. ✅ Generate your first blog
3. ✅ Check that blog appears in "View Blogs"
4. ✅ Download the markdown file
5. ✅ Share your blogs!

## Support

- Check logs in both terminals
- Open browser DevTools (F12) for frontend errors
- Review Flask terminal for backend errors
- Test with `curl` commands above

---

**Everything should now work seamlessly! 🎉**
