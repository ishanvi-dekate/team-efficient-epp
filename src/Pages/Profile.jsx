import React from "react";
import "./Profile.css";
import Header from "../Components/Header";
function Profile(){
    return(<>
      <div className="profile-page">
      <div className="profile-banner">
        <h2 className="profile-title">Profile</h2>
        <h6 className="profile-username">        </h6>
      </div>
      <div className="profile-content">
        <div className="profile-content-grade">Grade:    </div>
        <div className="profile-content-aboutyou">About you:   </div>
        <div className="profile-content-current">Current courses
        <div className="profile-content-current-info">           ;           ;         ;          ;</div>
        </div>
        <div className="profile-content-current">Extracurriculars
        <div className="profile-content-current-info">          ;           ;          ;          ;          ;          ;</div>
        </div>
        <div className="profile-content-current">Personal goals
        <div className="profile-content-current-info">          ;         ;         ;</div>
        </div>

      </div>
      </div>

    </>);
}
export default Profile