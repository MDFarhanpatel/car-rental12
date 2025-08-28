"use client";
import React, { useState, useRef } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { BreadCrumb } from "primereact/breadcrumb";

export default function ChecklistCategoriesPage() {
  // Active flag added for demo counts
  const [categories, setCategories] = useState([
    { name: "Exterior", description: "Exterior checks", active: true },
    { name: "Interior", description: "Interior checks", active: false },
    { name: "Engine", description: "Engine checks", active: true },
  ]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", active: true });
  const [errors, setErrors] = useState({});
  const toast = useRef(null);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Home", command: () => window.location.href = "/" },
    { label: "Admin", command: () => window.location.href = "/admin" },
    { label: "Checklist Categories" },
  ];

  // Calculate counts dynamically
  const activeCount = categories.filter(c => c.active).length;
  const inactiveCount = categories.length - activeCount;

  const openAdd = () => {
    setForm({ name: "", description: "", active: true });
    setErrors({});
    setShowAddDialog(true);
  };

  const openEdit = (rowIndex) => {
    const cat = categories[rowIndex];
    setForm({ name: cat.name, description: cat.description, active: cat.active });
    setErrors({});
    setEditingIndex(rowIndex);
    setShowEditDialog(true);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Category Name is required.";
    if (!form.description.trim()) newErrors.description = "Description is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveAddCategory = () => {
    if (!validate()) return;
    setCategories(prev => [...prev, form]);
    toast.current.show({ severity: "success", summary: "Category Added", detail: form.name, life: 1800 });
    setShowAddDialog(false);
  };

  const saveEditCategory = () => {
    if (!validate()) return;
    setCategories(prev =>
      prev.map((cat, i) => (i === editingIndex ? form : cat))
    );
    toast.current.show({ severity: "success", summary: "Category Updated", detail: form.name, life: 1800 });
    setShowEditDialog(false);
  };

  const addDialogFooter = (
    <Button
      label="Save"
      icon="pi pi-check"
      className="w-full mt-4 bg-black font-extrabold border-none py-3 rounded-md"
      onClick={saveAddCategory}
    />
  );

  const editDialogFooter = (
    <Button
      label="Save"
      icon="pi pi-check"
      className="w-full mt-4 bg-black font-extrabold border-none py-3 rounded-md"
      onClick={saveEditCategory}
    />
  );

  return (
    <div className="p-4 min-h-screen bg-gradient-to-r from-gray-950 via-gray-900 to-fuchsia-900 font-sans">
      <Toast ref={toast} />
      <div className="mb-4">
        <BreadCrumb model={breadcrumbItems} home={{ icon: "pi pi-home" }} className="text-white font-bold" />
      </div>

      <div className="text-3xl font-extrabold text-white mb-3">Checklist Categories</div>
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <span className="font-extrabold text-green-400 flex items-center"><i className="pi pi-check mr-1" />{activeCount} Active</span>
        <span className="font-extrabold text-rose-400 flex items-center"><i className="pi pi-times mr-1" />{inactiveCount} Inactive</span>
        <span className="font-extrabold text-indigo-200 flex items-center"><i className="pi pi-list mr-1" />{categories.length} Total Checklist Categories</span>
        <Button label="Add Category" icon="pi pi-plus" className="ml-auto bg-black border-none font-bold" onClick={openAdd} />
      </div>
      <div className="bg-zinc-900 p-6 rounded-2xl shadow-2xl overflow-x-auto">
        <DataTable value={categories} stripedRows paginator rows={5} className="p-datatable-sm text-white" emptyMessage="No checklist categories found.">
          <Column field="name" header="Category Name" />
          <Column field="description" header="Description" />
          <Column body={rowData => (
            <span>{rowData.active ? "Active" : "Inactive"}</span>
          )} header="Status" />
          <Column
            body={(_, { rowIndex }) => (
              <Button icon="pi pi-pencil" rounded className="p-button-sm" onClick={() => openEdit(rowIndex)} aria-label="Edit" />
            )}
            header="Actions"
          />
        </DataTable>
      </div>

      {/* Add Category Dialog */}
      <Dialog
        header="Add Checklist Category"
        visible={showAddDialog}
        position="right"
        modal
        blockScroll
        className="rounded-lg shadow-xl"
        style={{ width: 380, maxWidth: "100vw" }}
        onHide={() => setShowAddDialog(false)}
        footer={addDialogFooter}
      >
        <form className="flex flex-col gap-3 p-1">
          <InputText
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Category Name"
            className={`w-full p-2 rounded-lg mt-3 ${errors.name ? "border border-red-500" : ""}`}
            autoFocus
          />
          {errors.name && <small className="text-red-500">{errors.name}</small>}

          <InputText
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Description"
            className={`w-full p-2 rounded-lg mt-2 ${errors.description ? "border border-red-500" : ""}`}
          />
          {errors.description && <small className="text-red-500">{errors.description}</small>}
        </form>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog
        header="Edit Checklist Category"
        visible={showEditDialog}
        position="right"
        modal
        blockScroll
        className="rounded-lg shadow-xl"
        style={{ width: 380, maxWidth: "100vw" }}
        onHide={() => setShowEditDialog(false)}
        footer={editDialogFooter}
      >
        <form className="flex flex-col gap-3 p-1">
          <InputText
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Category Name"
            className={`w-full p-2 rounded-lg mt-1 ${errors.name ? "border border-red-500" : ""}`}
            autoFocus
          />
          {errors.name && <small className="text-red-500">{errors.name}</small>}

          <InputText
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Description"
            className={`w-full p-2 rounded-lg mt-1 ${errors.description ? "border border-red-500" : ""}`}
          />
          {errors.description && <small className="text-red-500">{errors.description}</small>}
        </form>
      </Dialog>
    </div>
  );
}
