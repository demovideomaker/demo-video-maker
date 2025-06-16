import React, { useState } from 'react';
import Layout from '@/components/Layout';
import UserTable from '@/features/UserManagement/UserTable';
import UserFilters from '@/features/UserManagement/UserFilters';
import AddUserModal from '@/features/UserManagement/AddUserModal';

export default function UsersPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    role: 'all',
    search: ''
  });

  return (
    <Layout>
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h1>User Management</h1>
            <p>Manage user accounts, roles, and permissions</p>
          </div>
          <button
            data-testid="add-user-button"
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            Add New User
          </button>
        </div>
      </div>

      <UserFilters filters={filters} setFilters={setFilters} />
      <UserTable filters={filters} />

      {showAddModal && (
        <AddUserModal onClose={() => setShowAddModal(false)} />
      )}
    </Layout>
  );
}