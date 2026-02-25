import "../styles/BlogPreview.css";

export default function BlogPreview({ blog }) {
  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([blog.blog], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = `${blog.topic.replace(/\s+/g, "_")}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="blog-preview">
      <div className="preview-header">
        <div>
          <h2>{blog.topic}</h2>
          <p className="preview-date">
            Generated on {new Date(blog.created_at).toLocaleDateString()}
          </p>
        </div>
        <button className="download-preview-btn" onClick={handleDownload}>
          ⬇️ Download
        </button>
      </div>

      <div className="markdown-preview">
        {blog.blog.split("\n").map((line, idx) => {
          if (line.startsWith("# ")) {
            return <h1 key={idx}>{line.replace("# ", "")}</h1>;
          }
          if (line.startsWith("## ")) {
            return <h2 key={idx}>{line.replace("## ", "")}</h2>;
          }
          if (line.startsWith("### ")) {
            return <h3 key={idx}>{line.replace("### ", "")}</h3>;
          }
          if (line.startsWith("```")) {
            return (
              <pre key={idx} className="code-block">
                <code>{line}</code>
              </pre>
            );
          }
          if (line.startsWith("> ")) {
            return <blockquote key={idx}>{line.replace("> ", "")}</blockquote>;
          }
          if (line.startsWith("- ")) {
            return <li key={idx}>{line.replace("- ", "")}</li>;
          }
          if (line.startsWith("![\n")) {
            return <img key={idx} alt="Blog content" />;
          }
          if (line.trim() === "") {
            return <br key={idx} />;
          }
          return <p key={idx}>{line}</p>;
        })}
      </div>
    </div>
  );
}
