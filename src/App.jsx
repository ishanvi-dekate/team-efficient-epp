import { useState } from "react";
import Nav from "./Components/Nav.jsx";
import Home from "./Pages/Home.jsx";
import LoginPage from "./Pages/LoginPage.jsx";
import Login from "./Components/Login.jsx";
import Account from "./Pages/Account.jsx";
import Settings from "./Pages/Settings.jsx";
import Mental from "./Pages/Mental.jsx";

function App() {
  const [page, setPage] = useState("LoginPage");

  // Pages that should show the Nav menu (after login)
  const showNav = page !== "LoginPage" && page !== "Login" && page !== "Account";

  return (
    <>
      {showNav && <Nav setPage={setPage} />}
      {page === "LoginPage" && <LoginPage setPage={setPage} />}
      {page === "Login" && <Login setPage={setPage} />}
      {page === "Account" && <Account setPage={setPage} />}
      {page === "Home" && <Home setPage={setPage} />}
      {page === "Settings" && <Settings setPage={setPage} />}
      {page === "Mental" && <Mental setPage={setPage}/>} 
      {showNav && <Nav setPage={setPage} />}
        </>
    );
}

export default App;