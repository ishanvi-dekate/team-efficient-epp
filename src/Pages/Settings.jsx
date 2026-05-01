import './Settings.css';

function Settings({ setPage }) {
  const settingsOptions = [
    { label: 'Manage Account', target: 'ManageAccount' },
    { label: 'Notification Emails / Texts', target: 'Notifications' },
    { label: 'Troubleshooting', target: 'Troubleshooting' },
    { label: 'Focus Mode', target: 'FocusMode' },
    { label: 'Personal Information', target: 'PersonalInfo' },
    { label: 'Danger Zone', target: 'DangerZone', danger: true },
  ];

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
              onClick={() => {
                // TODO: hook these up once sub-pages are built
                console.log(`Navigate to: ${option.target}`);
              }}
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