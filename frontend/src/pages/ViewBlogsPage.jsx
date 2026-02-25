import { useState, useEffect } from "react";
import { fetchAllBlogs, deleteBlog } from "../api";
import "../styles/ViewBlogsPage.css";

export default function ViewBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllBlogs();
      setBlogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load blogs. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (blogId) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        await deleteBlog(blogId);
        setBlogs(blogs.filter((b) => b.id !== blogId));
        if (selectedBlog?.id === blogId) {
          setSelectedBlog(null);
        }
      } catch (err) {
        setError("Failed to delete blog. Please try again.");
        console.error(err);
      }
    }
  };

  const handleDownload = (blog) => {
    const element = document.createElement("a");
    const file = new Blob([blog.content], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = `${blog.topic.replace(/\s+/g, "_")}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <div className="view-blogs-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="view-blogs-page">
      <div className="blogs-header">
        <h1>📚 All Generated Blogs</h1>
        <p>
          {blogs.length} blog{blogs.length !== 1 ? "s" : ""} generated
        </p>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="blogs-container">
        <div className="blogs-list">
          {blogs.length === 0 ? (
            <p className="no-blogs">
              No blogs generated yet. Start by creating a new blog!
            </p>
          ) : (
            blogs.map((blog) => (
              <div
                key={blog.id}
                className={`blog-card ${selectedBlog?.id === blog.id ? "active" : ""}`}
                onClick={() => setSelectedBlog(blog)}
              >
                <div className="blog-card-header">
                  <h3>{blog.topic}</h3>
                  <span className="date">
                    {new Date(blog.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="blog-preview">
                  {blog.content.substring(0, 100).replace(/[#*_]/g, "")}...
                </p>
                <div className="blog-card-actions">
                  <button
                    className="download-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(blog);
                    }}
                  >
                    ⬇️ Download
                  </button>
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(blog.id);
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedBlog && (
          <div className="blog-detail">
            <div className="detail-header">
              <h2>{selectedBlog.topic}</h2>
              <p className="detail-date">
                Created: {new Date(selectedBlog.created_at).toLocaleString()}
              </p>
            </div>
            <div className="markdown-content">
              {selectedBlog.content.split("\n").map((line, idx) => {
                // Basic markdown image support: ![alt](url)
                if (line.startsWith("![")) {
                  const match = line.match(/^!\[(.*?)\]\((.*?)\)/);
                  if (match) {
                    const alt = match[1];
                    const src = match[2];
                    return (
                      <p key={idx} className="markdown-image">
                        <img src={src} alt={alt} />
                      </p>
                    );
                  }
                }

                // Headings
                if (line.startsWith("# ")) {
                  return <h1 key={idx}>{line.replace("# ", "")}</h1>;
                }
                if (line.startsWith("## ")) {
                  return <h2 key={idx}>{line.replace("## ", "")}</h2>;
                }
                if (line.startsWith("### ")) {
                  return <h3 key={idx}>{line.replace("### ", "")}</h3>;
                }

                // Code (single-line fenced)
                if (line.startsWith("```")) {
                  return (
                    <pre key={idx} className="code-block">
                      <code>{line}</code>
                    </pre>
                  );
                }

                // Blockquote
                if (line.startsWith("> ")) {
                  return (
                    <blockquote key={idx}>{line.replace("> ", "")}</blockquote>
                  );
                }

                // Bullet list item
                if (line.startsWith("- ")) {
                  return <li key={idx}>{line.replace("- ", "")}</li>;
                }

                // Simple italic line like *caption*
                const italicMatch = line.match(/^\*(.*)\*$/);
                if (italicMatch) {
                  return (
                    <p key={idx}>
                      <em>{italicMatch[1]}</em>
                    </p>
                  );
                }

                if (line.trim() === "") {
                  return <br key={idx} />;
                }

                return <p key={idx}>{line}</p>;
              })}
            </div>
            <div className="detail-actions">
              <button
                className="download-btn primary"
                onClick={() => handleDownload(selectedBlog)}
              >
                ⬇️ Download Full Blog
              </button>
              <button
                className="delete-btn"
                onClick={() => handleDelete(selectedBlog.id)}
              >
                🗑️ Delete Blog
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
