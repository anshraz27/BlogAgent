# API Contract Documentation

## Base URL

```
http://localhost:5000
```

## Endpoints

### 1. Generate Blog

**Endpoint:** `POST /api/generate`

**Request:**

```json
{
  "topic": "Your blog topic here"
}
```

**Response (Success 200):**

```json
{
  "id": "uuid-string",
  "blog": "# Blog Title\n\n## Section 1\n...",
  "topic": "Your blog topic here",
  "created_at": "2026-02-24"
}
```

**Response (Error 400):**

```json
{
  "error": "Topic is required"
}
```

**Frontend Usage:**

```javascript
import { generateBlog } from "../api";

const result = await generateBlog("AI trends");
// Returns { id, blog, topic, created_at }
```

---

### 2. Get All Blogs

**Endpoint:** `GET /api/blogs`

**Request:**

```
No body required
```

**Response (Success 200):**

```json
[
  {
    "id": "uuid-1",
    "topic": "First blog topic",
    "content": "# First Blog\n...",
    "created_at": "2026-02-24",
    "thread_id": "langgraph-thread-id"
  },
  {
    "id": "uuid-2",
    "topic": "Second blog topic",
    "content": "# Second Blog\n...",
    "created_at": "2026-02-23",
    "thread_id": "langgraph-thread-id"
  }
]
```

**Response (Error 500):**

```json
{
  "error": "Failed to load blogs"
}
```

**Frontend Usage:**

```javascript
import { fetchAllBlogs } from "../api";

const blogs = await fetchAllBlogs();
// Returns array of blog objects
```

---

### 3. Get Single Blog

**Endpoint:** `GET /api/blogs/<blog_id>`

**Request:**

```
URL: /api/blogs/550e8400-e29b-41d4-a716-446655440000
```

**Response (Success 200):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "topic": "Blog topic",
  "content": "# Blog Title\n\n...",
  "created_at": "2026-02-24",
  "thread_id": "langgraph-thread-id"
}
```

**Response (Error 404):**

```json
{
  "error": "Blog not found"
}
```

**Frontend Usage:**

```javascript
import { fetchBlogById } from "../api";

const blog = await fetchBlogById("550e8400-e29b-41d4-a716-446655440000");
// Returns blog object
```

---

### 4. Delete Blog

**Endpoint:** `DELETE /api/blogs/<blog_id>`

**Request:**

```
URL: /api/blogs/550e8400-e29b-41d4-a716-446655440000
```

**Response (Success 200):**

```json
{
  "message": "Blog deleted successfully"
}
```

**Response (Error 404):**

```json
{
  "error": "Blog not found"
}
```

**Frontend Usage:**

```javascript
import { deleteBlog } from "../api";

await deleteBlog("550e8400-e29b-41d4-a716-446655440000");
// Blog is deleted from backend
```

---

### 5. Stream Blog Generation

**Endpoint:** `GET /api/stream`

**Request:**

```
URL: /api/stream?topic=AI%20trends
```

**Response (EventStream):**

```
event: message
data: {"node": "router", "status": "processing"}

event: message
data: {"node": "research", "status": "processing"}

event: message
data: {"node": "orchestrator", "status": "processing"}

...
```

**Frontend Usage:**

```javascript
import { streamBlog } from "../api";

const eventSource = streamBlog(
  "AI trends",
  (data) => {
    console.log("Event:", data);
  },
  (error) => {
    console.error("Stream error:", error);
  },
);

// Later: eventSource.close();
```

---

## Error Handling

All endpoints follow standard HTTP status codes:

| Status | Meaning                              |
| ------ | ------------------------------------ |
| 200    | Success                              |
| 400    | Bad Request (missing/invalid params) |
| 404    | Not Found (blog doesn't exist)       |
| 500    | Server Error (internal issue)        |

**Error Response Format:**

```json
{
  "error": "Human-readable error message"
}
```

---

## Response Data Types

### Blog Object

```typescript
interface Blog {
  id: string; // UUID
  topic: string; // Blog topic/title
  content: string; // Full markdown content
  created_at: string; // ISO date "YYYY-MM-DD"
  thread_id: string; // LangGraph thread ID
}
```

### Generation Response

```typescript
interface GenerationResponse {
  id: string; // UUID of created blog
  blog: string; // Markdown content
  topic: string; // Input topic
  created_at: string; // ISO date "YYYY-MM-DD"
}
```

---

## Request Headers

All requests should include:

```
Content-Type: application/json
```

Automatically set by Axios client.

---

## Rate Limiting

No rate limiting currently implemented. For production:

- Add request throttling
- Implement exponential backoff
- Add request timeout (30 seconds recommended)

---

## Data Storage

Generated blogs are stored in `blogs.json` at project root:

```json
[
  {
    "id": "uuid",
    "topic": "topic",
    "content": "markdown content",
    "created_at": "2026-02-24",
    "thread_id": "thread-id"
  }
]
```

---

## CORS Configuration

Backend allows requests from:

- `http://localhost:5173` (Frontend dev server)
- `http://localhost:3000` (Alternative dev port)

For production, update `app.py`:

```python
CORS(app, resources={r"/api/*": {"origins": ["https://yourdomain.com"]}})
```

---

## Example Workflow

```javascript
// 1. Generate a blog
const generated = await generateBlog("React Best Practices");
console.log(generated.id); // "550e8400-..."

// 2. Fetch all blogs
const allBlogs = await fetchAllBlogs();
console.log(allBlogs.length); // 1

// 3. View specific blog
const blog = await fetchBlogById(generated.id);
console.log(blog.content); // Full markdown

// 4. Delete blog
await deleteBlog(generated.id);

// 5. Verify deletion
const remaining = await fetchAllBlogs();
console.log(remaining.length); // 0
```

---

## cURL Examples

```bash
# Generate blog
curl -X POST http://localhost:5000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"topic": "React Hooks"}'

# Get all blogs
curl http://localhost:5000/api/blogs

# Get specific blog
curl http://localhost:5000/api/blogs/550e8400-e29b-41d4-a716-446655440000

# Delete blog
curl -X DELETE http://localhost:5000/api/blogs/550e8400-e29b-41d4-a716-446655440000
```

---

## WebSocket (Future)

Streaming currently uses Server-Sent Events (SSE). Future versions may support:

- WebSocket for bidirectional communication
- Real-time progress updates
- Cancellation support

---

## Backward Compatibility

Original endpoints have been deprecated:

- ❌ `POST /generate` → ✅ `POST /api/generate`
- ❌ `POST /stream` → ✅ `GET /api/stream`

Both still work but use `/api/generate` for new code.

---

## Testing the API

Use **Postman** or **Thunder Client** to test:

1. Import collection from examples above
2. Set base URL to `http://localhost:5000`
3. Test each endpoint
4. Verify responses

Or use **curl** with examples provided above.

---

## Performance Considerations

- Blog generation: 60-120 seconds (LLM dependent)
- List retrieval: <300ms
- Single blog fetch: <100ms
- Deletion: <100ms
- Streaming: Real-time (depends on LLM)

---

## Future Enhancements

- [ ] Blog editing endpoint `PATCH /api/blogs/<id>`
- [ ] Search endpoint `GET /api/blogs/search?q=...`
- [ ] Pagination `GET /api/blogs?page=1&limit=10`
- [ ] Export formats `GET /api/blogs/<id>/export?format=pdf`
- [ ] User authentication
- [ ] Rate limiting
- [ ] Caching
- [ ] WebSocket support

---

## Support

For API issues:

1. Check Flask terminal for error logs
2. Verify JSON request format
3. Check response Content-Type header
4. Use browser DevTools Network tab
5. Review this documentation
