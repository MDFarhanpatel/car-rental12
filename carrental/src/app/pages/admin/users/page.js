"use client";
import React, { useState, useRef } from "react";
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

const roles = [
  { label: "Admin", value: "ADMIN" },
  { label: "SuperAdmin", value: "SUPERADMIN" },
  { label: "Customer", value: "CUSTOMER" },
  { label: "Mechanic", value: "MECHANIC" },
];

const INITIAL_USERS = [
  {
    id: 1,
    name: "jack ali",
    email: "jack@gmail.com",
    role: "ADMIN",
    status: "Active",
  },
  {
    id: 2,
    name: "james lora",
    email: "lora@gmail.com",
    role: "HOSTER",
    status: "Inactive",
  },
  {
    id: 3,
    name: "farhan",
    email: "farhan@gmail.com",
    role: "CUSTOMER",
    status: "Active",
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [addForm, setAddForm] = useState({
    email: "",
    name: "",
    password: "",
    role: "",
  });
  const [editForm, setEditForm] = useState({ email: "", name: "", role: "" });
  const [addErrors, setAddErrors] = useState({ email: "", name: "", role: "" });
  const [editErrors, setEditErrors] = useState({
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

  // Role & Status badges
  const roleTemplate = (row) => (
    <Chip
      label={row.role}
      className="font-bold px-2 py-1 rounded-lg bg-gradient-to-r from-fuchsia-700 to-purple-600 text-white"
    />
  );
  const statusTemplate = (row) => (
    <Tag
      value={row.status}
      severity={row.status === "Active" ? "success" : "danger"}
      className="text-md px-3 py-1"
    />
  );
  const actionBody = (row) =>
    row.role === "ADMIN" && (
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
    );

  // Add user handlers
  const openAdd = () => {
    setAddForm({ email: "", name: "", password: "", role: "" });
    setAddErrors({ email: "", name: "", role: "" });
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
  const saveAdd = () => {
    const errors = {
      email: validateField("email", addForm.email),
      name: validateField("name", addForm.name),
      role: validateField("role", addForm.role),
    };
    setAddErrors(errors);
    if (errors.email || errors.name || errors.role) return;
    setUsers([
      ...users,
      { id: users.length + 1, ...addForm, status: "Active" },
    ]);
    setShowAdd(false);
    toast.current.show({
      severity: "success",
      summary: "User Added",
      detail: `${addForm.name} was added successfully!`,
      life: 2100,
    });
  };

  // Edit user handlers
  const openEdit = (row) => {
    setSelectedUser(row);
    setEditForm({ email: row.email, name: row.name, role: row.role });
    setEditErrors({ email: "", name: "", role: "" });
    setShowEdit(true);
  };
  const handleEditChange = (e) => {
    const { name, value } = e.target
      ? e.target
      : { name: "role", value: e.value };
    setEditForm((prev) => ({ ...prev, [name]: value }));
    setEditErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };
  const saveEdit = () => {
    const errors = {
      email: validateField("email", editForm.email),
      name: validateField("name", editForm.name),
      role: validateField("role", editForm.role),
    };
    setEditErrors(errors);
    if (errors.email || errors.name || errors.role) return;
    setUsers(
      users.map((user) =>
        user.id === selectedUser.id ? { ...user, ...editForm } : user
      )
    );
    setShowEdit(false);
    toast.current.show({
      severity: "success",
      summary: "User Updated",
      detail: "User information saved!",
      life: 2100,
    });
  };

  const activeCount = users.filter((u) => u.status === "Active").length;
  const inactiveCount = users.filter((u) => u.status !== "Active").length;

  const addSaveDisabled =
    !addForm.email.trim() ||
    !addForm.name.trim() ||
    !addForm.role ||
    addErrors.email ||
    addErrors.name ||
    addErrors.role;
  const editSaveDisabled =
    !editForm.email.trim() ||
    !editForm.name.trim() ||
    !editForm.role ||
    editErrors.email ||
    editErrors.name ||
    editErrors.role;

  return (
    <div className="p-4 min-h-screen bg-gradient-to-r from-gray-950 via-gray-900 to-fuchsia-900 font-sans">
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
        Users
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
          rows={5}
          className="p-datatable-sm text-white"
          emptyMessage="No users found."
        >
          <Column
            field="name"
            header={<span className="font-bold text-base">Name</span>}
          />
          <Column
            field="email"
            header={<span className="font-bold text-base">Email</span>}
          />
          <Column
            field="role"
            header={<span className="font-bold text-base">Role</span>}
            body={roleTemplate}
          />
          <Column
            field="status"
            header={<span className="font-bold text-base">Status</span>}
            body={statusTemplate}
          />
          <Column
            header={<span className="font-bold text-base">Actions</span>}
            body={actionBody}
          />
        </DataTable>
      </div>

      {/* Add User Drawer */}
      <Dialog
        header={
          <span className="text-xl font-extrabold text-fuchsia-700">
            Add User
          </span>
        }
        visible={showAdd}
        position="right"
        style={{ width: "380px", maxWidth: "100vw" }}
        modal
        blockScroll
        className="rounded-lg shadow-xl"
        onHide={() => setShowAdd(false)}
      >
        <form className="flex flex-col gap-2 p-1">
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
            Password
          </label>
          <InputText
            name="password"
            type="password"
            className="w-full p-2 text-base rounded-lg"
            value={addForm.password}
            onChange={handleAddChange}
            placeholder="Password"
          />

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

      {/* Edit User Drawer */}
      <Dialog
        header={
          <span className="text-xl font-extrabold text-fuchsia-700">
            Edit User
          </span>
        }
        visible={showEdit}
        position="right"
        style={{ width: "380px", maxWidth: "100vw" }}
        modal
        blockScroll
        className="rounded-lg shadow-xl"
        onHide={() => setShowEdit(false)}
      >
        <form className="flex flex-col gap-2 p-1">
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
