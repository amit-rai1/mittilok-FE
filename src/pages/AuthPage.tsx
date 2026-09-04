import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageShell } from "../components/ui";
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

  if (mode === "forgot") {
    return (
      <PageShell eyebrow="Account" title="Forgot password" text="We'll email reset instructions if the account exists.">
        <form className="auth-box" onSubmit={(e) => void onForgot(e)}>
          <input required placeholder="Email or phone" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
          {error && <p style={{ color: "#b00020" }}>{error}</p>}
          {message && <p>{message}</p>}
          <button className="btn primary" disabled={loading}>{loading ? "Sending..." : "Send reset link"}</button>
          <Link to="/login">Back to login</Link>
        </form>
      </PageShell>
    );
  }

  if (mode === "signup") {
    return (
      <PageShell eyebrow="Signup" title="Create your MittiLok account" text="Join MittiLok for orders, wishlist, and plant care.">
        <form className="auth-box" onSubmit={(e) => void onSignup(e)}>
          <input required placeholder="Name" value={signupForm.name} onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })} />
          <input required type="email" placeholder="Email" value={signupForm.email} onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })} />
          <input placeholder="Phone" value={signupForm.phone} onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })} />
          <input required type="password" placeholder="Password" value={signupForm.password} onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })} />
          <input required type="password" placeholder="Confirm password" value={signupForm.confirmPassword} onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })} />
          {error && <p style={{ color: "#b00020" }}>{error}</p>}
          <button className="btn primary" disabled={loading}>{loading ? "Creating..." : "Signup"}</button>
          <Link to="/login">Already have an account?</Link>
        </form>
      </PageShell>
    );
  }

  return (
    <PageShell eyebrow="Login" title="Welcome back" text="Sign in with email or phone.">
      <form className="auth-box" onSubmit={(e) => void onLogin(e)}>
        <input required placeholder="Email or phone" value={loginForm.emailOrPhone} onChange={(e) => setLoginForm({ ...loginForm, emailOrPhone: e.target.value })} />
        <input required type="password" placeholder="Password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
        {error && <p style={{ color: "#b00020" }}>{error}</p>}
        <button className="btn primary" disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
        <Link to="/signup">Create account</Link>
        <Link to="/forgot-password">Forgot password?</Link>
      </form>
    </PageShell>
  );
}
