import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import GeneratorPage from "./pages/GeneratorPage";
import ViewBlogsPage from "./pages/ViewBlogsPage";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              ✨ Blog Generator
            </Link>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/" className="nav-link">
                  Generate
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/blogs" className="nav-link">
                  View Blogs
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<GeneratorPage />} />
          <Route path="/blogs" element={<ViewBlogsPage />} />
        </Routes>

        <footer className="footer">
          <p>&copy; 2026 AI Blog Generator. Built with React & Flask.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
