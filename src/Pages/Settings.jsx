import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import './Settings.css';

function Settings({ setPage }) {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setPage('LoginPage');
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  const settingsOptions = [
    { label: 'Manage Account', target: 'ManageAccount' },
    { label: 'Notification Emails / Texts', target: 'Notifications' },
    { label: 'Troubleshooting', target: 'Troubleshooting' },
    { label: 'Focus Mode', target: 'FocusMode' },
    { label: 'Personal Information', target: 'PersonalInfo' },
    { label: 'Sign Out', target: 'SignOut', signOut: true },
    { label: 'Danger Zone', target: 'DangerZone', danger: true },
  ];

  const handleClick = (option) => {
    if (option.signOut) {
      handleSignOut();
    } else {
      // TODO: hook these up once sub-pages are built
      console.log(`Navigate to: ${option.target}`);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-banner">
        <h1 className="settings-title">Settings</h1>
      </div>

      <div className="settings-content">
        <div className="settings-grid">
          {settingsOptions.map((option) => (
            <button
              key={option.target}
              className={`settings-button ${option.danger ? 'settings-button-danger' : ''}`}
              onClick={() => handleClick(option)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Settings;