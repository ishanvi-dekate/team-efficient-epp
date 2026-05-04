import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
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

function App() {
  const [page, setPage] = useState("LoginPage");
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setPage(prev =>
          prev === "LoginPage" || prev === "Login" ? "Home" : prev
        );
      } else {
        setPage("LoginPage");
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  if (authLoading) return null;

  // Pages that should show the Nav menu (after login)
  // "Todo" is excluded because Tracker.jsx includes Nav directly
  const showNav = page !== "LoginPage" && page !== "Login" && page !== "Home" && page !== "Todo";

  return (
    <>
      <Header />
      {page === "LoginPage" && <LoginPage setPage={setPage} />}
      {page === "Login" && <Login setPage={setPage} />}
      {page === "Account" && <Account setPage={setPage} />}
      {page == "Info" && <Info setPage= {setPage} />}
      {page === "Home" && <Home setPage={setPage} />}
      {page === "Settings" && <Settings setPage={setPage} />}
      {page === "Todo" && <Tracker setPage={setPage} />}
      {showNav && <Nav setPage={setPage} />}
    </>
  );
}

export default App;
