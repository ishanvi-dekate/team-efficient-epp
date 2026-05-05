import Card from "../Components/Card";
import Button from "../Components/Button";
import "./Home.css";
import Header from "../Components/Header";


function Home({ setPage, user }) {
  return (
    <>
    <Header />
    <main className="home-page">
      <div className="home-banner">
        <h2 className="home-title">Welcome Back, {user?.displayName || user?.email || ""}</h2>
      </div>

      <section className="home-cards">
        <Card title="Stress" className="home-card">
          Track your stress levels over time.
        </Card>
        <Card title="Time Management + Homework" className="home-card">
          Stay on top of your assignments.
        </Card>
        <Card title="Sleep" className="home-card">
          Monitor your sleep patterns.
        </Card>
      </section>

      <section className="home-buttons">
        <Button text="View To-Do list" onClick={() => setPage('Todo')} />
        <Button text="View Mental State" onClick={() => setPage('Mental')} />
        <Button text="View Profile" onClick={() => setPage('Profile')} />
        <Button text="View Settings" onClick={() => setPage('Settings')} />
      </section>
    </main>
    </>
  );
}

export default Home;
