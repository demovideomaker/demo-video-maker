import React, { useState } from 'react';

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('John Doe');

  return (
    <div className="profile-page">
      <h1>User Profile</h1>
      <div className="profile-content">
        {editing ? (
          <div>
            <input 
              data-testid="name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button data-testid="save-profile" onClick={() => setEditing(false)}>
              Save
            </button>
          </div>
        ) : (
          <div>
            <p id="user-name">{name}</p>
            <button data-testid="edit-profile" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}