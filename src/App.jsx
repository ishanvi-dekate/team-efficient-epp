import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase.js";
import Nav from "./Components/Nav.jsx";
import Header from "./Components/Header.jsx";
import Home from "./Pages/Home.jsx";
import LoginPage from "./Pages/LoginPage.jsx";
import Login from "./Components/Login.jsx";
import Account from "./Pages/Account.jsx";
import Settings from "./Pages/Settings.jsx";
import Tracker from "./Pages/Tracker.jsx";
import Mental from "./Pages/Mental.jsx";
import Profile from "./Pages/Profile.jsx";
import ChatBot from "./Components/ChatBot.jsx";

const LOGIN_PAGES = ["LoginPage", "Login"];

// Cookies survive hard refresh (Ctrl+Shift+R); sessionStorage does not
const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
};
const setCookie = (name, value) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${30 * 86400}; SameSite=Strict`;
};
const deleteCookie = (name) => {
  document.cookie = `${name}=; path=/; max-age=0`;
};

function App() {
  const [page, setPage] = useState("LoginPage");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const saved = getCookie("page");
        setPage(saved && !LOGIN_PAGES.includes(saved) ? saved : "Home");
      } else {
        deleteCookie("page");
        setPage("LoginPage");
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const navigateTo = (newPage) => {
    if (LOGIN_PAGES.includes(newPage)) {
      signOut(auth).catch(console.error);
      deleteCookie("page");
    } else {
      setCookie("page", newPage);
    }
    setPage(newPage);
  };

  if (authLoading) return null;

  // Pages that should show the Nav menu (after login)
  // "Todo" is excluded because Tracker.jsx includes Nav directly
const showNav = page !== "LoginPage" && page !== "Login" && page !== "Account" && page !== "Home";
  return (
    <>
      {showNav && <Header />}
      {page === "LoginPage" && <LoginPage setPage={setPage} />}
      {page === "Login" && <Login setPage={setPage} />}
      {page === "Account" && <Account setPage={setPage} />}
      {page === "Home" && <Home setPage={setPage} />}
      {page === "Settings" && <Settings setPage={setPage} />}
      {page === "Mental" && <Mental setPage={setPage} />}
      {page ==="Profile" && <Profile setPage={setPage} />}

      {page === "Todo" && <Tracker setPage={setPage} user={user} />}
      {showNav && <Nav setPage={setPage} currentPage={page} />}
      <ChatBot user={user} />
    </>
  );
}

export default App;