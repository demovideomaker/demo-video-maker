import React, { useState } from 'react';

interface AddUserModalProps {
  onClose: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'viewer',
    sendInvite: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Creating user: ${formData.name}`);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="card" style={{ width: '500px', maxWidth: '90%' }}>
        <div className="flex justify-between items-center mb-4">
          <h3>Add New User</h3>
          <button
            data-testid="close-modal"
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input
              data-testid="input-name"
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              data-testid="input-email"
              type="email"
              className="form-control"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Role</label>
            <select
              data-testid="input-role"
              className="form-control"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                data-testid="send-invite-checkbox"
                type="checkbox"
                checked={formData.sendInvite}
                onChange={(e) => setFormData({ ...formData, sendInvite: e.target.checked })}
              />
              Send invitation email
            </label>
          </div>

          <div className="flex gap-2 justify-between mt-4">
            <button
              data-testid="cancel-button"
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              data-testid="submit-button"
              type="submit"
              className="btn btn-primary"
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;