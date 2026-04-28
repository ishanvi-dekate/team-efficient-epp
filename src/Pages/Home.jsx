import Header from "../Components/Header";
import { useState } from "react";
import Nav from "../Components/Nav";
import Card from "../Components/Card";
import App from "../App";
function Home() {
  return (
    <>
    <header><Header /></header>
    <main className="home-page">
      <section className="home-card">
       <h2>Welcome Back   !</h2>
       <Card  children=" " title="Stress" className="Stress"/>
       <Card  children=" " title="Time Management + Homework" className="Time Management + Homework"/>
       <Card  children=" " title="Sleep" className="Sleep"/>
      </section>
      <section className="home-buttons">
      </section>
    </main>
    </>
  );
}

export default Home;

