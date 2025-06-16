import React, { useState } from 'react';
import Layout from '@/components/Layout';
import GeneralSettings from '@/features/Settings/GeneralSettings';
import NotificationSettings from '@/features/Settings/NotificationSettings';
import SecuritySettings from '@/features/Settings/SecuritySettings';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', component: GeneralSettings },
    { id: 'notifications', label: 'Notifications', component: NotificationSettings },
    { id: 'security', label: 'Security', component: SecuritySettings },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || GeneralSettings;

  return (
    <Layout>
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your application preferences and configurations</p>
      </div>

      <div className="card">
        <div className="flex gap-4 mb-4" style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              data-testid={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px 16px',
                cursor: 'pointer',
                fontWeight: activeTab === tab.id ? 600 : 400,
                color: activeTab === tab.id ? '#0070f3' : '#666',
                borderBottom: activeTab === tab.id ? '2px solid #0070f3' : 'none',
                marginBottom: '-17px'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ marginTop: '24px' }}>
          <ActiveComponent />
        </div>
      </div>
    </Layout>
  );
}