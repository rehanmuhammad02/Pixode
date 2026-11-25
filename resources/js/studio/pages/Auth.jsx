import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import Brand from "../components/Brand";
import Icon from "../components/Icon";
import Button from "../components/Button";
import WorkspacePreview from "../components/WorkspacePreview";
import { api } from "../lib/api";
import { useStudio } from "../context/StudioContext";
export default function Auth() {
  const { session, setSession, content } = useStudio();
  const location = useLocation();
  const navigate = useNavigate();
  const signup = location.pathname === "/signup";
  const [options, setOptions] = useState({ google: false });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  useEffect(() => {
    document.title = signup
      ? "Create your account Pixode"
      : "Welcome back Pixode";
    setError("");
    const query = new URLSearchParams(location.search);
    setNotice(
      query.get("verification") === "complete"
        ? "Email verified. You can now sign in to your Pixode account."
        : query.get("verification") === "pending"
          ? "Check your inbox. Verify your email before signing in."
          : "",
    );
    if (query.get("verification") === "expired")
      setError(
        "This verification link expired or was already used. Request a new link below.",
      );
    if (query.has("auth"))
      setError(
        query.get("auth") === "google-unavailable"
          ? "Google sign-in is not configured yet. Use your email account."
          : "Google sign-in could not be completed. Try again or use your password.",
      );
    api("/api/admin/auth-options")
      .then(setOptions)
      .catch(() => {});
  }, [location.pathname, location.search, signup]);
  if (session) return <Navigate to="/admin" replace />;
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (signup && data.password !== data.confirmPassword)
        throw new Error("Passwords do not match.");
      const result = await api(`/api/admin/${signup ? "signup" : "login"}`, {
        method: "POST",
        body: data,
      });
      if (result.verificationRequired) {
        navigate("/login?verification=pending");
        setNotice(result.message);
        setEmail(result.email);
      } else {
        setSession(result);
        navigate("/admin", { replace: true });
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  };
  const resend = async () => {
    setResending(true);
    setError("");
    try {
      if (!email.includes("@"))
        throw new Error(
          "Enter your email address first, then request a verification link.",
        );
      const result = await api("/api/admin/resend-verification", {
        method: "POST",
        body: { email },
      });
      setNotice(result.message);
    } catch (error) {
      setError(error.message);
    } finally {
      setResending(false);
    }
  };
  return (
    <div className="auth-page">
      <aside className="auth-art">
        
        <div className="auth-art-copy">
          <span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
          <h1>Your next chapter.<br/><span>Built together.</span></h1>
          <p>A clearer space for your ideas, your projects and the creative partnership that brings them to life.</p>
        </div>
        <WorkspacePreview logo={content.settings.logo}/>
        <Link to="/" className="text-button">
          Back to Pixode
          <Icon name="arrow-up-right" size={17} />
        </Link>
      </aside>
      <main className="auth-panel">
        <div className="auth-form-wrap"><div className="auth-form-brand"><Brand logo={content.settings.logo}/><Link to="/">Back to website<Icon name="arrow-up-right" size={15}/></Link></div>
          <span className="eyebrow">THE PIXODE WORKSPACE</span>
          <div className="auth-tabs">
            <Link to="/login" className={!signup ? "active" : ""}>
              Sign in
            </Link>
            <Link to="/signup" className={signup ? "active" : ""}>
              Create account
            </Link>
          </div>
          <h2>{signup ? "Make yourself at home." : "Good to see you."}</h2>
          <p className="auth-description">
            {signup
              ? "Use an email you can access. We’ll send a verification link before your first sign-in."
              : "A space for your ideas. A home for your next project."}
          </p>
          <a
            className="google-button"
            href="/api/admin/google/start"
            aria-disabled={!options.google}
            onClick={(event) => {
              if (!options.google) {
                event.preventDefault();
                setError(
                  "Google sign-in is being configured. Use your existing email account.",
                );
              }
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
              <path
                fill="#4285F4"
                d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.03v2.52h3.24c1.89-1.74 2.98-4.3 2.98-7.38Z"
              />
              <path
                fill="#34A853"
                d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.52c-.9.6-2.06.97-3.38.97-2.6 0-4.8-1.76-5.6-4.12H3.06v2.6A10 10 0 0 0 12 22Z"
              />
              <path
                fill="#FBBC05"
                d="M6.4 13.91a6 6 0 0 1 0-3.82v-2.6H3.06a10 10 0 0 0 0 9.02l3.34-2.6Z"
              />
              <path
                fill="#EA4335"
                d="M12 5.97c1.47 0 2.79.5 3.83 1.5l2.88-2.88A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.49l3.34 2.6A5.99 5.99 0 0 1 12 5.97Z"
              />
            </svg>
            Continue with Google
          </a>
          <div className="auth-divider">OR USE YOUR EMAIL</div>
          <form id="auth-form" onSubmit={submit}>
            {signup && (
              <label>
                Your name
                <input
                  name="name"
                  autoComplete="name"
                  placeholder="Your full name"
                  required
                  maxLength="100"
                />
              </label>
            )}
            <label>
              {signup ? "Email address" : "Email or username"}
              <input
                name="email"
                type={signup ? "email" : "text"}
                autoComplete="username"
                placeholder={
                  signup ? "you@company.com" : "Email address or username"
                }
                required
                maxLength="254"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label>
              Password
              <div className="password-field">
                <input
                  name="password"
                  type={show ? "text" : "password"}
                  autoComplete={signup ? "new-password" : "current-password"}
                  placeholder="At least 12 characters"
                  minLength="12"
                  maxLength="128"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  <Icon name={show ? "eye-off" : "eye"} size={18} />
                </button>
              </div>
            </label>
            {signup && (
              <label>
                Confirm password
                <input
                  name="confirmPassword"
                  type={show ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  minLength="12"
                  maxLength="128"
                  required
                />
              </label>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={busy}
              icon={busy ? "loader" : "arrow-right"}
            >
              {busy
                ? "One moment…"
                : signup
                  ? "Create your account"
                  : "Enter your workspace"}
            </Button>
          </form>
          {notice && (
            <div className="verification-notice" role="status">
              <Icon name="mail" />
              {notice}
            </div>
          )}
          <button
            className="resend-button"
            disabled={resending}
            onClick={resend}
          >
            {resending ? "Sending verification…" : "Resend verification email"}
          </button>
          <p className="form-trust">
            <Icon name="shield" size={14} />
            Your details stay private. Your ideas stay yours.
          </p>
        </div>
      </main>
    </div>
  );
}
