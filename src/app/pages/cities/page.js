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

const stateOptions = [
  "Telangana", "Karnataka", "Diu" // Add more states if needed
];

export default function CitiesPage() {
  const [cities, setCities] = useState([
    { name: "Hyderabad", state: "Telangana" },
    { name: "Bangalore", state: "Karnataka" },
    { name: "Goa", state: "Diu" },
  ]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState({ name: "", state: "" });
  const [errors, setErrors] = useState({});
  const toast = useRef(null);

  const breadcrumbItems = [
    { label: "Home", command: () => window.location.href = "/" },
    { label: "Admin", command: () => window.location.href = "/admin" },
    { label: "Cities" },
  ];

  const totalCities = cities.length;

  const openAdd = () => {
    setForm({ name: "", state: "" });
    setErrors({});
    setEditingIndex(null);
    setShowDialog(true);
  };

  const openEdit = (rowIndex) => {
    setForm({ name: cities[rowIndex].name, state: cities[rowIndex].state });
    setErrors({});
    setEditingIndex(rowIndex);
    setShowDialog(true);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "City Name is required.";
    if (!form.state) newErrors.state = "State is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveCity = () => {
    if (!validate()) return;
    if (editingIndex !== null) {
      setCities(cities.map((c, i) => (i === editingIndex ? form : c)));
      toast.current.show({ severity: "success", summary: "City Updated", detail: form.name, life: 1800 });
    } else {
      setCities([...cities, form]);
      toast.current.show({ severity: "success", summary: "City Added", detail: form.name, life: 1800 });
    }
    setShowDialog(false);
  };

  const dialogFooter = (
    <Button
      label="Save"
      icon="pi pi-check"
      className="w-full mt-4 bg-black font-extrabold border-none py-3 rounded-md"
      onClick={saveCity}
    />
  );

  return (
    <div className="p-4 min-h-screen bg-gradient-to-r from-gray-900 via-gray-500 to-gray-600 font-sans">
      <Toast ref={toast} />
      <div className="mb-4">
        <BreadCrumb 
          model={breadcrumbItems} 
          home={{ icon: "pi pi-home" }} 
          className="text-white font-bold" 
        />
      </div>
      <div className="text-3xl font-extrabold text-white mb-3">Cities</div>
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <span className="font-extrabold text-green-400 flex items-center">
          <i className="pi pi-check mr-1" />
          {totalCities} Active
        </span>
        <span className="font-extrabold text-rose-400 flex items-center">
          <i className="pi pi-times mr-1" />
          0 Inactive
        </span>
        <span className="font-extrabold text-indigo-200 flex items-center">
          <i className="pi pi-list mr-1" />
          {totalCities} Total Cities
        </span>
        <Button
          label="Add City"
          icon="pi pi-plus"
          className="ml-auto bg-black border-none font-bold"
          onClick={openAdd}
        />
      </div>
      <div className="bg-zinc-900 p-6 rounded-2xl shadow-2xl overflow-x-auto">
        <DataTable 
          value={cities} 
          stripedRows 
          paginator 
          rows={5} 
          className="p-datatable-sm text-white" 
          emptyMessage="No cities found."
        >
          <Column field="name" header="City Name" />
          <Column field="state" header="State" />
          <Column
            body={(_, { rowIndex }) => (
              <Button 
                icon="pi pi-pencil" 
                rounded 
                className="p-button-sm" 
                onClick={() => openEdit(rowIndex)} 
                aria-label="Edit" 
              />
            )}
            header="Action"
          />
        </DataTable>
      </div>

      <Dialog
        header={<span className="text-xl font-extrabold text-fuchsia-700">{editingIndex === null ? "Add City" : "Edit City"}</span>}
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
            placeholder="City Name"
            className={`w-full p-2 rounded-lg mt-3 ${errors.name ? "border border-red-500" : ""}`}
            autoFocus
          />
          {errors.name && <small className="text-red-500">{errors.name}</small>}

          <Dropdown
            value={form.state}
            options={stateOptions}
            onChange={e => setForm(f => ({ ...f, state: e.value }))}
            placeholder="State"
            className={`w-full p-2 rounded-lg mt-2 ${errors.state ? "border border-red-500" : ""}`}
          />
          {errors.state && <small className="text-red-500">{errors.state}</small>}
        </form>
      </Dialog>
    </div>
  );
}
