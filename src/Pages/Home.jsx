import Header from "../Components/Header";
import { useState } from "react";
import Nav from "../Components/Nav";
import Card from "../Components/Card";
import App from "../App";
import Button from "../Components/Button";
function Home({setPage}) {
  return (
    <>
    <main className="home-page">
      <Header />
      <section className="home-card">
       <h2>Welcome Back   !</h2>
       <Card  children=" " title="Stress" className="Stress"/>
       <Card  children=" " title="Time Management + Homework" className="Time Management + Homework"/>
       <Card  children=" " title="Sleep" className="Sleep"/>
      </section>
      <section className="home-buttons">
        <Button text="View To-Do list" onClick={() => setPage('To-Do')} className="BigButton"/>
        <Button text="View Mental State" onClick={() => setPage('Mental')} className="BigButton"/>
        <Button text="View Profile" onClick={() => setPage('Profile')} className="BigButton"/>
        <Button text="View Settings" onClick={() => setPage('Settings')} className="BigButton"/>
        <Button text="Log out" onClick={() => setPage('LoginPage')} className="SmallButton"/>
      </section>
    </main>
    </>
  );
}

export default Home;

