"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { BreadCrumb } from "primereact/breadcrumb";
import { ProgressBar } from "primereact/progressbar";
import { Checkbox } from "primereact/checkbox";
import { PrimeReactProvider } from "primereact/api";
import { Sidebar } from "primereact/sidebar";

// PrimeReact configuration
const primeReactConfig = {
  ripple: true,
  inputStyle: "outlined",
  locale: "en"
};

export default function ChecklistOptionsPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    description: "",
    checkType: "BOOLEAN",
    required: false,
    active: true,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const toast = useRef(null);

  const breadcrumbItems = [
    { label: "Home", command: () => window.location.href = "/" },
    { label: "Admin", command: () => window.location.href = "/admin" },
    { label: "Checklist Items" },
  ];

  const checkTypes = [
    { label: "Yes/No", value: "BOOLEAN" },
    { label: "Text", value: "TEXT" },
    { label: "Number", value: "NUMBER" },
    { label: "Dropdown", value: "DROPDOWN" },
    { label: "Rating", value: "RATING" }
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUser(payload);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const isAdmin = () => currentUser?.role_id === "ADMIN" || currentUser?.role === "ADMIN";

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/v1/checklistitems");
      if (!response.ok) throw new Error(`Failed to fetch items: ${response.status}`);
      const data = await response.json();
      setItems(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to fetch checklist items",
        life: 3000,
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/v1/checklistcategories");
      if (!response.ok) throw new Error(`Failed to fetch categories: ${response.status}`);
      const data = await response.json();
      setCategories(
        (data.data || [])
          .filter(cat => cat && cat.active && cat.name && cat.id)
          .map(cat => ({ label: cat.name, value: cat.id }))
      );
    } catch (error) {
      setCategories([]);
      toast.current?.show({
        severity: "warn",
        summary: "Warning",
        detail: "Could not load categories. Please refresh the page.",
        life: 3000,
      });
    }
  };

  // Add Item sidebar opens for new item
  const openAdd = () => {
    setForm({
      name: "",
      categoryId: "",
      description: "",
      checkType: "BOOLEAN",
      required: false,
      active: true,
    });
    setErrors({});
    setEditingItem(null);
    setShowSidebar(true);
  };

  // Sidebar opens for editing existing item
  const openEdit = (item) => {
    if (!item) return;
    setForm({
      name: item.name || "",
      categoryId: item.categoryId || "",
      description: item.description || "",
      checkType: item.checkType || "BOOLEAN",
      required: !!item.required,
      active: !!item.active,
    });
    setErrors({});
    setEditingItem(item);
    setShowSidebar(true);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name || !form.name.trim()) newErrors.name = "Item Name is required.";
    if (!form.categoryId) newErrors.categoryId = "Category is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveItem = async () => {
    if (!validate()) return;
    try {
      setSaving(true);
      const url = editingItem
        ? `/api/v1/checklistitems/${editingItem.id}`
        : "/api/v1/checklistitems";
      const method = editingItem ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, name: form.name.trim() }),
      });
      const data = await response.json();
      if (!response.ok || !data.success)
        throw new Error(data.error || `Failed to ${editingItem ? "update" : "add"} item`);
      await fetchItems();
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: `Item "${form.name}" ${editingItem ? "updated" : "added"} successfully`,
        life: 3000,
      });
      setShowSidebar(false);
      setEditingItem(null);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message || `Failed to ${editingItem ? "update" : "add"} item`,
        life: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (item) => {
    if (!item || !item.id) return;
    if (!isAdmin()) {
      toast.current?.show({
        severity: "warn",
        summary: "Access Denied",
        detail: "Only administrators can delete items",
        life: 3000,
      });
      return;
    }
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;
    try {
      const response = await fetch(`/api/v1/checklistitems/${item.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok || !data.success)
        throw new Error(data.error || "Failed to delete item");
      await fetchItems();
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: `Item "${item.name}" deleted successfully`,
        life: 3000,
      });
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to delete item",
        life: 3000,
      });
    }
  };

  // custom columns
  function actionBodyTemplate(rowData) {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          rounded
          severity="secondary"
          className="p-button-sm"
          onClick={() => openEdit(rowData)}
          aria-label="Edit"
        />
        {isAdmin() && (
          <Button
            icon="pi pi-trash"
            rounded
            severity="danger"
            className="p-button-sm"
            onClick={() => deleteItem(rowData)}
            aria-label="Delete"
          />
        )}
      </div>
    );
  }
  function statusBodyTemplate(rowData) {
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${
          rowData.active ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}
      >
        {rowData.active ? "Active" : "Inactive"}
      </span>
    );
  }
  function categoryBodyTemplate(rowData) {
    return (
      <span className="text-blue-300">
        {rowData.category?.name || "Unknown"}
      </span>
    );
  }
  function checkTypeBodyTemplate(rowData) {
    const typeLabels = {
      BOOLEAN: "Yes/No",
      TEXT: "Text",
      NUMBER: "Number",
      DROPDOWN: "Dropdown",
      RATING: "Rating",
    };
    return (
      <span className="text-purple-300">
        {typeLabels[rowData.checkType] || rowData.checkType}
      </span>
    );
  }
  function requiredBodyTemplate(rowData) {
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${
          rowData.required ? "bg-orange-500 text-white" : "bg-gray-500 text-white"
        }`}
      >
        {rowData.required ? "Required" : "Optional"}
      </span>
    );
  }

  // Sidebar for Add/Edit
  const sidebarFooter = (
    <div className="flex gap-3 justify-end mt-3">
      <Button
        label="Cancel"
        className="p-button-secondary"
        onClick={() => setShowSidebar(false)}
        disabled={saving}
      />
      <Button
        label={editingItem ? "Save Changes" : "Add Item"}
        className="p-button-success"
        onClick={saveItem}
        disabled={saving}
        loading={saving}
      />
    </div>
  );

  return (
    <PrimeReactProvider value={primeReactConfig}>
      <div className="p-4 min-h-screen bg-gradient-to-r from-gray-900 via-purple-900 to-purple-800 font-sans">
        <Toast ref={toast} />
        <div className="mb-4">
          <BreadCrumb
            model={breadcrumbItems}
            home={{
              icon: "pi pi-home",
              command: () => (window.location.href = "/"),
            }}
            className="text-white font-bold"
          />
        </div>

        {/* Title row with Add button at top right */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-3xl font-extrabold text-white">Checklist Items</span>
          {isAdmin() && (
            <Button
              label="Add Item"
              icon="pi pi-plus"
              className="bg-black border-none font-bold"
              onClick={openAdd}
            />
          )}
        </div>

        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <span className="font-extrabold text-green-400 flex items-center">
            <i className="pi pi-check mr-1" />
            {items.filter((item) => item.active).length} Active
          </span>
          <span className="font-extrabold text-rose-400 flex items-center">
            <i className="pi pi-times mr-1" />
            {items.filter((item) => !item.active).length} Inactive
          </span>
          <span className="font-extrabold text-indigo-200 flex items-center">
            <i className="pi pi-list mr-1" />
            {items.length} Total Checklist Items
          </span>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl shadow-2xl overflow-x-auto">
          <DataTable
            value={items}
            stripedRows
            paginator
            rows={5}
            className="p-datatable-sm text-white"
            emptyMessage="No checklist items found."
          >
            <Column field="name" header="Item Name" />
            <Column body={categoryBodyTemplate} header="Category" />
            <Column body={checkTypeBodyTemplate} header="Check Type" />
            <Column body={requiredBodyTemplate} header="Required" />
            <Column body={statusBodyTemplate} header="Status" />
            <Column body={actionBodyTemplate} header="Actions" />
          </DataTable>
        </div>

        {/* Add/Edit Sidebar */}
        <Sidebar
          visible={showSidebar}
          onHide={() => setShowSidebar(false)}
          position="right"
          className="bg-zinc-800 border-l border-purple-500"
          style={{ width: "380px" }}
          header={editingItem ? "Edit Item" : "Add Item"}
          footer={sidebarFooter}
        >
          <form className="flex flex-col gap-3 p-1">
            <InputText
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Item Name"
              className={`w-full p-2 rounded-lg mt-3 ${
                errors.name ? "border border-red-500" : ""
              }`}
              autoFocus
            />
            {errors.name && <small className="text-red-500">{errors.name}</small>}

            <label className="font-bold text-gray-700 ml-1 mt-1">Category</label>
            <Dropdown
              value={form.categoryId}
              options={categories}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.value }))}
              placeholder="Select Category"
              className={`w-full p-2 rounded-lg mt-2 ${
                errors.categoryId ? "border border-red-500" : ""
              }`}
              panelClassName="border-2 border-purple-400"
              style={{ borderColor: "#a78bfa" }}
            />
            {errors.categoryId && (
              <small className="text-red-500">{errors.categoryId}</small>
            )}

            <label className="font-bold text-gray-700 ml-1 mt-1">Description</label>
            <InputText
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Description (optional)"
              className="w-full p-2 rounded-lg mt-2"
            />

            <label className="font-bold text-gray-700 ml-1 mt-1">Check Type</label>
            <Dropdown
              value={form.checkType}
              options={checkTypes}
              onChange={(e) => setForm((f) => ({ ...f, checkType: e.value }))}
              placeholder="Select Check Type"
              className="w-full p-2 rounded-lg mt-2"
              panelClassName="border-2 border-purple-400"
              style={{ borderColor: "#a78bfa" }}
            />

            <div className="flex align-items-center mt-3">
              <Checkbox
                inputId="required"
                checked={form.required}
                onChange={(e) => setForm((f) => ({ ...f, required: e.checked }))}
              />
              <label htmlFor="required" className="ml-2">
                Required
              </label>
            </div>
            <div className="flex align-items-center mt-2">
              <Checkbox
                inputId="active"
                checked={form.active}
                onChange={(e) => setForm((f) => ({ ...f, active: e.checked }))}
              />
              <label htmlFor="active" className="ml-2">
                Active
              </label>
            </div>
          </form>
        </Sidebar>
      </div>
    </PrimeReactProvider>
  );
}
