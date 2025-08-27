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

// List of car brand names as model options
const carBrandNames = [
  "Toyota", "Honda", "Ford", "BMW", "Mercedes-Benz", "Audi", "Volkswagen", "Chevrolet", "Nissan", "Hyundai",
  "Kia", "Lexus", "Mazda", "Subaru", "Tesla", "Jaguar", "Land Rover", "Volvo", "Porsche", "Ferrari",
  "Mitsubishi", "Renault", "Peugeot", "Fiat", "Citroen", "Suzuki", "Dodge", "Jeep", "Chrysler", "Isuzu",
  "Acura", "Bentley", "Bugatti", "Cadillac", "Dacia", "Daewoo", "Genesis", "GMC", "Hummer", "Infiniti",
  "Lancia", "Maserati", "Mini", "Opel", "Ram", "Saab", "Seat"
];

export default function VariantsPage() {
  const [variants, setVariants] = useState([
    { name: "GLi", model: "Corolla" },
    { name: "Altis", model: "Corolla" },
    { name: "VTEC", model: "Civic" }
  ]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState({ name: "", model: "" });
  const [errors, setErrors] = useState({});
  const toast = useRef(null);

  const breadcrumbItems = [
    { label: "Home", command: () => window.location.href = "/" },
    { label: "Admin", command: () => window.location.href = "/admin" },
    { label: "Variants" },
  ];

  const openAdd = () => {
    setForm({ name: "", model: "" });
    setErrors({});
    setEditingIndex(null);
    setShowDialog(true);
  };

  const openEdit = (rowIndex) => {
    setForm({ name: variants[rowIndex].name, model: variants[rowIndex].model });
    setErrors({});
    setEditingIndex(rowIndex);
    setShowDialog(true);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Variant Name is required.";
    if (!form.model) newErrors.model = "Model is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveVariant = () => {
    if (!validate()) return;
    if (editingIndex !== null) {
      setVariants(variants.map((v, i) => i === editingIndex ? { ...form } : v));
      toast.current.show({ severity: "success", summary: "Variant Updated", detail: form.name, life: 1800 });
    } else {
      setVariants([...variants, { ...form }]);
      toast.current.show({ severity: "success", summary: "Variant Added", detail: form.name, life: 1800 });
    }
    setShowDialog(false);
  };

  const dialogFooter = (
    <div className="flex justify-end gap-3 w-full">
      <Button
        label="Save"
        icon="pi pi-check"
        className="bg-black border-none font-extrabold px-6 py-2 rounded-lg"
        onClick={saveVariant}
      />
      <Button
        label="Cancel"
        className="bg-black border-none font-extrabold px-6 py-2 rounded-lg"
        onClick={() => setShowDialog(false)}
      />
    </div>
  );

  return (
    <div className="p-4 min-h-screen bg-gradient-to-r from-gray-950 via-gray-900 to-fuchsia-900 font-sans">
      <Toast ref={toast} />
      <div className="mb-4">
        <BreadCrumb model={breadcrumbItems} home={{ icon: "pi pi-home", command: () => window.location.href = "/" }} className="text-white font-bold" />
      </div>

      <div className="text-3xl font-extrabold text-white mb-3">Variants</div>
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <span className="font-extrabold text-white flex items-center"><i className="pi pi-check mr-1" />10 Active</span>
        <span className="font-extrabold text-rose-400 flex items-center"><i className="pi pi-times mr-1" />12 Inactive</span>
        <span className="font-extrabold text-white flex items-center"><i className="pi pi-list mr-1" />22 Total Variants</span>
        <Button label="Add Variant" icon="pi pi-plus" className="ml-auto bg-black border-none font-bold" onClick={openAdd} />
      </div>
      <div className="bg-zinc-900 p-6 rounded-2xl shadow-2xl overflow-x-auto">
        <DataTable value={variants} stripedRows paginator rows={5} className="p-datatable-sm text-white" emptyMessage="No variants found.">
          <Column field="name" header="Variant Name" />
          <Column field="model" header="Model" />
          <Column body={(_, { rowIndex }) => (
            <Button icon="pi pi-pencil" rounded className="p-button-sm" onClick={() => openEdit(rowIndex)} aria-label="Edit" />
          )} header="Action" />
        </DataTable>
      </div>

      <Dialog
        header={<span className="text-xl font-extrabold text-fuchsia-700">{editingIndex === null ? "Add Variant" : "Edit Variant"}</span>}
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
            placeholder="Variant Name"
            className={`w-full p-2 rounded-lg mt-3 ${errors.name ? "border border-red-500" : ""}`}
            autoFocus
          />
          {errors.name && <small className="text-red-500">{errors.name}</small>}

          <Dropdown
            value={form.model}
            options={carBrandNames}
            onChange={e => setForm(f => ({ ...f, model: e.value }))}
            placeholder="Model"
            className={`w-full p-2 rounded-lg ${errors.model ? "border border-red-500" : ""}`}
          />
          {errors.model && <small className="text-red-500">{errors.model}</small>}
        </form>
      </Dialog>
    </div>
  );
}
