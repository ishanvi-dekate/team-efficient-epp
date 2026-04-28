import { useState } from "react";
import Nav from "./Components/Nav.jsx";
import Home from "./Pages/Home.jsx";
import LoginPage from "./Pages/LoginPage.jsx";

function App() {
    const [page, setPage] = useState("LoginPage");

    return (
    <>
        <LoginPage />
            {page === "Home" && <Home />} 

    </>
    );
}

export default App