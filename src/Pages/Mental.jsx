import Header from "../Components/Header";
import React from "react";
import Card from "../Components/Card";
import Button from "../Components/Button";
import "./Mental.css"
function Mental(){
    return(
    <>
    <div className="mental-page">
    <header className="hero-header">
    <Header />
    </header>
      <div className="mental-banner">
        <h1 className="settings-title">Mental Check</h1>
      </div>
      </div></>)
}
export default Mental