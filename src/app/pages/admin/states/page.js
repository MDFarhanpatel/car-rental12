"use client";
import React, { useState, useRef } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { BreadCrumb } from "primereact/breadcrumb";

export default function StatesPage() {
  const [states, setStates] = useState([
    { name: "Telangana", code: "PB" },
    { name: "Andra pradash", code: "SD" },
    { name: "Maharastra ", code: "goa" },
  ]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState({ name: "", code: "" });
  const [errors, setErrors] = useState({});
  const toast = useRef(null);

  const breadcrumbItems = [
    { label: "Home", command: () => window.location.href = "/" },
    { label: "Admin", command: () => window.location.href = "/admin" },
    { label: "States" },
  ];

  const openAdd = () => {
    setForm({ name: "", code: "" });
    setErrors({});
    setEditingIndex(null);
    setShowDialog(true);
  };

  const openEdit = (rowIndex) => {
    setForm({ name: states[rowIndex].name, code: states[rowIndex].code });
    setErrors({});
    setEditingIndex(rowIndex);
    setShowDialog(true);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.code.trim()) newErrors.code = "Code is required.";
    if (!form.name.trim()) newErrors.name = "State Name is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveState = () => {
    if (!validate()) return;
    if (editingIndex !== null) {
      setStates(states.map((s, i) => (i === editingIndex ? form : s)));
      toast.current.show({ severity: "success", summary: "State Updated", detail: form.name, life: 1800 });
    } else {
      setStates([...states, form]);
      toast.current.show({ severity: "success", summary: "State Added", detail: form.name, life: 1800 });
    }
    setShowDialog(false);
  };

  const dialogFooter = (
    <Button
      label="Save"
      icon="pi pi-check"
      className="w-full mt-4 bg-black font-extrabold border-none py-3 rounded-md"
      onClick={saveState}
    />
  );

  return (
    <div className="p-4 min-h-screen bg-gradient-to-r from-gray-950 via-gray-900 to-fuchsia-900 font-sans">
      <Toast ref={toast} />
      <div className="mb-4">
        <BreadCrumb model={breadcrumbItems} home={{ icon: "pi pi-home" }} className="text-white font-bold" />
      </div>
      <div className="text-3xl font-extrabold text-white mb-3">States</div>
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <span className="font-extrabold text-green-400 flex items-center">
          <i className="pi pi-check mr-1" />10 Active
        </span>
        <span className="font-extrabold text-rose-400 flex items-center">
          <i className="pi pi-times mr-1" />12 Inactive
        </span>
        <span className="font-extrabold text-indigo-200 flex items-center">
          <i className="pi pi-list mr-1" />22 Total States
        </span>
        <Button
          label="Add State"
          icon="pi pi-plus"
          className="ml-auto bg-black border-none font-bold"
          onClick={openAdd}
        />
      </div>
      <div className="bg-zinc-900 p-6 rounded-2xl shadow-2xl overflow-x-auto">
        <DataTable value={states} stripedRows paginator rows={5} className="p-datatable-sm text-white" emptyMessage="No states found.">
          <Column field="name" header="State Name" />
          <Column field="code" header="Code" />
          <Column
            body={(_, { rowIndex }) => (
              <Button icon="pi pi-pencil" rounded className="p-button-sm" onClick={() => openEdit(rowIndex)} aria-label="Edit" />
            )}
            header="Actions"
          />
        </DataTable>
      </div>

      <Dialog
        header={<span className="text-xl font-extrabold text-fuchsia-700">{editingIndex === null ? "Add State" : "Edit State"}</span>}
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
            value={form.code}
            onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
            placeholder="Code"
            className={`w-full p-2 rounded-lg mt-3 ${errors.code ? "border border-red-500" : ""}`}
            autoFocus
          />
          {errors.code && <small className="text-red-500">{errors.code}</small>}

          <InputText
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="State Name"
            className={`w-full p-2 rounded-lg mt-2 ${errors.name ? "border border-red-500" : ""}`}
          />
          {errors.name && <small className="text-red-500">{errors.name}</small>}
        </form>
      </Dialog>
    </div>
  );
}
