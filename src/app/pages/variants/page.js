"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { BreadCrumb } from "primereact/breadcrumb";
import { Tag } from "primereact/tag";
import { InputNumber } from "primereact/inputnumber";

export default function VariantsPage() {
  const [variants, setVariants] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState({ 
    name: "", 
    modelId: "",
    fuelType: "",
    transmission: "",
    seatingCapacity: null,
    active: true
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const toast = useRef(null);

  const breadcrumbItems = [
      { label: "Home", command: () => window.location.href = "/" },
      { label: "Admin", command: () => window.location.href = "/admin" },
      { label: "Variants" },
  ];

  const fuelTypeOptions = [
    { label: "Petrol", value: "Petrol" },
    { label: "Diesel", value: "Diesel" },
    { label: "Electric", value: "Electric" },
    { label: "Hybrid", value: "Hybrid" },
    { label: "CNG", value: "CNG" }
  ];

  const transmissionOptions = [
    { label: "Manual", value: "Manual" },
    { label: "Automatic", value: "Automatic" },
    { label: "CVT", value: "CVT" }
  ];

  const statusOptions = [
    { label: "Active", value: true },
    { label: "Inactive", value: false }
  ];

  useEffect(() => {
    fetchVariants();
    fetchModels();
  }, []);

  // Fetch Variants from API
  async function fetchVariants() {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/variants');
      if (!res.ok) throw new Error('Failed to fetch variants');
      const data = await res.json();
      setVariants(data.variants || []);
    } catch (err) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
    } finally {
      setLoading(false);
    }
  }

  // Fetch Models from API
  async function fetchModels() {
    try {
      const res = await fetch('/api/v1/models');
      if (!res.ok) throw new Error('Failed to fetch models');
      const data = await res.json();
      const modelOptions = data.models?.map(model => ({
        label: `${model.brand?.name} ${model.name}`,
        value: model.id
      })) || [];
      setModels(modelOptions);
    } catch (err) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to load models', life: 3000 });
    }
  }

  const openAdd = () => {
    setForm({ 
      name: "", 
      modelId: "",
      fuelType: "",
      transmission: "",
      seatingCapacity: null,
      active: true
    });
    setErrors({});
    setEditingIndex(null);
    setShowDialog(true);
  };

  const openEdit = (index) => {
    const variant = variants[index];
    setForm({ 
      name: variant.name, 
      modelId: variant.modelId,
      fuelType: variant.fuelType || "",
      transmission: variant.transmission || "",
      seatingCapacity: variant.seatingCapacity,
      active: variant.active
    });
    setErrors({});
    setEditingIndex(index);
    setShowDialog(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Variant Name is required";
    if (!form.modelId) errs.modelId = "Model is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // Save variant: POST or PUT to API
  const saveVariant = async () => {
    if (!validate()) return;

    setSaving(true);

    const body = {
      name: form.name.trim(),
      modelId: form.modelId,
      fuelType: form.fuelType || null,
      transmission: form.transmission || null,
      seatingCapacity: form.seatingCapacity,
      active: form.active
    };

    try {
      let res;
      if (editingIndex !== null) {
        const variantId = variants[editingIndex].id;
        res = await fetch(`/api/v1/variants/${variantId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      } else {
        res = await fetch('/api/v1/variants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save variant');

      toast.current.show({ 
        severity: 'success', 
        summary: editingIndex !== null ? 'Variant Updated' : 'Variant Added', 
        detail: form.name, 
        life: 2000 
      });

      // Refresh variants list
      fetchVariants();

      setShowDialog(false);
      setEditingIndex(null);
    } catch (err) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
    } finally {
      setSaving(false);
    }
  }

  // Delete variant via API
  const deleteVariant = async (index) => {
    const variant = variants[index];
    if (!variant) return;
    if (!confirm(`Are you sure you want to delete the variant "${variant.name}"?`)) return;

    try {
      const res = await fetch(`/api/v1/variants/${variant.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete variant');

      toast.current.show({ severity: 'success', summary: 'Variant Deleted', detail: variant.name, life: 2000 });

      // Refresh list
      fetchVariants();
    } catch (err) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
    }
  }

  // Custom cell renderers
  const statusBody = (rowData) => (
    <Tag
      value={rowData.active ? "Active" : "Inactive"}
      severity={rowData.active ? "success" : "danger"}
      rounded
    />
  );

  const modelBody = (rowData) => (
    <span>{rowData.model?.brand?.name} {rowData.model?.name}</span>
  );

  const actionBody = (rowData, { rowIndex }) => (
    <div className="flex gap-2">
      <Button 
        icon="pi pi-pencil" 
        className="p-button-text p-button-sm" 
        onClick={() => openEdit(rowIndex)} 
        aria-label="Edit" 
      />
      <Button 
        icon="pi pi-trash" 
        className="p-button-text p-button-sm text-red-600" 
        onClick={() => deleteVariant(rowIndex)} 
        aria-label="Delete" 
      />
    </div>
  );

  const activeVariants = variants.filter(v => v.active).length;
  const inactiveVariants = variants.filter(v => !v.active).length;

  return (
    <div className="p-4 min-h-screen bg-gradient-to-r from-gray-900 via-gray-500 to-gray-600 font-sans">
      <Toast ref={toast} />
      <div className="mb-4">
        <BreadCrumb 
          model={breadcrumbItems} 
          home={{ icon: 'pi pi-home', command: () => window.location.href = '/' }} 
          className="text-white" 
        />
      </div>
      <h1 className="text-white text-3xl mb-6 font-extrabold">Variants</h1>
      <div className="flex flex-wrap gap-4 mb-6 text-white">
        <span className="font-extrabold flex items-center">
          <i className="pi pi-check mr-1" />{activeVariants} Active
        </span>
        <span className="font-extrabold flex items-center">
          <i className="pi pi-times mr-1" />{inactiveVariants} Inactive
        </span>
        <span className="font-extrabold flex items-center">
          <i className="pi pi-list mr-1" /> {variants.length} Total
        </span>
        <Button label="Add Variant" icon="pi pi-plus" onClick={openAdd} className="ml-auto" />
      </div>

      <div className="bg-gray-900 p-4 rounded shadow-lg overflow-x-auto">
        <DataTable 
          value={variants} 
          stripedRows 
          paginator 
          rows={10} 
          loading={loading} 
          emptyMessage="No variants found."
        >
          <Column field="name" header="Variant Name" sortable />
          <Column body={modelBody} header="Model" sortable />
          <Column field="fuelType" header="Fuel Type" sortable />
          <Column field="transmission" header="Transmission" sortable />
          <Column field="seatingCapacity" header="Seating" sortable />
          <Column body={statusBody} header="Status" sortable />
          <Column body={actionBody} header="Actions" />
        </DataTable>
      </div>

      <Dialog
        header={editingIndex !== null ? "Edit Variant" : "Add Variant"}
        visible={showDialog}
        style={{ width: '500px' }}
        modal
        onHide={() => !saving && setShowDialog(false)}
        blockScroll
        draggable={false}
        resizable={false}
      >
        <div className="p-fluid">
          <div className="field">
            <label htmlFor="name" className="font-bold">Variant Name</label>
            <InputText 
              id="name" 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              className={errors.name ? "p-invalid" : ""} 
              autoFocus 
            />
            {errors.name && <small className="p-error">{errors.name}</small>}
          </div>

          <div className="field mt-3">
            <label htmlFor="modelId" className="font-bold">Model</label>
            <Dropdown
              id="modelId"
              value={form.modelId}
              options={models}
              onChange={(e) => setForm({ ...form, modelId: e.value })}
              placeholder="Select Model"
              className={errors.modelId ? "p-invalid" : ""}
              filter
              filterBy="label"
            />
            {errors.modelId && <small className="p-error">{errors.modelId}</small>}
          </div>

          <div className="field mt-3">
            <label htmlFor="fuelType" className="font-bold">Fuel Type</label>
            <Dropdown
              id="fuelType"
              value={form.fuelType}
              options={fuelTypeOptions}
              onChange={(e) => setForm({ ...form, fuelType: e.value })}
              placeholder="Select Fuel Type"
              className=""
              filter
            />
          </div>

          <div className="field mt-3">
            <label htmlFor="transmission" className="font-bold">Transmission</label>
            <Dropdown
              id="transmission"
              value={form.transmission}
              options={transmissionOptions}
              onChange={(e) => setForm({ ...form, transmission: e.value })}
              placeholder="Select Transmission"
              className=""
              filter
            />
          </div>

          <div className="field mt-3">
            <label htmlFor="seatingCapacity" className="font-bold">Seating Capacity</label>
            <InputNumber
              id="seatingCapacity"
              value={form.seatingCapacity}
              onValueChange={(e) => setForm({ ...form, seatingCapacity: e.value })}
              mode="decimal"
              min={1}
              max={10}
              showButtons
              className=""
            />
          </div>

          <div className="field mt-3">
            <label htmlFor="active" className="font-bold">Status</label>
            <Dropdown
              id="active"
              value={form.active}
              options={statusOptions}
              onChange={(e) => setForm({ ...form, active: e.value })}
              placeholder="Select Status"
              className=""
              filter
            />
          </div>

          <div className="flex mt-4 justify-end gap-3">
            <Button label="Cancel" className="p-button-secondary" onClick={() => !saving && setShowDialog(false)} disabled={saving} />
            <Button label={editingIndex !== null ? "Save Changes" : "Add Variant"} className="p-button-primary" onClick={saveVariant} disabled={saving} loading={saving} />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
