"use client";
import React, { useState, useRef } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { BreadCrumb } from "primereact/breadcrumb";

const checklistCategories = [
  "Exterior",
  "Interior",
  "Engine"
];

export default function ChecklistOptionsPage() {
  const [options, setOptions] = useState([
    { name: "Tyres", category: "Exterior" },
    { name: "Seats", category: "Interior" },
    { name: "Oil Level", category: "Engine" },
  ]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState({ name: "", category: "" });
  const [errors, setErrors] = useState({});
  const toast = useRef(null);

  const breadcrumbItems = [
    { label: "Home", command: () => window.location.href = "/" },
    { label: "Admin", command: () => window.location.href = "/admin" },
    { label: "Checklist Options" },
  ];

  // Dynamic count for stats row
  const totalOptions = options.length;

  const openAdd = () => {
    setForm({ name: "", category: "" });
    setErrors({});
    setEditingIndex(null);
    setShowDialog(true);
  };

  const openEdit = (rowIndex) => {
    setForm({ name: options[rowIndex].name, category: options[rowIndex].category });
    setErrors({});
    setEditingIndex(rowIndex);
    setShowDialog(true);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Option Name is required.";
    if (!form.category) newErrors.category = "Category is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveOption = () => {
    if (!validate()) return;
    if (editingIndex !== null) {
      setOptions(options.map((opt, i) => (i === editingIndex ? form : opt)));
      toast.current.show({ severity: "success", summary: "Option Updated", detail: form.name, life: 1800 });
    } else {
      setOptions([...options, form]);
      toast.current.show({ severity: "success", summary: "Option Added", detail: form.name, life: 1800 });
    }
    setShowDialog(false);
  };

  const dialogFooter = (
    <Button
      label="Save"
      icon="pi pi-check"
      className="w-full mt-4 bg-black font-extrabold border-none py-3 rounded-md"
      onClick={saveOption}
    />
  );

  return (
    <div className="p-4 min-h-screen bg-gradient-to-r from-gray-950 via-gray-900 to-fuchsia-900 font-sans">
      <Toast ref={toast} />
      <div className="mb-4">
        <BreadCrumb 
          model={breadcrumbItems} 
          home={{ icon: "pi pi-home" }} 
          className="text-white font-bold" 
        />
      </div>
      <div className="text-3xl font-extrabold text-white mb-3">Checklist Options</div>
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <span className="font-extrabold text-green-400 flex items-center">
          <i className="pi pi-check mr-1" />
          {totalOptions} Active
        </span>
        <span className="font-extrabold text-rose-400 flex items-center">
          <i className="pi pi-times mr-1" />
          0 Inactive
        </span>
        <span className="font-extrabold text-indigo-200 flex items-center">
          <i className="pi pi-list mr-1" />
          {totalOptions} Total Checklist Options
        </span>
        <Button
          label="Add Option"
          icon="pi pi-plus"
          className="ml-auto bg-black border-none font-bold"
          onClick={openAdd}
        />
      </div>
      <div className="bg-zinc-900 p-6 rounded-2xl shadow-2xl overflow-x-auto">
        <DataTable value={options} stripedRows paginator rows={5} className="p-datatable-sm text-white" emptyMessage="No checklist options found.">
          <Column field="name" header="Option Name" />
          <Column field="category" header="Category" />
          <Column
            body={(_, { rowIndex }) => (
              <Button 
                icon="pi pi-pencil" 
                rounded 
                className="p-button-sm bg-black" 
                onClick={() => openEdit(rowIndex)} 
                aria-label="Edit" 
              />
            )}
            header="Actions"
          />
        </DataTable>
      </div>

      <Dialog
        header={<span className="text-xl font-extrabold text-fuchsia-700">{editingIndex === null ? "Add Option" : "Edit Option"}</span>}
        visible={showDialog}
        position="right"
        modal
        blockScroll
        className="rounded-lg shadow-xl"
        style={{ width: 380, maxWidth: "100vw" }}
        onHide={() => setShowDialog(false)}
        footer={dialogFooter}
      >
        <form className="flex flex-col gap-3 p-1">
          <InputText
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Option Name"
            className={`w-full p-2 rounded-lg mt-3 ${errors.name ? "border border-red-500" : ""}`}
            autoFocus
          />
          {errors.name && <small className="text-red-500">{errors.name}</small>}

          <label className="font-bold text-gray-700 ml-1 mt-1">Category</label>
          <Dropdown
            value={form.category}
            options={checklistCategories}
            onChange={e => setForm(f => ({ ...f, category: e.value }))}
            placeholder="Select Category"
            className={`w-full p-2 rounded-lg mt-2 ${errors.category ? "border border-red-500" : ""}`}
            panelClassName="border-2 border-purple-400"
            style={{ borderColor: "#a78bfa" }}
          />
          {errors.category && <small className="text-red-500">{errors.category}</small>}
        </form>
      </Dialog>
    </div>
  );
}
