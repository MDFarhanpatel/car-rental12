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

// Brands with logo and models
const famousBrands = [
  { name: "Toyota", logo: "https://logos.therichpost.com/5/toyota.png", models: ["Corolla", "Camry", "Yaris", "Prius", "RAV4"] },
  { name: "Honda", logo: "https://logos.therichpost.com/5/honda.png", models: ["Civic", "Accord", "CR-V", "Pilot", "Jazz"] },
  { name: "Ford", logo: "https://logos.therichpost.com/5/ford.png", models: ["Focus", "Mustang", "Fiesta", "Explorer", "F-150"] },
  { name: "BMW", logo: "https://logos.therichpost.com/5/bmw.png", models: ["3 Series", "5 Series", "X5", "X3", "M3"] },
  { name: "Mercedes-Benz", logo: "https://logos.therichpost.com/5/mercedes-benz.png", models: ["C-Class", "E-Class", "S-Class", "GLE", "GLA"] },
  { name: "Audi", logo: "https://logos.therichpost.com/5/audi.png", models: ["A3", "A4", "Q5", "Q7", "A6"] },
  { name: "Volkswagen", logo: "https://logos.therichpost.com/5/volkswagen.png", models: ["Golf", "Jetta", "Passat", "Tiguan", "Polo"] },
  { name: "Chevrolet", logo: "https://logos.therichpost.com/5/chevrolet.png", models: ["Cruze", "Malibu", "Impala", "Spark", "Tahoe"] },
  { name: "Nissan", logo: "https://logos.therichpost.com/5/nissan.png", models: ["Altima", "Sentra", "Leaf", "Rogue", "X-Trail"] },
  { name: "Hyundai", logo: "https://logos.therichpost.com/5/hyundai.png", models: ["Elantra", "Sonata", "Tucson", "Santa Fe", "i20"] },
  // ... Add more brands/models here
];

// Flatten all models for all brands to be displayed in table initially
const initialModels = [
  { name: "Corolla", brand: famousBrands[0] },
  { name: "Civic", brand: famousBrands[1] },
  { name: "Focus", brand: famousBrands[2] },
];

export default function ModelsPage() {
  const [models, setModels] = useState(initialModels);
  const [showDialog, setShowDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState({ name: "", brand: null });
  const [errors, setErrors] = useState({});
  const toast = useRef(null);

  const breadcrumbItems = [
    { label: "Home", command: () => window.location.href = "/" },
    { label: "Admin", command: () => window.location.href = "/admin" },
    { label: "Models" },
  ];

  const openAdd = () => {
    setForm({ name: "", brand: null });
    setErrors({});
    setEditingIndex(null);
    setShowDialog(true);
  };

  const openEdit = (rowIndex) => {
    setForm({ name: models[rowIndex].name, brand: models[rowIndex].brand });
    setErrors({});
    setEditingIndex(rowIndex);
    setShowDialog(true);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Model Name is required.";
    if (!form.brand) newErrors.brand = "Brand is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveModel = () => {
    if (!validate()) return;
    if (editingIndex !== null) {
      setModels(models.map((m, i) => i === editingIndex ? { ...form } : m));
      toast.current.show({ severity: "success", summary: "Model Updated", detail: form.name, life: 1800 });
    } else {
      setModels([...models, { ...form }]);
      toast.current.show({ severity: "success", summary: "Model Added", detail: form.name, life: 1800 });
    }
    setShowDialog(false);
  };

  // Only show models for selected brand
  const brandModelOptions = form.brand ? form.brand.models.map(modelName => ({
    name: modelName
  })) : [];

  const brandOptionTemplate = (option) => (
    option ? (
      <div className="flex items-center gap-2">
        <img src={option.logo} alt={option.name} className="w-6 h-6 object-contain" />
        <span>{option.name}</span>
      </div>
    ) : null
  );

  const brandValueTemplate = (option) => (
    option ? (
      <div className="flex items-center gap-2">
        <img src={option.logo} alt={option.name} className="w-6 h-6 object-contain" />
        <span>{option.name}</span>
      </div>
    ) : <span>Brand</span>
  );

  const dialogFooter = (
    <div className="flex justify-end gap-3 w-full">
      <Button
        label="Save"
        icon="pi pi-check"
        className="bg-black border-none font-extrabold px-6 py-2 rounded-lg"
        onClick={saveModel}
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
        <BreadCrumb model={breadcrumbItems}
            home={{ icon: "pi pi-home", command: () => window.location.href = "/" }}
            className="text-white font-bold"
        />
      </div>

      <div className="text-3xl font-extrabold text-white mb-3">Models</div>
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <span className="font-extrabold text-white flex items-center"><i className="pi pi-check mr-1" />10 Active</span>
        <span className="font-extrabold text-rose-400 flex items-center"><i className="pi pi-times mr-1" />12 Inactive</span>
        <span className="font-extrabold text-white flex items-center"><i className="pi pi-list mr-1" />22 Total Models</span>
        <Button label="Add Model" icon="pi pi-plus" className="ml-auto bg-black border-none font-bold" onClick={openAdd} />
      </div>
      <div className="bg-zinc-900 p-6 rounded-2xl shadow-2xl overflow-x-auto">
        <DataTable value={models} stripedRows paginator rows={5} className="p-datatable-sm text-white" emptyMessage="No models found.">
          <Column field="name" header="Model Name" />
          <Column body={rowData => (
            <span className="flex items-center gap-2">
              {rowData.brand && <img src={rowData.brand.logo} alt={rowData.brand.name} className="w-6 h-6 object-contain" />}
              {rowData.brand?.name}
            </span>
          )} header="Brand" />
          <Column body={(_, { rowIndex }) => (
            <Button icon="pi pi-pencil" rounded className="p-button-sm" onClick={() => openEdit(rowIndex)} aria-label="Edit" />
          )} header="Actions" />
        </DataTable>
      </div>

      <Dialog
        header={<span className="text-xl font-extrabold text-fuchsia-700">{editingIndex === null ? "Add Model" : "Edit Model"}</span>}
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
            placeholder="Model Name"
            className={`w-full p-2 rounded-lg mt-3 ${errors.name ? "border border-red-500" : ""}`}
            autoFocus
            disabled={form.brand && form.brand.models.includes(form.name)}
          />
          {errors.name && <small className="text-red-500">{errors.name}</small>}

          <Dropdown
            value={form.brand}
            options={famousBrands}
            onChange={e => setForm(f => ({ ...f, brand: e.value, name: "" }))}
            optionLabel="name"
            itemTemplate={brandOptionTemplate}
            valueTemplate={brandValueTemplate}
            placeholder="Brand"
            className={`w-full p-2 rounded-lg ${errors.brand ? "border border-red-500" : ""}`}
          />
          {errors.brand && <small className="text-red-500">{errors.brand}</small>}
        </form>
      </Dialog>
    </div>
  );
}
