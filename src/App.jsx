import { useState } from "react";
import Header from "./Components/Header.jsx";
import Nav from "./Components/Nav.jsx";
import Home from "./Pages/Home.jsx";
import LoginPage from "./Pages/LoginPage.jsx";
import Login from "./Components/Login.jsx";
import Account from "./Pages/Account.jsx";
import Settings from "./Pages/Settings.jsx";
import Mental from "./Pages/Mental.jsx";
import Profile from "./Pages/Profile.jsx";

function App() {
  const [page, setPage] = useState("LoginPage");

  // Header + Nav only show on logged-in pages, not on splash/login/signup
  const showChrome =
    page !== "LoginPage" && page !== "Login" && page !== "Account";

  return (
    <>
      {page === "LoginPage" && <LoginPage setPage={setPage} />}
      {page === "Login" && <Login setPage={setPage} />}
      {page === "Account" && <Account setPage={setPage} />}
      {page === "Home" && <Home setPage={setPage} />}
      {page === "Settings" && <Settings setPage={setPage} />}
      {page === "Mental" && <Mental setPage={setPage} />}
      {page ==="Profile" && <Profile setPage={setPage} />}

      {showChrome && <Nav setPage={setPage} currentPage={page} />}
    </>
  );
}

export default App;