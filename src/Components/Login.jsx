import { useState } from "react";
import { auth, provider } from "../firebase";
import { signInWithPopup, signInWithEmailAndPassword, getAdditionalUserInfo } from "firebase/auth";
import "./Login.css";

function Login({ setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setPage("Home");
    } catch (err) {
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setError("Incorrect email or password.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Sign-in failed. Please try again.");
      }
      console.error(err);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const additionalInfo = getAdditionalUserInfo(result);
      
      if (additionalInfo?.isNewUser) {
        // First time Google login -> send to onboarding
        sessionStorage.setItem('isNewUser', 'true');
        setPage("Info");
      } else {
        // Returning user -> go straight to Home
        setPage("Home");
      }
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