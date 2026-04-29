import { useState } from "react";
import Nav from "./Components/Nav.jsx";
import Home from "./Pages/Home.jsx";
import LoginPage from "./Pages/LoginPage.jsx";
import Settings from "./Pages/Settings.jsx";

function App() {
    const [page, setPage] = useState("Home");

    return (
        <>
        <footer>
            
            {page === "Home" && <Home />}
            {page === "Settings" && <Settings />}
            {page === "LoginPage" && <LoginPage />}
            <Nav setPage={setPage} />
            </footer>
        </>
    );
}

export default App