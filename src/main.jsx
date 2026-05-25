import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: "100vh", display: "flex", alignItems: "center",
          justifyContent: "center", background: "#4f46e5", padding: 24,
        }}>
          <div style={{
            background: "#fff", borderRadius: 12, padding: "28px 24px",
            maxWidth: 460, width: "100%", fontFamily: "sans-serif",
          }}>
            <h2 style={{ margin: "0 0 8px", color: "#b91c1c" }}>Something went wrong</h2>
            <pre style={{
              fontSize: "0.8rem", color: "#6b7280", whiteSpace: "pre-wrap",
              wordBreak: "break-word", marginBottom: 16,
            }}>{this.state.error.message}</pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "#4f46e5", color: "#fff", border: "none",
                borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: "0.9rem",
              }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
