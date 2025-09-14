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
  const [isMobile, setIsMobile] = useState(false);
  const toast = useRef(null);

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
  });
  const [addErrors, setAddErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/users");
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: err.message || "Failed to load users",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  }

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
        aria-label="Edit"
        style={{ background: "linear-gradient(to right, #7F1DFF 40%, #CA25A7 100%)" }}
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

  const validateField = (field, value) =>
    !value || value.trim() === ""
      ? `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`
      : "";

  function handleAddChange(e) {
    const { name, value } = e.target ? e.target : { name: "role", value: e.value };
    setAddForm((prev) => ({ ...prev, [name]: value }));
    setAddErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  }

  function handleEditChange(e) {
    const { name, value } = e.target ? e.target : { name: "role", value: e.value };
    setEditForm((prev) => ({ ...prev, [name]: value }));
    setEditErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  }

  const openAdd = () => {
    setAddForm({ username: "", email: "", name: "", password: "", role: "" });
    setAddErrors({});
    setShowAdd(true);
  };

  async function saveAdd() {
    const errors = {
      username: validateField("username", addForm.username),
      email: validateField("email", addForm.email),
      name: validateField("name", addForm.name),
      password: validateField("password", addForm.password),
      role: validateField("role", addForm.role),
    };
    setAddErrors(errors);
    if (Object.values(errors).some((e) => e)) return;

    try {
      const res = await fetch("/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (res.ok) {
        setShowAdd(false);
        fetchUsers();
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
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to add user",
        life: 3000,
      });
    }
  }

  const openEdit = (row) => {
    setSelectedUser(row);
    setEditForm({
      username: row.username,
      email: row.email || "",
      name: row.name,
      role: row.role_id,
    });
    setEditErrors({});
    setShowEdit(true);
  };

  async function saveEdit() {
    const errors = {
      username: validateField("username", editForm.username),
      email: validateField("email", editForm.email),
      name: validateField("name", editForm.name),
      role: validateField("role", editForm.role),
    };
    setEditErrors(errors);
    if (Object.values(errors).some((e) => e)) return;

    try {
      const res = await fetch(`/api/v1/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: editForm.username,
          email: editForm.email,
          name: editForm.name,
          role_id: editForm.role,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowEdit(false);
        fetchUsers();
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
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update user",
        life: 3000,
      });
    }
  }

  async function deleteUser(user) {
    if (!window.confirm(`Are you sure you want to delete ${user.name}?`)) return;
    try {
      const res = await fetch(`/api/v1/users/${user.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchUsers();
        toast.current?.show({
          severity: "success",
          summary: "User Deleted",
          detail: `${user.name} was deleted successfully!`,
          life: 2100,
        });
      } else {
        throw new Error("Failed to delete user");
      }
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete user",
        life: 3000,
      });
    }
  }

  const activeCount = users.filter((u) => u.is_active).length;
  const inactiveCount = users.length - activeCount;

  const addSaveDisabled =
    !addForm.username.trim() ||
    !addForm.email.trim() ||
    !addForm.name.trim() ||
    !addForm.password.trim() ||
    !addForm.role ||
    Object.values(addErrors).some((error) => error);

  const editSaveDisabled =
    !editForm.username.trim() ||
    !editForm.email.trim() ||
    !editForm.name.trim() ||
    !editForm.role ||
    Object.values(editErrors).some((error) => error);

  return (
    <div className="p-2 sm:p-4 min-h-screen bg-gradient-to-r from-gray-900 via-purple-900 to-purple-800 font-sans">
      <Toast ref={toast} />
      <div className="mb-2 sm:mb-4">
        <BreadCrumb
          model={[
            { label: "Home", command: () => (window.location.href = "/pages/home") },
            { label: "Admin", command: () => (window.location.href = "/admin/users") },
            { label: "Users" },
          ]}
          home={{ icon: "pi pi-home", command: () => (window.location.href = "/") }}
          className="text-white font-bold mb-2"
        />
      </div>
      <div className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-wide">
        Users Management
      </div>
      <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6 items-center">
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
          className="ml-auto bg-gradient-to-r from-fuchsia-700 to-purple-600 border-none font-extrabold px-4 sm:px-6 py-2 text-sm sm:text-lg rounded-lg hover:scale-105 transition-transform"
          onClick={openAdd}
        />
      </div>
      <div className="bg-zinc-900 p-4 sm:p-6 rounded-2xl shadow-2xl overflow-x-auto">
        <DataTable
          value={users}
          stripedRows
          paginator
          rows={10}
          loading={loading}
          className="p-datatable-sm text-white"
          emptyMessage="No users found."
        >
          <Column field="name" header="Name" />
          <Column field="username" header="Username" />
          <Column field="email" header="Email" />
          <Column field="role_id" header="Role" body={roleTemplate} />
          <Column field="is_active" header="Status" body={statusTemplate} />
          <Column header="Actions" body={actionBody} />
        </DataTable>
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
        <form className="flex flex-col gap-2 p-1">
          <label className="font-bold text-sm sm:text-base text-gray-700 mt-1">
            Username <span className="text-red-600">*</span>
          </label>
          <InputText
            name="username"
            value={addForm.username}
            className={`w-full p-2 text-sm sm:text-base rounded-lg ${addErrors.username && "border border-red-500"}`}
            onChange={handleAddChange}
            placeholder="Username"
          />
          {addErrors.username && <small className="text-red-500">{addErrors.username}</small>}

          <label className="font-bold text-sm sm:text-base text-gray-700 mt-1">
            Name <span className="text-red-600">*</span>
          </label>
          <InputText
            name="name"
            value={addForm.name}
            className={`w-full p-2 text-sm sm:text-base rounded-lg ${addErrors.name && "border border-red-500"}`}
            onChange={handleAddChange}
            placeholder="Full Name"
          />
          {addErrors.name && <small className="text-red-500">{addErrors.name}</small>}

          <label className="font-bold text-sm sm:text-base text-gray-700 mt-1">
            Email <span className="text-red-600">*</span>
          </label>
          <InputText
            name="email"
            type="email"
            value={addForm.email}
            className={`w-full p-2 text-sm sm:text-base rounded-lg ${addErrors.email && "border border-red-500"}`}
            onChange={handleAddChange}
            placeholder="Email"
          />
          {addErrors.email && <small className="text-red-500">{addErrors.email}</small>}

          <label className="font-bold text-sm sm:text-base text-gray-700 mt-1">
            Password <span className="text-red-600">*</span>
          </label>
          <InputText
            name="password"
            type="password"
            value={addForm.password}
            className={`w-full p-2 text-sm sm:text-base rounded-lg ${addErrors.password && "border border-red-500"}`}
            onChange={handleAddChange}
            placeholder="Password"
          />
          {addErrors.password && <small className="text-red-500">{addErrors.password}</small>}

          <label className="font-bold text-sm sm:text-base text-gray-700 mt-1">
            Role <span className="text-red-600">*</span>
          </label>
          <Dropdown
            name="role"
            options={roles}
            className={`w-full p-1 text-sm sm:text-base rounded-lg mt-1 ${addErrors.role && "border border-red-500"}`}
            value={addForm.role}
            onChange={handleAddChange}
            placeholder="Select Role"
            panelClassName="z-50"
          />
          {addErrors.role && <small className="text-red-500">{addErrors.role}</small>}
        </form>
        <div className="flex justify-end gap-3 mt-5">
          <Button label="Save" onClick={saveAdd} disabled={addSaveDisabled} className="bg-gradient-to-r from-fuchsia-700 to-purple-700 border-none font-extrabold px-4 sm:px-6 py-2 text-sm sm:text-base rounded-lg" />
          <Button label="Cancel" onClick={() => setShowAdd(false)} className="bg-gray-400 border-none font-extrabold px-4 sm:px-6 py-2 text-sm sm:text-base rounded-lg" />
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
        <form className="flex flex-col gap-2 p-1">
          <label className="font-bold text-sm sm:text-base text-gray-700 mt-1">
            Username <span className="text-red-600">*</span>
          </label>
          <InputText
            name="username"
            value={editForm.username}
            className={`w-full p-2 text-sm sm:text-base rounded-lg ${editErrors.username && "border border-red-500"}`}
            onChange={handleEditChange}
            placeholder="Username"
          />
          {editErrors.username && <small className="text-red-500">{editErrors.username}</small>}

          <label className="font-bold text-sm sm:text-base text-gray-700 mt-1">
            Name <span className="text-red-600">*</span>
          </label>
          <InputText
            name="name"
            value={editForm.name}
            className={`w-full p-2 text-sm sm:text-base rounded-lg ${editErrors.name && "border border-red-500"}`}
            onChange={handleEditChange}
            placeholder="Full Name"
          />
          {editErrors.name && <small className="text-red-500">{editErrors.name}</small>}

          <label className="font-bold text-sm sm:text-base text-gray-700 mt-1">
            Email <span className="text-red-600">*</span>
          </label>
          <InputText
            name="email"
            type="email"
            value={editForm.email}
            className={`w-full p-2 text-sm sm:text-base rounded-lg ${editErrors.email && "border border-red-500"}`}
            onChange={handleEditChange}
            placeholder="Email"
          />
          {editErrors.email && <small className="text-red-500">{editErrors.email}</small>}

          <label className="font-bold text-sm sm:text-base text-gray-700 mt-1">
            Role <span className="text-red-600">*</span>
          </label>
          <Dropdown
            name="role"
            options={roles}
            className={`w-full p-1 text-sm sm:text-base rounded-lg mt-1 ${editErrors.role && "border border-red-500"}`}
            value={editForm.role}
            onChange={handleEditChange}
            placeholder="Select Role"
            panelClassName="z-50"
          />
          {editErrors.role && <small className="text-red-500">{editErrors.role}</small>}
        </form>
        <div className="flex justify-end gap-3 mt-5">
          <Button label="Save" onClick={saveEdit} disabled={editSaveDisabled} className="bg-gradient-to-r from-fuchsia-700 to-purple-700 border-none font-extrabold px-4 sm:px-6 py-2 text-sm sm:text-base rounded-lg" />
          <Button label="Cancel" onClick={() => setShowEdit(false)} className="bg-gray-400 border-none font-extrabold px-4 sm:px-6 py-2 text-sm sm:text-base rounded-lg" />
        </div>
      </Dialog>
    </div>
  );
}
