import React, { useState, useEffect } from "react";
import "./Profile.css";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

function Profile(){
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = auth.currentUser;
        console.log('Current user UID:', user?.uid);
        console.log('Current user email:', user?.email);
        
        if (!user) {
          setError('Please log in first.');
          setLoading(false);
          return;
        }
        const docRef = doc(db, 'users', user.uid, 'profile', 'data');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          setError('No profile found. Please complete your profile setup first.');
        }
      } catch (error) {
        setError('Error loading profile: ' + error.message);
        console.error("Error fetching profile:", error);  
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return <div className="profile-page">Loading profile...</div>;
  }

  if (error) {
    return <div className="profile-error">{error}</div>;
  }

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