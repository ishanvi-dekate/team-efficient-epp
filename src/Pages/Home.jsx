import Header from "../Components/Header";
import Nav from "../Components/Nav";
import Card from "../Components/Card";
import App from "../App";
import Button from "../Components/Button";
import "./Home.css";
function Home({setPage}) {
  return (
    <>
       <Header />
    <main className="home-page">
      <div className="home-banner">
        <div className="home-title">Welcome Back!</div>
      </div>
   
      <section className="home-card">
       <Card  children="Stress" title="Stress" className="Stress"/>
       <Card  children="Time Management + Homework" title="Time Management + Homework" className="Time Management + Homework"/>
       <Card  children="Sleep" title="Sleep" className="Sleep"/>
      </section>
      <section className="home-buttons">
        <Button text="View To-Do list" onClick={() => setPage('To-Do')} className="home-button" />
        <Button text="View Mental State" onClick={() => setPage('Mental')} className="home-button" />
        <Button text="View Profile" onClick={() => setPage('Profile')} className="home-button" />
        <Button text="View Settings" onClick={() => setPage('Settings')} className="home-button" />
      </section>
    </main>
    </>
  );
}

export default Home;

