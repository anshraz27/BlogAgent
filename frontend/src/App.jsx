import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  clearStoredToken,
  deleteBlog,
  fetchAllBlogs,
  fetchMe,
  generateBlog,
  getStoredToken,
  loginUser,
  registerUser,
  updateBlog,
} from "./api";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const boot = async () => {
      if (!getStoredToken()) {
        setAuthReady(true);
        return;
      }

      try {
        setUser(await fetchMe());
      } catch {
        clearStoredToken();
      } finally {
        setAuthReady(true);
      }
    };

    boot();
  }, []);

  if (!authReady) {
    return <div className="boot-screen">Loading workspace...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage user={user} />} />
      <Route path="/login" element={<AuthPage mode="login" setUser={setUser} />} />
      <Route path="/register" element={<AuthPage mode="register" setUser={setUser} />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute user={user}>
            <Workspace user={user} setUser={setUser} />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={user ? "/app" : "/"} replace />} />
    </Routes>
  );
}

function ProtectedRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function LandingPage({ user }) {
  return (
    <main className="landing-page">
      <nav className="public-nav">
        <Link to="/" className="brand-mark">
          DraftForge
        </Link>
        <div className="nav-actions">
          {user ? (
            <Link className="button primary" to="/app">
              Open workspace
            </Link>
          ) : (
            <>
              <Link className="button ghost" to="/login">
                Login
              </Link>
              <Link className="button primary" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Agentic blog generation for working writers</p>
          <h1>Draft, edit, and export researched blogs from one calm workspace.</h1>
          <p>
            Generate long-form posts with your FastAPI agent, refine the markdown in
            React, keep every draft tied to your account, and save the final version
            as a PDF when it is ready to ship.
          </p>
          <div className="hero-actions">
            <Link className="button primary large" to={user ? "/app" : "/register"}>
              Start writing
            </Link>
            <Link className="button ghost large" to={user ? "/app" : "/login"}>
              View drafts
            </Link>
          </div>
        </div>
        <div className="hero-panel" aria-label="Product preview">
          <div className="panel-top">
            <span />
            <span />
            <span />
          </div>
          <div className="preview-grid">
            <div className="metric">
              <strong>12</strong>
              <span>Saved posts</span>
            </div>
            <div className="metric accent">
              <strong>PDF</strong>
              <span>Export ready</span>
            </div>
          </div>
          <div className="document-lines">
            <b />
            <span />
            <span />
            <span className="short" />
          </div>
        </div>
      </section>
    </main>
  );
}

function AuthPage({ mode, setUser }) {
  const navigate = useNavigate();
  const isLogin = mode === "login";
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!isLogin) {
        await registerUser(form);
      }
      await loginUser(form);
      setUser(await fetchMe());
      navigate("/app", { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || "Authentication failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <Link to="/" className="brand-mark">
        DraftForge
      </Link>
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">{isLogin ? "Welcome back" : "Create account"}</p>
        <h1>{isLogin ? "Login" : "Register"}</h1>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            minLength="6"
            required
          />
        </label>
        {error && <p className="error-message">{error}</p>}
        <button className="button primary full" type="submit" disabled={loading}>
          {loading ? "Working..." : isLogin ? "Login" : "Create account"}
        </button>
        <p className="auth-switch">
          {isLogin ? "New here?" : "Already registered?"}{" "}
          <Link to={isLogin ? "/register" : "/login"}>
            {isLogin ? "Create an account" : "Login instead"}
          </Link>
        </p>
      </form>
    </main>
  );
}

function Workspace({ user, setUser }) {
  const [blogs, setBlogs] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [topic, setTopic] = useState("");
  const [draft, setDraft] = useState({ topic: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const selectedBlog = useMemo(
    () => blogs.find((blog) => blog.id === selectedId) || null,
    [blogs, selectedId],
  );

  const loadBlogs = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const data = await fetchAllBlogs();
      setBlogs(data);
      if (data.length && !selectedId) {
        setSelectedId(data[0].id);
      }
    } catch (err) {
      setMessage(err.response?.data?.detail || "Could not load your blogs.");
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  useEffect(() => {
    if (selectedBlog) {
      setDraft({ topic: selectedBlog.topic, content: selectedBlog.content });
    }
  }, [selectedBlog]);

  const handleGenerate = async (event) => {
    event.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setMessage("Generating your blog. This can take a minute.");
    try {
      const blog = await generateBlog(topic.trim());
      setBlogs((current) => [blog, ...current]);
      setSelectedId(blog.id);
      setTopic("");
      setMessage("Blog generated and saved.");
    } catch (err) {
      setMessage(err.response?.data?.detail || "Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedBlog) return;

    setSaving(true);
    setMessage("");
    try {
      const updated = await updateBlog(selectedBlog.id, draft);
      setBlogs((current) =>
        current.map((blog) => (blog.id === updated.id ? updated : blog)),
      );
      setMessage("Changes saved.");
    } catch (err) {
      setMessage(err.response?.data?.detail || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBlog || !window.confirm("Delete this blog?")) return;

    await deleteBlog(selectedBlog.id);
    const remaining = blogs.filter((blog) => blog.id !== selectedBlog.id);
    setBlogs(remaining);
    setSelectedId(remaining[0]?.id || "");
    setDraft({ topic: "", content: "" });
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleLogout = () => {
    clearStoredToken();
    setUser(null);
    navigate("/", { replace: true });
  };

  return (
    <main className="workspace">
      <header className="workspace-header no-print">
        <Link to="/" className="brand-mark">
          DraftForge
        </Link>
        <div className="user-strip">
          <span>{user.email}</span>
          <button className="button ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <section className="workspace-grid">
        <aside className="sidebar no-print">
          <form className="generate-box" onSubmit={handleGenerate}>
            <label>
              New blog topic
              <textarea
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="Example: Building reliable FastAPI agents"
                rows="4"
              />
            </label>
            <button className="button primary full" disabled={loading || !topic.trim()}>
              {loading ? "Generating..." : "Generate blog"}
            </button>
          </form>

          <div className="draft-list">
            <div className="section-title">
              <h2>Saved blogs</h2>
              <span>{blogs.length}</span>
            </div>
            {blogs.map((blog) => (
              <button
                key={blog.id}
                className={`draft-item ${blog.id === selectedId ? "active" : ""}`}
                onClick={() => setSelectedId(blog.id)}
              >
                <strong>{blog.topic}</strong>
                <span>{new Date(blog.created_at).toLocaleDateString()}</span>
              </button>
            ))}
            {!blogs.length && <p className="empty-state">Generate your first draft.</p>}
          </div>
        </aside>

        <section className="editor-pane">
          {message && <p className="status-message no-print">{message}</p>}
          {selectedBlog ? (
            <>
              <div className="editor-toolbar no-print">
                <input
                  value={draft.topic}
                  onChange={(event) => setDraft({ ...draft, topic: event.target.value })}
                  aria-label="Blog title"
                />
                <div className="toolbar-actions">
                  <button className="button ghost" onClick={handleDelete}>
                    Delete
                  </button>
                  <button className="button ghost" onClick={handlePrintPdf}>
                    Save PDF
                  </button>
                  <button className="button primary" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save edits"}
                  </button>
                </div>
              </div>
              <div className="editor-layout">
                <textarea
                  className="markdown-editor no-print"
                  value={draft.content}
                  onChange={(event) => setDraft({ ...draft, content: event.target.value })}
                  aria-label="Blog markdown editor"
                />
                <article className="markdown-preview print-area">
                  <h1>{draft.topic}</h1>
                  <ReactMarkdown>{draft.content}</ReactMarkdown>
                </article>
              </div>
            </>
          ) : (
            <div className="empty-workspace">
              <h1>Your blog workspace is ready.</h1>
              <p>Enter a topic to generate a draft, then edit and export it here.</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default App;
