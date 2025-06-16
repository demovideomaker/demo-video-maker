import React, { useState } from 'react';

const NotificationSettings: React.FC = () => {
  const [notifications, setNotifications] = useState({
    email: {
      newUser: true,
      weeklyReport: true,
      systemAlerts: true,
      marketing: false
    },
    push: {
      newUser: true,
      systemAlerts: true,
      updates: false
    }
  });

  const toggleNotification = (type: 'email' | 'push', key: string) => {
    setNotifications({
      ...notifications,
      [type]: {
        ...notifications[type],
        [key]: !(notifications[type] as any)[key]
      }
    });
  };

  return (
    <div>
      <h3>Notification Settings</h3>
      
      <div className="mb-4">
        <h4 style={{ fontSize: '18px', marginBottom: '16px' }}>Email Notifications</h4>
        
        <div className="form-group">
          <label className="flex items-center justify-between">
            <div>
              <div style={{ fontWeight: 500 }}>New User Registration</div>
              <div style={{ fontSize: '14px', color: '#666' }}>Get notified when new users sign up</div>
            </div>
            <input
              data-testid="email-new-user"
              type="checkbox"
              checked={notifications.email.newUser}
              onChange={() => toggleNotification('email', 'newUser')}
            />
          </label>
        </div>

        <div className="form-group">
          <label className="flex items-center justify-between">
            <div>
              <div style={{ fontWeight: 500 }}>Weekly Reports</div>
              <div style={{ fontSize: '14px', color: '#666' }}>Receive weekly summary reports</div>
            </div>
            <input
              data-testid="email-weekly-report"
              type="checkbox"
              checked={notifications.email.weeklyReport}
              onChange={() => toggleNotification('email', 'weeklyReport')}
            />
          </label>
        </div>

        <div className="form-group">
          <label className="flex items-center justify-between">
            <div>
              <div style={{ fontWeight: 500 }}>System Alerts</div>
              <div style={{ fontSize: '14px', color: '#666' }}>Important system notifications</div>
            </div>
            <input
              data-testid="email-system-alerts"
              type="checkbox"
              checked={notifications.email.systemAlerts}
              onChange={() => toggleNotification('email', 'systemAlerts')}
            />
          </label>
        </div>

        <div className="form-group">
          <label className="flex items-center justify-between">
            <div>
              <div style={{ fontWeight: 500 }}>Marketing</div>
              <div style={{ fontSize: '14px', color: '#666' }}>Product updates and announcements</div>
            </div>
            <input
              data-testid="email-marketing"
              type="checkbox"
              checked={notifications.email.marketing}
              onChange={() => toggleNotification('email', 'marketing')}
            />
          </label>
        </div>
      </div>

      <div className="mb-4">
        <h4 style={{ fontSize: '18px', marginBottom: '16px' }}>Push Notifications</h4>
        
        <div className="form-group">
          <label className="flex items-center justify-between">
            <div>
              <div style={{ fontWeight: 500 }}>New User Activity</div>
              <div style={{ fontSize: '14px', color: '#666' }}>Real-time user activity alerts</div>
            </div>
            <input
              data-testid="push-new-user"
              type="checkbox"
              checked={notifications.push.newUser}
              onChange={() => toggleNotification('push', 'newUser')}
            />
          </label>
        </div>

        <div className="form-group">
          <label className="flex items-center justify-between">
            <div>
              <div style={{ fontWeight: 500 }}>System Alerts</div>
              <div style={{ fontSize: '14px', color: '#666' }}>Critical system notifications</div>
            </div>
            <input
              data-testid="push-system-alerts"
              type="checkbox"
              checked={notifications.push.systemAlerts}
              onChange={() => toggleNotification('push', 'systemAlerts')}
            />
          </label>
        </div>

        <div className="form-group">
          <label className="flex items-center justify-between">
            <div>
              <div style={{ fontWeight: 500 }}>Updates</div>
              <div style={{ fontSize: '14px', color: '#666' }}>Feature updates and improvements</div>
            </div>
            <input
              data-testid="push-updates"
              type="checkbox"
              checked={notifications.push.updates}
              onChange={() => toggleNotification('push', 'updates')}
            />
          </label>
        </div>
      </div>

      <button 
        data-testid="save-notification-settings"
        className="btn btn-primary"
      >
        Save Notification Preferences
      </button>
    </div>
  );
};

export default NotificationSettings;