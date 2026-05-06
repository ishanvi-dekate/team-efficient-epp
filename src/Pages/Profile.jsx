import React, { useState, useEffect } from "react";
import "./Profile.css";
import Info from "./Info.jsx";

function Profile(){
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('userProfile');
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  if (!profile) {
    return <div className="profile-page">No profile data found</div>;
  }

  return(<>
     <div className="profile-page">
      <div className="profile-banner">
        <h2 className="profile-title">Profile</h2>
      
      </div>
      <div className="profile-content">
          <h3 className="profile-username">Hi, {profile.username}</h3>
        <div className="profile-content-grade">Grade: </div>
        <div className="profile-content-aboutyou">About you: You are {profile.username}, and you are stress about {profile.stress}. Overall your current courses, {profile.homeworkClass} gives you the most homework.</div>
        <div className="profile-content-current">Current courses:
        <div className="profile-content-current-info">{profile.courses}</div>
        </div>
        <div className="profile-content-current">Extracurriculars:
        <div className="profile-content-current-info">{profile.extracurriculars}</div>
        </div>
        <div className="profile-content-current">Personal goals
        <div className="profile-content-current-info"><li>{profile.goal1}</li><li>{profile.goal2}</li><li>{profile.goal3}</li></div>
        </div>

      </div>
      </div>

    </>);
}
export default Profile