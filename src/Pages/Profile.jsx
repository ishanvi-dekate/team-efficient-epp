import { useState, useEffect } from "react";
import "./Profile.css";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) { setError('Please log in first.'); setLoading(false); return; }
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) setProfile(snap.data());
        else setError('No profile found. Complete your profile setup first.');
      } catch (err) {
        setError('Error loading profile: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="profile-page"><div className="profile-loading">Loading profile…</div></div>;
  if (error)   return <div className="profile-page"><div className="profile-error-msg">{error}</div></div>;
  if (!profile) return <div className="profile-page"><div className="profile-error-msg">No profile data found.</div></div>;

  const goals = [profile.goal1, profile.goal2, profile.goal3].filter(Boolean);

  const rows = [
    { label: 'Username',            value: profile.username },
    { label: 'Bedtime',             value: profile.bedtime },
    { label: 'Average Sleep',       value: profile.sleepHours },
    { label: 'Biggest Stressor',    value: profile.stress },
    { label: 'Distractions',        value: profile.distractions },
    { label: 'Extracurriculars',    value: profile.extracurriculars },
    { label: 'Most Homework',       value: profile.homeworkClass },
    { label: 'Courses',             value: profile.courses },
    {
      label: 'Goals',
      value: goals.length > 0
        ? <ol className="profile-goals-list">{goals.map((g, i) => <li key={i}>{g}</li>)}</ol>
        : null,
    },
  ];

  return (
    <div className="profile-page">
      <div className="profile-banner">
        <h2 className="profile-title">Profile</h2>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <h3 className="profile-username">Hi, {profile.username || auth.currentUser?.displayName || 'there'} 👋</h3>

          <table className="profile-table">
            <tbody>
              {rows.map(({ label, value }) =>
                value ? (
                  <tr key={label} className="profile-row">
                    <th className="profile-cell-label">{label}</th>
                    <td className="profile-cell-value">{value}</td>
                  </tr>
                ) : null
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Profile;
