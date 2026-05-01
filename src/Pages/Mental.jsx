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
        <h1 className="mental-title">Mental Check</h1>
      </div>
      <div className="mental-content">
        <p>Please fill out</p>
      <Card  title={"What time did you sleep yesterday?"} className="mental-card"/>
      <input className="mental-input" placeholder="Click to enter"></input>
      <Card title={"Scale on a 1-10, how is your day?"}className="mental-card"/>
      <input className="mental-input" placeholder="Click to enter"></input>
      <Card title={"When did you wake up?"} className="mental-card"/>
      <input className="mental-input" placeholder="Click to enter"></input>
      <Card title={"List out your worries"} className="mental-card"/>
      <input className="mental-input" placeholder="Click to enter"></input>
      </div>
      </div></>)
}
export default Mental

 