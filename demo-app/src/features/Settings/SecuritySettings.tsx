import React, { useState } from 'react';

const SecuritySettings: React.FC = () => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  return (
    <div>
      <h3>Security Settings</h3>
      
      <div className="card mb-4" style={{ background: '#f9fafb' }}>
        <h4>Two-Factor Authentication</h4>
        <p style={{ color: '#666', marginBottom: '16px' }}>
          Add an extra layer of security to your account
        </p>
        <button
          data-testid="toggle-2fa"
          className={`btn ${twoFactorEnabled ? 'btn-danger' : 'btn-primary'}`}
          onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
        >
          {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
        </button>
      </div>

      <div className="card mb-4" style={{ background: '#f9fafb' }}>
        <h4>Password</h4>
        <p style={{ color: '#666', marginBottom: '16px' }}>
          Last changed 45 days ago
        </p>
        <button
          data-testid="change-password-toggle"
          className="btn btn-secondary"
          onClick={() => setShowPasswordForm(!showPasswordForm)}
        >
          Change Password
        </button>

        {showPasswordForm && (
          <div style={{ marginTop: '20px' }}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                data-testid="current-password"
                type="password"
                className="form-control"
                value={passwordData.current}
                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                data-testid="new-password"
                type="password"
                className="form-control"
                value={passwordData.new}
                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                data-testid="confirm-password"
                type="password"
                className="form-control"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <button 
                data-testid="save-password"
                className="btn btn-primary"
                onClick={() => {
                  alert('Password changed successfully');
                  setShowPasswordForm(false);
                }}
              >
                Update Password
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowPasswordForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="card mb-4" style={{ background: '#f9fafb' }}>
        <h4>Active Sessions</h4>
        <p style={{ color: '#666', marginBottom: '16px' }}>
          Manage devices where you're currently logged in
        </p>
        <div style={{ marginBottom: '12px' }}>
          <div className="flex justify-between items-center">
            <div>
              <strong>Chrome on MacOS</strong>
              <div style={{ fontSize: '14px', color: '#666' }}>Current session</div>
            </div>
            <span style={{ color: '#10b981' }}>Active</span>
          </div>
        </div>
        <div style={{ marginBottom: '12px' }}>
          <div className="flex justify-between items-center">
            <div>
              <strong>Safari on iPhone</strong>
              <div style={{ fontSize: '14px', color: '#666' }}>Last active 2 hours ago</div>
            </div>
            <button 
              data-testid="revoke-session-1"
              className="btn btn-danger" 
              style={{ padding: '5px 10px', fontSize: '14px' }}
            >
              Revoke
            </button>
          </div>
        </div>
        <button 
          data-testid="revoke-all-sessions"
          className="btn btn-secondary mt-4"
        >
          Revoke All Other Sessions
        </button>
      </div>

      <div className="card" style={{ background: '#fee', borderColor: '#fcc' }}>
        <h4 style={{ color: '#c00' }}>Danger Zone</h4>
        <p style={{ color: '#666', marginBottom: '16px' }}>
          Permanently delete your account and all associated data
        </p>
        <button 
          data-testid="delete-account"
          className="btn btn-danger"
          onClick={() => alert('Account deletion requires additional confirmation')}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default SecuritySettings;