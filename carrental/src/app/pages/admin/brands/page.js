"use client";
import React, { useState, useRef } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { Checkbox } from "primereact/checkbox";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { BreadCrumb } from "primereact/breadcrumb";

// Example list of 50 famous brands with logo URLs (sample subset)
const famousBrands = [
  { name: "Toyota", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Toyota_logo.svg/1200px-Toyota_logo.svg.png" },
  { name: "Honda", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Honda_logo.svg/1200px-Honda_logo.svg.png" },
  { name: "Ford", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Ford_logo_flat.svg/1200px-Ford_logo_flat.svg.png" },
  { name: "BMW", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/1200px-BMW.svg.png" },
  { name: "Mercedes-Benz", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/1200px-Mercedes-Logo.svg.png" },
  { name: "Audi", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Audi_logo.svg/1200px-Audi_logo.svg.png" },
  { name: "Volkswagen", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Volkswagen_logo_2019.svg/1200px-Volkswagen_logo_2019.svg.png" },
  { name: "Chevrolet", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Chevrolet_logo.png/1200px-Chevrolet_logo.png" },
  { name: "Nissan", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Nissan_logo.svg/1200px-Nissan_logo.svg.png" },
  { name: "Hyundai", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Hyundai_Motor_Company_logo.svg/1200px-Hyundai_Motor_Company_logo.svg.png" },
  { name: "Kia", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Kia_logo.svg/1200px-Kia_logo.svg.png" },
  { name: "Lexus", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Lexus_logo.svg/1200px-Lexus_logo.svg.png" },
  { name: "Mazda", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Mazda_logo.svg/1200px-Mazda_logo.svg.png" },
  { name: "Subaru", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Subaru_logo.svg/1200px-Subaru_logo.svg.png" },
  { name: "Tesla", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Tesla_Motors.svg/1200px-Tesla_Motors.svg.png" },
  { name: "Jaguar", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Jaguar_logo.png/1200px-Jaguar_logo.png" },
  { name: "Land Rover", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Land_Rover_logo.png/1200px-Land_Rover_logo.png" },
  { name: "Volvo", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Volvo_Iron_Mark.svg/1200px-Volvo_Iron_Mark.svg.png" },
  { name: "Porsche", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Porsche_logo.svg/1200px-Porsche_logo.svg.png" },
  { name: "Ferrari", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Ferrari-Logo.svg/1200px-Ferrari-Logo.svg.png" },
  // Add others as needed following same pattern   
];


  // Add more brands similarly



export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ brand: null, active: true });
  const [errors, setErrors] = useState({});
  const toast = useRef(null);

  const breadcrumbItems = [
    { label: "Home", command: () => window.location.href = "/" },
    { label: "Admin", command: () => window.location.href = "/admin" },
    { label: "Brands" },
  ];

  const logoBodyTemplate = (rowData) => (
    <img
      src={rowData.brand?.logo}
      alt={rowData.brand?.name}
      className="w-10 h-10 rounded object-contain bg-white p-1"
    />
  );

  const actionBodyTemplate = (rowData) => (
    <Button icon="pi pi-pencil" rounded className="p-button-sm" onClick={() => openEdit(rowData)} aria-label="Edit" />
  );

  const activeCount = brands.filter((b) => b.active).length;
  const inactiveCount = brands.length - activeCount;

  const openAdd = () => {
    setEditing(null);
    setForm({ brand: null, active: true });
    setErrors({});
    setShowDialog(true);
  };

  const openEdit = (brandEntry) => {
    setEditing(brandEntry);
    setForm({ brand: brandEntry.brand, active: brandEntry.active });
    setErrors({});
    setShowDialog(true);
  };

  const onInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    if (name === "active") {
      setForm((f) => ({ ...f, active: checked }));
    } else if (type === "text" || type === "select-one") {
      setForm((f) => ({ ...f, brand: value }));
      setErrors((e) => ({ ...e, brand: value ? "" : "Brand is required." }));
    }
  };

  const onDropdownChange = (e) => {
    setForm((f) => ({ ...f, brand: e.value }));
    setErrors((e) => ({ ...e, brand: e.value ? "" : "Brand is required." }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.brand) newErrors.brand = "Brand is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveBrand = () => {
    if (!validate()) return;
    if (editing) {
      setBrands((prev) =>
        prev.map((b) => (b === editing ? { brand: form.brand, active: form.active } : b))
      );
      toast.current.show({ severity: "success", summary: "Brand Updated", detail: form.brand.name, life: 2000 });
    } else {
      setBrands((prev) => [...prev, { brand: form.brand, active: form.active }]);
      toast.current.show({ severity: "success", summary: "Brand Added", detail: form.brand.name, life: 2000 });
    }
    setShowDialog(false);
  };

  // Custom Dropdown item template showing logo and name
  const brandOptionTemplate = (option) => {
    if (!option) {
      return null;
    }
    return (
      <div className="flex items-center gap-2">
        <img src={option.logo} alt={option.name} className="w-6 h-6 object-contain" />
        <span>{option.name}</span>
      </div>
    );
  };

  // Selected item display template
  const brandValueTemplate = (option) => {
    if (!option) {
      return <span>Select a brand</span>;
    }
    return (
      <div className="flex items-center gap-2">
        <img src={option.logo} alt={option.name} className="w-6 h-6 object-contain" />
        <span>{option.name}</span>
      </div>
    );
  };

  return (
    <div className="p-4 min-h-screen bg-gradient-to-r from-gray-950 via-gray-900 to-fuchsia-900 font-sans">
      <Toast ref={toast} />
      <div className="mb-4">
        <BreadCrumb model={breadcrumbItems} home={{ icon: "pi pi-home", command: () => window.location.href = "/" }} className="text-white font-bold" />
      </div>
      <div className="text-3xl font-extrabold text-white mb-3">Brands</div>
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <span className="font-extrabold text-white flex items-center"><i className="pi pi-check mr-1" />{activeCount} Active</span>
        <span className="font-extrabold text-rose-400 flex items-center"><i className="pi pi-times mr-1" />{inactiveCount} Inactive</span>
        <span className="font-extrabold text-white flex items-center"><i className="pi pi-list mr-1" />{brands.length} Total Brands</span>
        <Button label="Add Brand" icon="pi pi-plus" className="ml-auto bg-black border-none font-bold" onClick={openAdd} />
      </div>

      <DataTable
        value={brands}
        stripedRows
        paginator
        rows={5}
        className="bg-zinc-900 p-6 rounded-2xl shadow-2xl text-white overflow-auto"
        emptyMessage="No brands found."
      >
        <Column header="Logo" body={logoBodyTemplate} />
        <Column header="Name" field="brand.name" />
        <Column
          header="Active"
          body={(r) => (r.active ? "Yes" : "No")}
        />
        <Column header="Actions" body={actionBodyTemplate} />
      </DataTable>

      <Dialog
        header={<span className="text-xl font-extrabold text-fuchsia-700">{editing ? "Edit Brand" : "Add Brand"}</span>}
        visible={showDialog}
        position="right"
        modal
        blockScroll
        className="rounded-lg shadow-xl"
        style={{ width: 400, maxWidth: "100vw" }}
        onHide={() => setShowDialog(false)}
      >
        <div className="flex flex-col gap-3 p-1">
          <label className="font-bold text-gray-700">
            Brand <span className="text-red-600">*</span>
          </label>
          <Dropdown
            value={form.brand}
            options={famousBrands}
            onChange={onDropdownChange}
            optionLabel="name"
            itemTemplate={brandOptionTemplate}
            valueTemplate={brandValueTemplate}
            placeholder="Select Brand"
            className={`w-full p-2 rounded-lg ${errors.brand ? "border border-red-500" : ""}`}
          />
          {errors.brand && <small className="text-red-500">{errors.brand}</small>}

          <div className="flex items-center mt-4">
            <Checkbox
              inputId="activeBrand"
              name="active"
              checked={form.active}
              className="mr-2"
              onChange={onInputChange}
            />
            <label htmlFor="activeBrand" className="font-bold text-gray-700">
              Active
            </label>
          </div>

          <Button
            label="Save"
            icon="pi pi-check"
            className="w-full mt-4 bg-gradient-to-r from-fuchsia-700 to-purple-700 border-none font-extrabold"
            onClick={saveBrand}
          />
        </div>
      </Dialog>
    </div>
  );
}
