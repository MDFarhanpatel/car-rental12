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
import { Chip } from "primereact/chip";
import { BreadCrumb } from "primereact/breadcrumb";

// Updated roles to match your Prisma schema
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
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
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
    role: "" 
  });
  const [addErrors, setAddErrors] = useState({ 
    username: "", 
    email: "", 
    name: "", 
    password: "", // ← ADDED password error
    role: "" 
  });
  const [editErrors, setEditErrors] = useState({
    username: "",
    email: "",
    name: "",
    role: "",
  });
  const toast = useRef(null);

  const items = [
    { label: "Home", command: () => (window.location.href = "/pages/home") },
    { label: "Admin", command: () => (window.location.href = "/admin/users") },
    { label: "Users" },
  ];

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/v1/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load users",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Role & Status badges
  const roleTemplate = (row) => (
    <Chip
      label={row.role_id}
      className="font-bold px-2 py-1 rounded-lg bg-gradient-to-r from-fuchsia-700 to-purple-600 text-white"
    />
  );

  const statusTemplate = (row) => (
    <Tag
      value={row.is_active ? "Active" : "Inactive"}
      severity={row.is_active ? "success" : "danger"}
      className="text-md px-3 py-1"
    />
  );

  const actionBody = (row) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        rounded
        severity="secondary"
        className="p-button-sm"
        onClick={() => openEdit(row)}
        style={{
          background: "linear-gradient(to right, #7F1DFF 40%, #CA25A7 100%)",
        }}
        aria-label="Edit"
      />
      <Button
        icon="pi pi-trash"
        rounded
        severity="danger"
        className="p-button-sm"
        onClick={() => deleteUser(row)}
        aria-label="Delete"
      />
    </div>
  );

  // Add user handlers
  const openAdd = () => {
    setAddForm({ username: "", email: "", name: "", password: "", role: "" });
    setAddErrors({ username: "", email: "", name: "", password: "", role: "" }); // ← ADDED password error
    setShowAdd(true);
  };

  const validateField = (field, value) =>
    !value || value.trim() === ""
      ? `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`
      : "";

  const handleAddChange = (e) => {
    const { name, value } = e.target
      ? e.target
      : { name: "role", value: e.value };
    setAddForm((prev) => ({ ...prev, [name]: value }));
    setAddErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const saveAdd = async () => {
    const errors = {
      username: validateField("username", addForm.username),
      email: validateField("email", addForm.email),
      name: validateField("name", addForm.name),
      password: validateField("password", addForm.password), // ← ADDED password validation
      role: validateField("role", addForm.role),
    };
    setAddErrors(errors);
    
    if (Object.values(errors).some(error => error)) return;

    try {
      const response = await fetch("/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: addForm.username,
          email: addForm.email,
          name: addForm.name,
          password: addForm.password,
          role: addForm.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowAdd(false);
        fetchUsers(); // Refresh the users list
        toast.current?.show({
          severity: "success",
          summary: "User Added",
          detail: `${addForm.name} was added successfully!`,
          life: 2100,
        });
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
    }
  };

  // Edit user handlers
  const openEdit = (row) => {
    setSelectedUser(row);
    setEditForm({ 
      username: row.username,
      email: row.email || "",
      name: row.name, 
      role: row.role_id 
    });
    setEditErrors({ username: "", email: "", name: "", role: "" });
    setShowEdit(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target
      ? e.target
      : { name: "role", value: e.value };
    setEditForm((prev) => ({ ...prev, [name]: value }));
    setEditErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const saveEdit = async () => {
    const errors = {
      username: validateField("username", editForm.username),
      email: validateField("email", editForm.email),
      name: validateField("name", editForm.name),
      role: validateField("role", editForm.role),
    };
    setEditErrors(errors);
    
    if (Object.values(errors).some(error => error)) return;

    try {
      const response = await fetch(`/api/v1/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: editForm.username,
          email: editForm.email,
          name: editForm.name,
          role_id: editForm.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowEdit(false);
        fetchUsers(); // Refresh the users list
        toast.current?.show({
          severity: "success",
          summary: "User Updated",
          detail: "User information saved!",
          life: 2100,
        });
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
    }
  };

  // Delete user
  const deleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      try {
        const response = await fetch(`/api/v1/users/${user.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchUsers(); // Refresh the users list
          toast.current?.show({
            severity: "success",
            summary: "User Deleted",
            detail: `${user.name} was deleted successfully!`,
            life: 2100,
          });
        } else {
          throw new Error("Failed to delete user");
        }
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to delete user",
          life: 3000,
        });
      }
    }
  };

  const activeCount = users.filter((u) => u.is_active).length;
  const inactiveCount = users.filter((u) => !u.is_active).length;

  const addSaveDisabled =
    !addForm.username.trim() ||
    !addForm.email.trim() ||
    !addForm.name.trim() ||
    !addForm.password.trim() || // ← ADDED password check
    !addForm.role ||
    Object.values(addErrors).some(error => error);

  const editSaveDisabled =
    !editForm.username.trim() ||
    !editForm.email.trim() ||
    !editForm.name.trim() ||
    !editForm.role ||
    Object.values(editErrors).some(error => error);

  return (
    <div className="p-4 min-h-screen bg-gradient-to-r from-gray-900 via-purple-900 to-purple-800 font-sans">
      <Toast ref={toast} />
      <div className="mb-4">
        <BreadCrumb
          model={items}
          home={{
            icon: "pi pi-home",
            command: () => (window.location.href = "/"),
          }}
          className="text-white font-bold mb-2"
        />
      </div>
      <div className="text-3xl font-extrabold text-white mb-3 tracking-wide">
        Users Management
      </div>
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <span className="font-extrabold text-white flex items-center">
          <i className="pi pi-check mr-1" />
          {activeCount} Active
        </span>
        <span className="font-extrabold text-rose-400 flex items-center">
          <i className="pi pi-times mr-1" />
          {inactiveCount} Inactive
        </span>
        <span className="font-extrabold text-white flex items-center">
          <i className="pi pi-list mr-1" />
          {users.length} Total Users
        </span>
        <Button
          label="Add User"
          icon="pi pi-user-plus"
          className="ml-auto bg-gradient-to-r from-fuchsia-700 to-purple-600 border-none font-extrabold px-6 py-2 text-lg rounded-lg hover:scale-105 transition-transform"
          onClick={openAdd}
        />
      </div>
      <div className="bg-zinc-900 p-6 rounded-2xl shadow-2xl overflow-x-auto">
        <DataTable
          value={users}
          stripedRows
          paginator
          rows={10}
          loading={loading}
          className="p-datatable-sm text-white"
          emptyMessage="No users found."
        >
          <Column
            field="name"
            header={<span className="font-bold text-base">Name</span>}
          />
          <Column
            field="username"
            header={<span className="font-bold text-base">Username</span>}
          />
          <Column
            field="email"
            header={<span className="font-bold text-base">Email</span>}
          />
          <Column
            field="role_id"
            header={<span className="font-bold text-base">Role</span>}
            body={roleTemplate}
          />
          <Column
            field="is_active"
            header={<span className="font-bold text-base">Status</span>}
            body={statusTemplate}
          />
          <Column
            header={<span className="font-bold text-base">Actions</span>}
            body={actionBody}
          />
        </DataTable>
      </div>

      {/* Add User Dialog */}
      <Dialog
        header={
          <span className="text-xl font-extrabold text-fuchsia-700">
            Add User
          </span>
        }
        visible={showAdd}
        position="right"
        style={{ width: "400px", maxWidth: "100vw" }}
        modal
        blockScroll
        className="rounded-lg shadow-xl"
        onHide={() => setShowAdd(false)}
      >
        <form className="flex flex-col gap-2 p-1">
          <label className="font-bold text-base text-gray-700 mt-1">
            Username <span className="text-red-600">*</span>
          </label>
          <InputText
            name="username"
            value={addForm.username}
            className={`w-full p-2 text-base rounded-lg ${
              addErrors.username && "border border-red-500"
            }`}
            onChange={handleAddChange}
            placeholder="Username"
          />
          {addErrors.username && (
            <span className="text-red-500 text-xs font-semibold">
              {addErrors.username}
            </span>
          )}

          <label className="font-bold text-base text-gray-700 mt-1">
            Name <span className="text-red-600">*</span>
          </label>
          <InputText
            name="name"
            value={addForm.name}
            className={`w-full p-2 text-base rounded-lg ${
              addErrors.name && "border border-red-500"
            }`}
            onChange={handleAddChange}
            placeholder="Full Name"
          />
          {addErrors.name && (
            <span className="text-red-500 text-xs font-semibold">
              {addErrors.name}
            </span>
          )}

          <label className="font-bold text-base text-gray-700 mt-1">
            Email <span className="text-red-600">*</span>
          </label>
          <InputText
            name="email"
            type="email"
            value={addForm.email}
            className={`w-full p-2 text-base rounded-lg ${
              addErrors.email && "border border-red-500"
            }`}
            onChange={handleAddChange}
            placeholder="Email"
          />
          {addErrors.email && (
            <span className="text-red-500 text-xs font-semibold">
              {addErrors.email}
            </span>
          )}

          <label className="font-bold text-base text-gray-700 mt-1">
            Password <span className="text-red-600">*</span>
          </label>
          <InputText
            name="password"
            type="password"
            className={`w-full p-2 text-base rounded-lg ${
              addErrors.password && "border border-red-500"
            }`} // ← ADDED error styling
            value={addForm.password}
            onChange={handleAddChange}
            placeholder="Password"
          />
          {addErrors.password && ( // ← ADDED password error display
            <span className="text-red-500 text-xs font-semibold">
              {addErrors.password}
            </span>
          )}

          <label className="font-bold text-base text-gray-700 mt-1">
            Role <span className="text-red-600">*</span>
          </label>
          <Dropdown
            name="role"
            options={roles}
            className={`w-full p-1 text-base rounded-lg mt-1 ${
              addErrors.role && "border border-red-500"
            }`}
            value={addForm.role}
            onChange={handleAddChange}
            placeholder="Select Role"
            panelClassName="z-50"
          />
          {addErrors.role && (
            <span className="text-red-500 text-xs font-semibold">
              {addErrors.role}
            </span>
          )}
        </form>
        <div className="flex justify-end gap-3 mt-5">
          <Button
            label="Save"
            className="bg-gradient-to-r from-fuchsia-700 to-purple-700 border-none font-extrabold px-6 py-2 text-base rounded-lg"
            onClick={saveAdd}
            disabled={addSaveDisabled}
          />
          <Button
            label="Cancel"
            className="bg-gray-400 border-none font-extrabold px-6 py-2 text-base rounded-lg"
            onClick={() => setShowAdd(false)}
          />
        </div>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        header={
          <span className="text-xl font-extrabold text-fuchsia-700">
            Edit User
          </span>
        }
        visible={showEdit}
        position="right"
        style={{ width: "400px", maxWidth: "100vw" }}
        modal
        blockScroll
        className="rounded-lg shadow-xl"
        onHide={() => setShowEdit(false)}
      >
        <form className="flex flex-col gap-2 p-1">
          <label className="font-bold text-base text-gray-700 mt-1">
            Username <span className="text-red-600">*</span>
          </label>
          <InputText
            name="username"
            value={editForm.username}
            className={`w-full p-2 text-base rounded-lg ${
              editErrors.username && "border border-red-500"
            }`}
            onChange={handleEditChange}
            placeholder="Username"
          />
          {editErrors.username && (
            <span className="text-red-500 text-xs font-semibold">
              {editErrors.username}
            </span>
          )}

          <label className="font-bold text-base text-gray-700 mt-1">
            Name <span className="text-red-600">*</span>
          </label>
          <InputText
            name="name"
            value={editForm.name}
            className={`w-full p-2 text-base rounded-lg ${
              editErrors.name && "border border-red-500"
            }`}
            onChange={handleEditChange}
            placeholder="Full Name"
          />
          {editErrors.name && (
            <span className="text-red-500 text-xs font-semibold">
              {editErrors.name}
            </span>
          )}

          <label className="font-bold text-base text-gray-700 mt-1">
            Email <span className="text-red-600">*</span>
          </label>
          <InputText
            name="email"
            type="email"
            value={editForm.email}
            className={`w-full p-2 text-base rounded-lg ${
              editErrors.email && "border border-red-500"
            }`}
            onChange={handleEditChange}
            placeholder="Email"
          />
          {editErrors.email && (
            <span className="text-red-500 text-xs font-semibold">
              {editErrors.email}
            </span>
          )}

          <label className="font-bold text-base text-gray-700 mt-1">
            Role <span className="text-red-600">*</span>
          </label>
          <Dropdown
            name="role"
            options={roles}
            value={editForm.role}
            className={`w-full p-1 text-base rounded-lg mt-1 ${
              editErrors.role && "border border-red-500"
            }`}
            onChange={handleEditChange}
            placeholder="Select Role"
            panelClassName="z-50"
          />
          {editErrors.role && (
            <span className="text-red-500 text-xs font-semibold">
              {editErrors.role}
            </span>
          )}
        </form>
        <div className="flex justify-end gap-3 mt-5">
          <Button
            label="Save"
            className="bg-gradient-to-r from-fuchsia-700 to-purple-700 border-none font-extrabold px-6 py-2 text-base rounded-lg"
            onClick={saveEdit}
            disabled={editSaveDisabled}
          />
          <Button
            label="Cancel"
            className="bg-gray-400 border-none font-extrabold px-6 py-2 text-base rounded-lg"
            onClick={() => setShowEdit(false)}
          />
        </div>
      </Dialog>
    </div>
  );
}
