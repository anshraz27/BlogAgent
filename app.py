from flask import Flask, request, Response, jsonify
from flask_cors import CORS
from graphs.main_graph import build_graph
from datetime import date
import json
import uuid
from pathlib import Path

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://localhost:3000"]}})
graph = build_graph()

# Blog storage file
BLOGS_FILE = Path("blogs.json")

def load_blogs():
    """Load blogs from JSON file."""
    if BLOGS_FILE.exists():
        with open(BLOGS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def save_blogs(blogs):
    """Save blogs to JSON file."""
    with open(BLOGS_FILE, "w", encoding="utf-8") as f:
        json.dump(blogs, f, indent=2, ensure_ascii=False)

@app.route("/api/blogs", methods=["GET"])
def get_blogs():
    """Fetch all generated blogs."""
    blogs = load_blogs()
    return jsonify(blogs)

@app.route("/api/blogs/<blog_id>", methods=["GET"])
def get_blog(blog_id):
    """Fetch a specific blog by ID."""
    blogs = load_blogs()
    blog = next((b for b in blogs if b["id"] == blog_id), None)
    if not blog:
        return jsonify({"error": "Blog not found"}), 404
    return jsonify(blog)

@app.route("/api/blogs/<blog_id>", methods=["DELETE"])
def delete_blog(blog_id):
    """Delete a blog by ID."""
    blogs = load_blogs()
    blogs = [b for b in blogs if b["id"] != blog_id]
    save_blogs(blogs)
    return jsonify({"message": "Blog deleted successfully"})

@app.route("/api/generate", methods=["POST"])
def generate_blog():
    """Generate a new blog and save it."""
    data = request.json
    topic = data.get("topic")
    thread_id = str(uuid.uuid4())

    initial_state = {
        "topic": topic,
        "as_of": str(date.today()),
        "sections": [],
    }

    config = {
        "configurable": {
            "thread_id": thread_id
        }
    }

    result = graph.invoke(initial_state, config=config)
    
    blog_content = result.get("final")
    blog_id = str(uuid.uuid4())
    
    blog_entry = {
        "id": blog_id,
        "topic": topic,
        "content": blog_content,
        "created_at": str(date.today()),
        "thread_id": thread_id
    }
    
    # Save to storage
    blogs = load_blogs()
    blogs.append(blog_entry)
    save_blogs(blogs)

    return jsonify({
        "id": blog_id,
        "blog": blog_content,
        "topic": topic,
        "created_at": str(date.today())
    })


@app.route("/api/stream", methods=["POST"])
def stream_blog():
    """Stream blog generation events."""
    data = request.json
    topic = data.get("topic")
    thread_id = data.get("thread_id", "default_user")

    initial_state = {
        "topic": topic,
        "as_of": str(date.today()),
        "sections": [],
    }

    config = {
        "configurable": {
            "thread_id": thread_id
        }
    }

    def generate():
        for event in graph.stream(initial_state, config=config):
            yield f"data: {json.dumps(event, default=str)}\n\n"

    return Response(generate(), content_type="text/event-stream")


if __name__ == "__main__":
    app.run(debug=True, threaded=True)
