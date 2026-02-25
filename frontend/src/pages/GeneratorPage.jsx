import { useState } from "react";
import BlogForm from "../components/BlogForm";
import BlogPreview from "../components/BlogPreview";
import "../styles/GeneratorPage.css";

export default function GeneratorPage() {
  const [currentBlog, setCurrentBlog] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleBlogGenerated = (blog) => {
    setCurrentBlog(blog);
  };

  const handleLoading = (isLoading) => {
    setLoading(isLoading);
  };

  return (
    <div className="generator-page">
      <div className="generator-header">
        <h1>🚀 AI Blog Generator</h1>
        <p>
          Generate comprehensive technical blogs with research and code examples
        </p>
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Generating your blog...</p>
        </div>
      )}

      <BlogForm
        onBlogGenerated={handleBlogGenerated}
        onLoading={handleLoading}
      />

      {currentBlog && <BlogPreview blog={currentBlog} />}
    </div>
  );
}
