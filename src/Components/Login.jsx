import { useState } from "react";
import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import "./Login.css";

function Login({ setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    // TODO: actually authenticate with Firebase here
    setPage("Home");
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      setPage("Home");
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
      console.error(err);
    }
  };

  return (
    <main className="login-page-form">
      <section className="login-card">
        <h1>Login</h1>
        <p>Sign in to continue using efficient.epp.</p>

        {error && <p className="login-error">{error}</p>}

        <button
          type="button"
          className="google-login-btn"
          onClick={handleGoogleLogin}
        >
          Sign in with Google
        </button>

        <div className="login-divider">
          <span>or</span>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
            />
          </label>

          <button type="submit" className="login-submit-btn">
            Log In
          </button>
        </form>

        <button
          type="button"
          className="login-signup-link"
          onClick={() => setPage("Account")}
        >
          Don't have an account? Create one
        </button>

        <button
          type="button"
          className="login-back-btn"
          onClick={() => setPage("LoginPage")}
        >
          Back
        </button>
      </section>
    </main>
  );
}

export default Login;