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
       <Card  children="Stress" title="Stress" className="Stress"/>
       <Card  children="Time Management + Homework" title="Time Management + Homework" className="Time Management + Homework"/>
       <Card  children="Sleep" title="Sleep" className="Sleep"/>
      </section>
      <section className="home-buttons">
        <Button text="View To-Do list" onClick={() => setPage('To-Do')} />
        <Button text="View Mental State" onClick={() => setPage('Mental')} />
        <Button text="View Profile" onClick={() => setPage('Profile')} />
        <Button text="View Settings" onClick={() => setPage('Settings')} />
        <Button text="Log out" onClick={() => setPage('LoginPage')} />
      </section>
    </main>
    </>
  );
}

export default Home;

