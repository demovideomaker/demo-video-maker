import React, { useState } from 'react';

const GeneralSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    appName: 'Demo Application',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    theme: 'light'
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <h3>General Settings</h3>
      
      <div className="form-group">
        <label>Application Name</label>
        <input
          data-testid="app-name-input"
          type="text"
          className="form-control"
          value={settings.appName}
          onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Language</label>
        <select
          data-testid="language-select"
          className="form-control"
          value={settings.language}
          onChange={(e) => setSettings({ ...settings, language: e.target.value })}
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>
      </div>

      <div className="form-group">
        <label>Timezone</label>
        <select
          data-testid="timezone-select"
          className="form-control"
          value={settings.timezone}
          onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
        >
          <option value="UTC">UTC</option>
          <option value="EST">Eastern Time</option>
          <option value="CST">Central Time</option>
          <option value="PST">Pacific Time</option>
        </select>
      </div>

      <div className="form-group">
        <label>Date Format</label>
        <select
          data-testid="date-format-select"
          className="form-control"
          value={settings.dateFormat}
          onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
        >
          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
        </select>
      </div>

      <div className="form-group">
        <label>Theme</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              data-testid="theme-light"
              type="radio"
              name="theme"
              value="light"
              checked={settings.theme === 'light'}
              onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
            />
            Light
          </label>
          <label className="flex items-center gap-2">
            <input
              data-testid="theme-dark"
              type="radio"
              name="theme"
              value="dark"
              checked={settings.theme === 'dark'}
              onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
            />
            Dark
          </label>
        </div>
      </div>

      <div className="flex gap-2 items-center">
        <button 
          data-testid="save-general-settings"
          className="btn btn-primary"
          onClick={handleSave}
        >
          Save Changes
        </button>
        {saved && <span style={{ color: '#10b981' }}>✓ Settings saved successfully</span>}
      </div>
    </div>
  );
};

export default GeneralSettings;