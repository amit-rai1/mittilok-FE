import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api, ApiError } from "../lib/api";
import { usePageTitle } from "../lib/format";

export default function AuthPage({ mode }: { mode: "login" | "signup" | "forgot" }) {
  usePageTitle(mode === "login" ? "Login" : mode === "signup" ? "Sign up" : "Forgot password");
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ emailOrPhone: "", password: "" });
  const [signupForm, setSignupForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [forgotEmail, setForgotEmail] = useState("");

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(loginForm);
      navigate("/account");
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const onSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (signupForm.password !== signupForm.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await register({
        name: signupForm.name,
        email: signupForm.email,
        phone: signupForm.phone || null,
        password: signupForm.password,
      });
      navigate("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const onForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await api<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: { emailOrPhone: forgotEmail },
        auth: false,
      });
      setMessage(res.message ?? "If the account exists, reset instructions were sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const shell = (eyebrow: string, title: string, lead: string, form: React.ReactNode, links: React.ReactNode) => (
    <section className="auth-page">
      <div className="auth-card">
        <img className="auth-logo" src="/logo.png" alt="MittiLok" />
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="auth-lead">{lead}</p>
        {form}
        <div className="auth-links">{links}</div>
      </div>
    </section>
  );

  if (mode === "forgot") {
    return shell(
      "Account",
      "Forgot password",
      "We'll email reset instructions if the account exists.",
      <form onSubmit={(e) => void onForgot(e)}>
        <input required placeholder="Email or phone" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-ok">{message}</p>}
        <button className="btn primary" disabled={loading}>{loading ? "Sending..." : "Send reset link"}</button>
      </form>,
      <Link to="/login">Back to login</Link>,
    );
  }

  if (mode === "signup") {
    return shell(
      "Signup",
      "Create your account",
      "Join MittiLok for orders, wishlist, and plant care.",
      <form onSubmit={(e) => void onSignup(e)}>
        <input required placeholder="Name" value={signupForm.name} onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })} />
        <input required type="email" placeholder="Email" value={signupForm.email} onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })} />
        <input placeholder="Phone" value={signupForm.phone} onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })} />
        <input required type="password" placeholder="Password" value={signupForm.password} onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })} />
        <input required type="password" placeholder="Confirm password" value={signupForm.confirmPassword} onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })} />
        {error && <p className="auth-error">{error}</p>}
        <button className="btn primary" disabled={loading}>{loading ? "Creating..." : "Create account"}</button>
      </form>,
      <Link to="/login">Already have an account?</Link>,
    );
  }

  return shell(
    "Login",
    "Welcome back",
    "Sign in with email or phone.",
    <form onSubmit={(e) => void onLogin(e)}>
      <input required placeholder="Email or phone" value={loginForm.emailOrPhone} onChange={(e) => setLoginForm({ ...loginForm, emailOrPhone: e.target.value })} />
      <input required type="password" placeholder="Password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
      {error && <p className="auth-error">{error}</p>}
      <button className="btn primary" disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
    </form>,
    <>
      <Link to="/signup">Create account</Link>
      <Link to="/forgot-password">Forgot password?</Link>
    </>,
  );
}
