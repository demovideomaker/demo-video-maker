import React from 'react';

const ActivityFeed: React.FC = () => {
  const activities = [
    { id: 1, user: 'Sarah Chen', action: 'completed purchase', time: '2 min ago', icon: '🛒' },
    { id: 2, user: 'Mike Ross', action: 'updated profile', time: '5 min ago', icon: '👤' },
    { id: 3, user: 'Emily Davis', action: 'left a review', time: '12 min ago', icon: '⭐' },
    { id: 4, user: 'James Wilson', action: 'created account', time: '18 min ago', icon: '🎉' },
    { id: 5, user: 'Lisa Anderson', action: 'added to cart', time: '25 min ago', icon: '🛍️' },
  ];

  return (
    <div className="card">
      <h3>Recent Activity</h3>
      <div className="mt-4">
        {activities.map((activity) => (
          <div 
            key={activity.id} 
            data-testid={`activity-${activity.id}`}
            style={{ 
              padding: '12px 0', 
              borderBottom: '1px solid #e5e7eb',
              cursor: 'pointer'
            }}
            onClick={() => alert(`Viewing details for ${activity.user}`)}
          >
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '20px' }}>{activity.icon}</span>
              <div style={{ flex: 1 }}>
                <strong>{activity.user}</strong> {activity.action}
                <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                  {activity.time}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button 
        data-testid="view-all-activity"
        className="btn btn-secondary mt-4" 
        style={{ width: '100%' }}
      >
        View All Activity
      </button>
    </div>
  );
};

export default ActivityFeed;