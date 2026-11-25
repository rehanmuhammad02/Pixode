import React, { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { StudioProvider, useStudio } from "./context/StudioContext";
import Landing from "./pages/Landing";
import ErrorBoundary from "./components/ErrorBoundary";
import "./styles.css";
import "./premium.css";
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
function Workspace() {
  const { session, authLoading } = useStudio();
  return authLoading ? (
    <div className="page-loader">Opening your workspace…</div>
  ) : session ? (
    <Dashboard />
  ) : (
    <Navigate to="/login" replace />
  );
}
function App() {
  return (
    <Suspense fallback={<div className="page-loader">Loading Pixode…</div>}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/signup" element={<Auth />} />
        <Route path="/admin/*" element={<Workspace />} />
        <Route
          path="*"
          element={
            <div className="not-found">
              <span className="eyebrow">404 / A LITTLE OFF COURSE</span>
              <h1>
                This page took
                <br />a different direction.
              </h1>
              <a className="button button-primary" href="/">
                Back to Pixode
              </a>
            </div>
          }
        />
      </Routes>
    </Suspense>
  );
}
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <StudioProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StudioProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
