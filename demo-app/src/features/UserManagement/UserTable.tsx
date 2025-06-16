import React, { useState } from 'react';

interface UserFilters {
  status: string;
  role: string;
  search: string;
}

interface UserTableProps {
  filters: UserFilters;
}

const UserTable: React.FC<UserTableProps> = ({ filters }) => {
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', lastLogin: '2 hours ago' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'Active', lastLogin: '1 day ago' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Viewer', status: 'Inactive', lastLogin: '1 week ago' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Editor', status: 'Active', lastLogin: '3 hours ago' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Admin', status: 'Active', lastLogin: '5 minutes ago' },
  ];

  const filteredUsers = users.filter(user => {
    if (filters.status !== 'all' && user.status.toLowerCase() !== filters.status) return false;
    if (filters.role !== 'all' && user.role.toLowerCase() !== filters.role) return false;
    if (filters.search && !user.name.toLowerCase().includes(filters.search.toLowerCase()) && 
        !user.email.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3>Users ({filteredUsers.length})</h3>
        {selectedUsers.length > 0 && (
          <div className="flex gap-2">
            <button data-testid="bulk-activate" className="btn btn-secondary">
              Activate Selected
            </button>
            <button data-testid="bulk-deactivate" className="btn btn-secondary">
              Deactivate Selected
            </button>
            <button data-testid="bulk-delete" className="btn btn-danger">
              Delete Selected
            </button>
          </div>
        )}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUsers(filteredUsers.map(u => u.id));
                    } else {
                      setSelectedUsers([]);
                    }
                  }}
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                />
              </th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} data-testid={`user-row-${user.id}`}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                  />
                </td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className="badge">{user.role}</span>
                </td>
                <td>
                  <span className={`badge ${user.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                    {user.status}
                  </span>
                </td>
                <td>{user.lastLogin}</td>
                <td>
                  <div className="flex gap-2">
                    <button 
                      data-testid={`edit-user-${user.id}`}
                      className="btn btn-secondary"
                      style={{ padding: '5px 10px', fontSize: '14px' }}
                      onClick={() => alert(`Edit user: ${user.name}`)}
                    >
                      Edit
                    </button>
                    <button 
                      data-testid={`delete-user-${user.id}`}
                      className="btn btn-danger"
                      style={{ padding: '5px 10px', fontSize: '14px' }}
                      onClick={() => alert(`Delete user: ${user.name}`)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;