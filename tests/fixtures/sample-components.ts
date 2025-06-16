// Sample React component for testing
export const sampleReactComponent = `
import React, { useState } from 'react';

interface UserProfileProps {
  userId: string;
  onSave?: (data: any) => void;
}

export default function UserProfile({ userId, onSave }: UserProfileProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('John Doe');

  const handleSave = () => {
    onSave?.({ name });
    setEditing(false);
  };

  return (
    <div className="user-profile" data-testid="user-profile">
      <h1>User Profile</h1>
      {editing ? (
        <div>
          <input 
            data-testid="name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button data-testid="save-button" onClick={handleSave}>
            Save
          </button>
          <button onClick={() => setEditing(false)}>
            Cancel
          </button>
        </div>
      ) : (
        <div>
          <p id="user-name">{name}</p>
          <button data-testid="edit-button" onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
}
`;

// Sample dashboard component
export const sampleDashboardComponent = `
import React from 'react';
import StatsCard from './StatsCard';

export default function Dashboard() {
  const refreshData = () => {
    console.log('Refreshing dashboard data...');
  };

  return (
    <div className="dashboard" data-testid="dashboard">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <StatsCard title="Users" value="1,234" />
        <StatsCard title="Revenue" value="$45,678" />
      </div>
      <button 
        data-testid="refresh-button" 
        onClick={refreshData}
        aria-label="Refresh dashboard data"
      >
        Refresh
      </button>
    </div>
  );
}
`;

// Sample component with complex interactions
export const sampleComplexComponent = `
import React, { useState, useEffect } from 'react';

export default function DataTable() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    // Simulate data loading
    setData([
      { id: 1, name: 'John', email: 'john@example.com' },
      { id: 2, name: 'Jane', email: 'jane@example.com' }
    ]);
  }, []);

  const filteredData = data.filter(item => 
    item.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="data-table" data-testid="data-table">
      <div className="controls">
        <input
          data-testid="filter-input"
          placeholder="Filter by name..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <select 
          data-testid="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name">Sort by Name</option>
          <option value="email">Sort by Email</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map(item => (
            <tr key={item.id} data-testid={\`row-\${item.id}\`}>
              <td>{item.name}</td>
              <td>{item.email}</td>
              <td>
                <button 
                  data-testid={\`edit-\${item.id}\`}
                  onClick={() => console.log('Edit', item.id)}
                >
                  Edit
                </button>
                <button 
                  data-testid={\`delete-\${item.id}\`}
                  onClick={() => console.log('Delete', item.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
`;

// Directory structure for testing
export const sampleProjectStructure = {
  'src/features/UserProfile/UserProfile.tsx': sampleReactComponent,
  'src/features/UserProfile/index.ts': 'export { default } from "./UserProfile";',
  'src/features/Dashboard/Dashboard.tsx': sampleDashboardComponent,
  'src/features/Dashboard/StatsCard.tsx': `
    interface StatsCardProps {
      title: string;
      value: string;
    }
    
    export default function StatsCard({ title, value }: StatsCardProps) {
      return (
        <div className="stats-card" data-testid={\`stats-\${title.toLowerCase()}\`}>
          <h3>{title}</h3>
          <p>{value}</p>
        </div>
      );
    }
  `,
  'src/pages/HomePage.tsx': `
    import React from 'react';
    
    export default function HomePage() {
      return (
        <div data-testid="home-page">
          <h1>Welcome</h1>
          <nav>
            <a href="/dashboard" data-testid="dashboard-link">Dashboard</a>
            <a href="/profile" data-testid="profile-link">Profile</a>
          </nav>
        </div>
      );
    }
  `,
  'src/components/DataTable.tsx': sampleComplexComponent,
  'package.json': JSON.stringify({
    name: 'test-project',
    dependencies: {
      'react': '^18.0.0',
      'react-dom': '^18.0.0'
    }
  }, null, 2)
};