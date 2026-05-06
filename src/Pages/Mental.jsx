import { useState } from "react";
import "./Mental.css";

function Mental() {
  const [sleepTime, setSleepTime] = useState("");
  const [dayScale, setDayScale] = useState("");
  const [stressLevel, setStressLevel] = useState("")
  const [wakeTime, setWakeTime] = useState("");
  const [worries, setWorries] = useState("");
  const[extraTime, setExtraTime] = useState("")

  const handleSubmit = () => {
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 700);
    console.log({ sleepTime, dayScale, wakeTime, worries });
    alert("Submitted! (saving to database coming soon)");
  };

  return (
    <div className="mental-page">
      <div className="mental-banner">
        <h1 className="mental-title">Mental Check</h1>
      </div>

      <div className="mental-content">
        <p className="mental-subtitle">Please fill this out once every week so we can provide accurate data for you. </p>

        <div className="mental-grid">
          {/* Left column: questions 1 and 2 */}
          <div className="mental-column">
            <div className="mental-question">
              <label className="mental-card">What time did you sleep yesterday?</label>
              <input
                className="mental-input"
                placeholder="Click to enter"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
              />
            </div>

            <div className="mental-question">
              <label className="mental-card">When did you wake up?</label>
              <input
                className="mental-input"
                placeholder="Click to enter"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
              />
            </div>
            <div className="mental-question">
              <label className="mental-card">On a scale from 1-5, how often have you felt that you were unable to control the important things over the last week?</label>
              <input
                className="mental-input"
                placeholder="Click to enter"
                value = {stressLevel}
                onChange={(e) => setStressLevel(e.target.value)}
              />
            </div>
          </div>

          {/* Center submit button */}
          <button className={`mental-submit ${celebrating ? 'celebrating' : ''}`} onClick={handleSubmit}>
            Click to<br />upload it!
          </button>

          {/* Right column: questions 3 and 4 */}
          <div className="mental-column">
            <div className="mental-question">
              <label className="mental-card">On a scale from 1-10, how was your day?</label>
              <input
                className="mental-input"
                placeholder="Click to enter"
                value={dayScale}
                onChange={(e) => setDayScale(e.target.value)}
              />
            </div>

            <div className="mental-question">
              <label className="mental-card">List out your worries/concerns</label>
              <input
                className="mental-input"
                placeholder="Click to enter"
                value={worries}
                onChange={(e) => setWorries(e.target.value)}
              />
            </div>
            <div className="mental-question">
              <label className="mental-card">How much time did you spend on extracurriculars? </label>
              <input
                className="mental-input"
                placeholder="Click to enter"
                value= {extraTime}
                onChange={(e) => setExtraTime(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Mental;