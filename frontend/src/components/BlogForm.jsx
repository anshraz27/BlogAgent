import { useState } from "react";
import { generateBlog } from "../api";
import "../styles/BlogForm.css";

export default function BlogForm({ onBlogGenerated, onLoading }) {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!topic.trim()) {
      setError("Please enter a topic");
      return;
    }

    setLoading(true);
    setError(null);
    onLoading(true);

    try {
      const result = await generateBlog(topic);
      onBlogGenerated(result);
      setTopic("");
    } catch (err) {
      setError("Failed to generate blog. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };

  return (
    <form className="blog-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="topic">Blog Topic</label>
        <input
          id="topic"
          type="text"
          placeholder="Enter a blog topic (e.g., 'Latest AI trends in healthcare')"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={loading}
          className="topic-input"
        />
      </div>

      {error && <p className="error-message">{error}</p>}

      <button
        type="submit"
        disabled={loading || !topic.trim()}
        className="submit-btn"
      >
        {loading ? "🔄 Generating Blog..." : "✨ Generate Blog"}
      </button>

      <p className="form-hint">
        Write a comprehensive blog post on any topic. The AI will research,
        outline, and generate a complete markdown blog with sections and code
        examples.
      </p>
    </form>
  );
}
