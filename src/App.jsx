import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase.js";
import Nav from "./Components/Nav.jsx";
import Home from "./Pages/Home.jsx";
import LoginPage from "./Pages/LoginPage.jsx";
import Login from "./Components/Login.jsx";
import Account from "./Pages/Account.jsx";
import Settings from "./Pages/Settings.jsx";
import Mental from "./Pages/Mental.jsx";
import Info from "./Pages/Info.jsx";
import Tracker from "./Pages/Tracker.jsx";

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

  // "Todo" excluded because Tracker.jsx renders Nav directly
  const showNav = !LOGIN_PAGES.includes(page) && page !== "Home" && page !== "Todo";

  return (
    <>
      {page === "LoginPage" && <LoginPage setPage={navigateTo} />}
      {page === "Login"     && <Login     setPage={navigateTo} />}
      {page === "Account"   && <Account   setPage={navigateTo} />}
      {page === "Home"      && <Home      setPage={navigateTo} />}
      {page === "Settings"  && <Settings  setPage={navigateTo} />}
      {page === "Mental"  && <Mental setPage= {navigateTo} />}
      {page === "Todo"      && <Tracker   setPage={navigateTo} user={user} />}
      {showNav && <Nav setPage={navigateTo} />}
    </>
  );
}

export default App;
