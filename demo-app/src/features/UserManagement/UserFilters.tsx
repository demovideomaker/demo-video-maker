import React from 'react';

interface UserFilters {
  status: string;
  role: string;
  search: string;
}

interface UserFiltersProps {
  filters: UserFilters;
  setFilters: (filters: UserFilters) => void;
}

const UserFilters: React.FC<UserFiltersProps> = ({ filters, setFilters }) => {
  return (
    <div className="card mb-4">
      <h3>Filters</h3>
      <div className="flex gap-4 mt-4">
        <div className="form-group" style={{ flex: 1 }}>
          <label>Search</label>
          <input
            data-testid="user-search"
            type="text"
            className="form-control"
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select
            data-testid="filter-status"
            className="form-control"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="form-group">
          <label>Role</label>
          <select
            data-testid="filter-role"
            className="form-control"
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
        <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            data-testid="clear-filters"
            className="btn btn-secondary"
            onClick={() => setFilters({ status: 'all', role: 'all', search: '' })}
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserFilters;