"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { BreadCrumb } from "primereact/breadcrumb";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

const roles = [
  { label: "User", value: "USER" },
  { label: "Admin", value: "ADMIN" },
  { label: "Hoster", value: "Hoster" },
  { label: "Driver", value: "Driver" },
  { label: "Provider", value: "provider" },
  { label: "Customer", value: "customer" },
  { label: "Mechanic", value: "mechanic" },
];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useRef(null);

  // Pagination states
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Search states
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState(-1);

  const [addForm, setAddForm] = useState({
    username: "",
    email: "",
    name: "",
    password: "",
    role: "",
  });

  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    name: "",
    role: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const breadcrumbItems = [
    { label: "Home", command: () => window.location.href = "/" },
    { label: "Admin", command: () => window.location.href = "/admin" },
    { label: "Users" },
  ];

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const skip = first;
      const limit = rows;
      const search = globalFilterValue;
      
      const url = `/api/v1/users?skip=${skip}&limit=${limit}&sortField=${sortField}&sortOrder=${sortOrder}&search=${encodeURIComponent(search)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setUsers(data.users || []);
      setTotalRecords(data.totalCount || 0);
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [first, rows, sortField, sortOrder]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFirst(0); // Reset to first page when searching
      fetchUsers();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [globalFilterValue]);

  // Handle pagination
  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  // Handle sorting
  const onSort = (event) => {
    setSortField(event.sortField);
    setSortOrder(event.sortOrder);
  };

  // Global filter change
  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setGlobalFilterValue('');
  };

  // Status template
  const statusBodyTemplate = (rowData) => {
    return (
      <Tag 
        value={rowData.is_active ? "Active" : "Inactive"} 
        severity={rowData.is_active ? "success" : "danger"}
        className="text-xs"
      />
    );
  };

  // Role template
  const roleBodyTemplate = (rowData) => {
    const getRoleSeverity = (role) => {
      switch (role) {
        case 'ADMIN': return 'danger';
        case 'USER': return 'info';
        case 'Hoster': return 'warning';
        case 'Driver': return 'success';
        default: return 'secondary';
      }
    };

    return (
      <Tag 
        value={rowData.role_id} 
        severity={getRoleSeverity(rowData.role_id)}
        className="text-xs"
      />
    );
  };

  // Actions template
  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          rounded
          severity="secondary"
          size="small"
          onClick={() => openEditDialog(rowData)}
          tooltip="Edit"
        />
        <Button
          icon="pi pi-trash"
          rounded
          severity="danger"
          size="small"
          onClick={() => confirmDelete(rowData)}
          tooltip="Delete"
        />
      </div>
    );
  };

  // Confirm delete
  const confirmDelete = (user) => {
    confirmDialog({
      message: `Are you sure you want to delete ${user.name}?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-trash',
      acceptClassName: 'p-button-danger',
      accept: () => deleteUser(user),
      rejectClassName: 'p-button-secondary',
    });
  };

  // Open dialogs
  const openAddDialog = () => {
    setAddForm({
      username: "",
      email: "",
      name: "",
      password: "",
      role: "",
    });
    setShowAdd(true);
  };

  const openEditDialog = (user) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role_id,
      password: "",
    });
    setShowEdit(true);
  };

  // Validate form
  const validateForm = (form, isEdit = false) => {
    const errors = {};
    
    if (!form.username.trim()) {
      errors.username = "Username is required";
    }
    
    if (!form.name.trim()) {
      errors.name = "Name is required";
    }
    
    if (!form.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = "Email is invalid";
    }
    
    if (!isEdit && !form.password.trim()) {
      errors.password = "Password is required";
    }
    
    if (!form.role) {
      errors.role = "Role is required";
    }
    
    return errors;
  };

  // Add user
  const addUser = async () => {
    const errors = validateForm(addForm);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setSaving(true);
    try {
      const response = await fetch('/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addForm),
      });

      const data = await response.json();

      if (response.ok) {
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "User added successfully",
          life: 3000,
        });
        setShowAdd(false);
        setAddForm({
          username: "",
          email: "",
          name: "",
          password: "",
          role: "",
        });
        fetchUsers();
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: data.message || "Failed to add user",
          life: 3000,
        });
      }
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to add user",
        life: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  // Update user
  const updateUser = async () => {
    const errors = validateForm(editForm, true);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setSaving(true);
    try {
      const response = await fetch(`/api/v1/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (response.ok) {
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "User updated successfully",
          life: 3000,
        });
        setShowEdit(false);
        setEditForm({
          username: "",
          email: "",
          name: "",
          role: "",
          password: "",
        });
        fetchUsers();
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: data.message || "Failed to update user",
          life: 3000,
        });
      }
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update user",
        life: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete user
  const deleteUser = async (user) => {
    try {
      const response = await fetch(`/api/v1/users/${user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "User deleted successfully",
          life: 3000,
        });
        fetchUsers();
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete user",
        life: 3000,
      });
    }
  };

  // Render header with search
  const renderHeader = () => {
    return (
      <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-white m-0">Users Management</h2>
          <Tag value={`${totalRecords} Total`} severity="info" />
        </div>
        
        <div className="flex gap-2 items-center">
          {/* Search Input with proper styling */}
          <div className="relative">
            <IconField iconPosition="left">
              <InputIcon className="pi pi-search text-gray-400" />
              <InputText
                value={globalFilterValue}
                onChange={onGlobalFilterChange}
                placeholder="Search users..."
                className="pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 placeholder-gray-400"
                style={{ 
                  minWidth: '250px',
                  paddingLeft: '2.5rem',
                  paddingRight: '2.5rem'
                }}
              />
              {globalFilterValue && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  type="button"
                >
                  <i className="pi pi-times text-sm"></i>
                </button>
              )}
            </IconField>
          </div>
          
          <Button
            label="Add User"
            icon="pi pi-plus"
            onClick={openAddDialog}
            className="bg-gradient-to-r from-blue-600 to-purple-600 border-none font-bold px-4 py-2 text-sm rounded-lg hover:scale-105 transition-transform"
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-gray-900 via-purple-900 to-purple-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-gray-900 via-purple-900 to-purple-800 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 via-purple-900 to-purple-800 font-sans">
      <Toast ref={toast} />
      <ConfirmDialog />
      
      <div className="p-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <BreadCrumb 
            model={breadcrumbItems} 
            home={{ icon: "pi pi-home", command: () => window.location.href = "/" }} 
            className="text-white font-bold"
          />
        </div>
        
        {/* Header with search */}
        {renderHeader()}
        
        {/* Users Table */}
        <div className="bg-zinc-900 p-4 sm:p-6 rounded-2xl shadow-2xl overflow-x-auto">
          <DataTable
            value={users}
            stripedRows
            paginator={false}
            rows={rows}
            loading={loading}
            className="p-datatable-sm text-white border-0"
            emptyMessage="No users found."
            first={first}
            rows={rows}
            totalRecords={totalRecords}
            onPage={onPageChange}
            onSort={onSort}
            sortField={sortField}
            sortOrder={sortOrder}
            globalFilter={globalFilterValue}
            globalFilterFields={["name", "username", "email", "role_id"]}
          >
            <Column field="name" header="Name" sortable />
            <Column field="username" header="Username" sortable />
            <Column field="email" header="Email" sortable />
            <Column field="role_id" header="Role" body={roleBodyTemplate} sortable />
            <Column field="is_active" header="Status" body={statusBodyTemplate} sortable />
            <Column header="Actions" body={actionBodyTemplate} />
          </DataTable>
          
          {/* Paginator */}
          <div className="flex flex-wrap justify-between items-center mt-4 gap-4">
            <div className="text-white text-sm">
              Showing {first + 1} to {Math.min(first + rows, totalRecords)} of {totalRecords} entries
            </div>
            <div className="flex gap-2">
              <Button 
                icon="pi pi-chevron-left" 
                className="p-button-text p-button-sm" 
                onClick={() => setFirst(Math.max(0, first - rows))}
                disabled={first === 0}
              />
              <Button 
                icon="pi pi-chevron-right" 
                className="p-button-text p-button-sm" 
                onClick={() => setFirst(Math.min(totalRecords - rows, first + rows))}
                disabled={first >= totalRecords - rows}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add User Dialog */}
      <Dialog
        header="Add User"
        visible={showAdd}
        position="right"
        style={{ width: 400, maxWidth: "100vw" }}
        modal
        blockScroll
        className="rounded-lg shadow-xl"
        onHide={() => setShowAdd(false)}
      >
        <form className="flex flex-col gap-4 p-1">
          <div className="mt-4">
            <label htmlFor="add-username" className="block text-sm text-gray-600 mb-1">Username <span className="text-red-600">*</span></label>
            <InputText
              id="add-username"
              name="username"
              value={addForm.username}
              className={`w-full p-3 text-sm sm:text-base rounded-lg border ${
                formErrors.username ? 'border-red-500' : 'border-gray-300'
              }`}
              onChange={(e) => setAddForm({...addForm, username: e.target.value})}
            />
            {formErrors.username && <span className="text-red-500 text-xs mt-1">{formErrors.username}</span>}
          </div>

          <div className="mt-2">
            <label htmlFor="add-name" className="block text-sm text-gray-600 mb-1">Full Name <span className="text-red-600">*</span></label>
            <InputText
              id="add-name"
              name="name"
              value={addForm.name}
              className={`w-full p-3 text-sm sm:text-base rounded-lg border ${
                formErrors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              onChange={(e) => setAddForm({...addForm, name: e.target.value})}
            />
            {formErrors.name && <span className="text-red-500 text-xs mt-1">{formErrors.name}</span>}
          </div>

          <div className="mt-2">
            <label htmlFor="add-email" className="block text-sm text-gray-600 mb-1">Email <span className="text-red-600">*</span></label>
            <InputText
              id="add-email"
              name="email"
              type="email"
              value={addForm.email}
              className={`w-full p-3 text-sm sm:text-base rounded-lg border ${
                formErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              onChange={(e) => setAddForm({...addForm, email: e.target.value})}
            />
            {formErrors.email && <span className="text-red-500 text-xs mt-1">{formErrors.email}</span>}
          </div>

          <div className="mt-2">
            <label htmlFor="add-password" className="block text-sm text-gray-600 mb-1">Password <span className="text-red-600">*</span></label>
            <InputText
              id="add-password"
              name="password"
              type="password"
              value={addForm.password}
              className={`w-full p-3 text-sm sm:text-base rounded-lg border ${
                formErrors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              onChange={(e) => setAddForm({...addForm, password: e.target.value})}
            />
            {formErrors.password && <span className="text-red-500 text-xs mt-1">{formErrors.password}</span>}
          </div>

          <div className="mt-2">
            <label htmlFor="add-role" className="block text-sm text-gray-600 mb-1">Role <span className="text-red-600">*</span></label>
            <Dropdown
              id="add-role"
              name="role"
              options={roles}
              className={`w-full rounded-lg border ${
                formErrors.role ? 'border-red-500' : 'border-gray-300'
              }`}
              value={addForm.role}
              onChange={(e) => setAddForm({...addForm, role: e.value})}
              panelClassName="z-50"
            />
            {formErrors.role && <span className="text-red-500 text-xs mt-1">{formErrors.role}</span>}
          </div>
        </form>
        <div className="flex justify-end gap-3 mt-5">
          <Button 
            label={saving ? "Saving..." : "Save"} 
            onClick={addUser} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 border-none font-extrabold px-4 sm:px-6 py-2 text-sm sm:text-base rounded-lg" 
            disabled={saving}
          />
          <Button 
            label="Cancel" 
            onClick={() => setShowAdd(false)} 
            className="bg-gray-400 border-none font-extrabold px-4 sm:px-6 py-2 text-sm sm:text-base rounded-lg" 
          />
        </div>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        header="Edit User"
        visible={showEdit}
        position="right"
        style={{ width: 400, maxWidth: "100vw" }}
        modal
        blockScroll
        className="rounded-lg shadow-xl"
        onHide={() => setShowEdit(false)}
      >
        <form className="flex flex-col gap-4 p-1">
          <div className="mt-4">
            <label htmlFor="edit-username" className="block text-sm text-gray-600 mb-1">Username <span className="text-red-600">*</span></label>
            <InputText
              id="edit-username"
              name="username"
              value={editForm.username}
              className={`w-full p-3 text-sm sm:text-base rounded-lg border ${
                formErrors.username ? 'border-red-500' : 'border-gray-300'
              }`}
              onChange={(e) => setEditForm({...editForm, username: e.target.value})}
            />
            {formErrors.username && <span className="text-red-500 text-xs mt-1">{formErrors.username}</span>}
          </div>

          <div className="mt-2">
            <label htmlFor="edit-name" className="block text-sm text-gray-600 mb-1">Full Name <span className="text-red-600">*</span></label>
            <InputText
              id="edit-name"
              name="name"
              value={editForm.name}
              className={`w-full p-3 text-sm sm:text-base rounded-lg border ${
                formErrors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
            />
            {formErrors.name && <span className="text-red-500 text-xs mt-1">{formErrors.name}</span>}
          </div>

          <div className="mt-2">
            <label htmlFor="edit-email" className="block text-sm text-gray-600 mb-1">Email <span className="text-red-600">*</span></label>
            <InputText
              id="edit-email"
              name="email"
              type="email"
              value={editForm.email}
              className={`w-full p-3 text-sm sm:text-base rounded-lg border ${
                formErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              onChange={(e) => setEditForm({...editForm, email: e.target.value})}
            />
            {formErrors.email && <span className="text-red-500 text-xs mt-1">{formErrors.email}</span>}
          </div>

          <div className="mt-2">
            <label htmlFor="edit-role" className="block text-sm text-gray-600 mb-1">Role <span className="text-red-600">*</span></label>
            <Dropdown
              id="edit-role"
              name="role"
              options={roles}
              className={`w-full rounded-lg border ${
                formErrors.role ? 'border-red-500' : 'border-gray-300'
              }`}
              value={editForm.role}
              onChange={(e) => setEditForm({...editForm, role: e.value})}
              panelClassName="z-50"
            />
            {formErrors.role && <span className="text-red-500 text-xs mt-1">{formErrors.role}</span>}
          </div>
        </form>
        <div className="flex justify-end gap-3 mt-5">
          <Button 
            label={saving ? "Saving..." : "Save"} 
            onClick={updateUser} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 border-none font-extrabold px-4 sm:px-6 py-2 text-sm sm:text-base rounded-lg" 
            disabled={saving}
          />
          <Button 
            label="Cancel" 
            onClick={() => setShowEdit(false)} 
            className="bg-gray-400 border-none font-extrabold px-4 sm:px-6 py-2 text-sm sm:text-base rounded-lg" 
          />
        </div>
      </Dialog>
    </div>
  );
}
