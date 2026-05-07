import { useState, useEffect } from 'react';
import { auth, provider } from '../firebase.js';
import { signInWithPopup, signOut, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';

function Login({ setPage }) {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      setPage?.('Home');
    } catch (err) {
      setError('Google sign-in failed. Please try again.');
      console.error(err);
    }
  };

  const handleEmailLogin = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setPage?.('Home');
    } catch (err) {
      setError('Incorrect email or password.');
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div>
      {user ? (
        <div>
          <h2>Hello! Welcome to efficient.epp! Ready to track your schedule, {user.displayName}?</h2>
          <button onClick={handleLogout}>Log Out</button>
        </div>
      ) : (
        <div>
          <button onClick={handleLogin}>Login with Google</button>
          <p>Please login with your personal account!</p>

          {error && <p>{error}</p>}

          <form onSubmit={handleEmailLogin}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
            <button type="submit">Log In</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Login;
