import { useState } from "react";
import Header from "./Components/Header.jsx";
import Nav from "./Components/Nav.jsx";
import Home from "./Pages/Home.jsx";
import LoginPage from "./Pages/LoginPage.jsx";
import Login from "./Components/Login.jsx";
import Account from "./Pages/Account.jsx";
import Settings from "./Pages/Settings.jsx";
import Mental from "./Pages/Mental.jsx";
import Info from "./Pages/Info.jsx";

function App() {
  const [page, setPage] = useState("LoginPage");

  // Header + Nav only show on logged-in pages, not on splash/login/signup
  const showChrome =
    page !== "LoginPage" && page !== "Login" && page !== "Account" && page !== "Info"
  const showHeader = 
    page !=="LoginPage" && page!= "Login" && page !== "Account" && page !== "Info"
  return (
    <>
      <Header />
      {page === "LoginPage" && <LoginPage setPage={setPage} />}
      {page === "Login" && <Login setPage={setPage} />}
      {page === "Account" && <Account setPage={setPage} />}
      {page == "Info" && <Info setPage= {setPage} />}
      {page === "Home" && <Home setPage={setPage} />}
      {page === "Settings" && <Settings setPage={setPage} />}
      {page === "Mental" && <Mental setPage={setPage} />}
      {showHeader && <Header/>}
      {showChrome && <Nav setPage={setPage} currentPage={page} />}
    </>
  );
}

export default App;