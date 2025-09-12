"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { Checkbox } from "primereact/checkbox";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { BreadCrumb } from "primereact/breadcrumb";
import { ProgressBar } from "primereact/progressbar";

export default function ModelsPage() {
  const [models, setModels] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [form, setForm] = useState({ 
    name: "", 
    brandId: null,
    active: true 
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const toast = useRef(null);

  const breadcrumbItems = [
    { label: "Home", command: () => window.location.href = "/" },
    { label: "Admin", command: () => window.location.href = "/admin" },
    { label: "Models" },
  ];

  // Handle window object safely
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get current user from JWT token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser(payload);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  // Check if user is admin
  const isAdmin = () => {
    return currentUser?.role_id === 'ADMIN' || currentUser?.role === 'ADMIN';
  };

  // Fetch data from APIs
  useEffect(() => {
    fetchBrands();
    fetchModels();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await fetch("/api/v1/brands");
      if (response.ok) {
        const data = await response.json();
        setBrands(data.brands.filter(brand => brand.active)); // Only active brands
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/v1/models");
      if (response.ok) {
        const data = await response.json();
        setModels(data.models);
      }
    } catch (error) {
      console.error("Error fetching models:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load models",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Templates for table columns
  const brandBodyTemplate = (rowData) => (
    <div className="flex items-center gap-2">
      {rowData.brand?.logo && (
        <img 
          src={rowData.brand.logo} 
          alt={rowData.brand.name} 
          className="w-6 h-6 sm:w-8 sm:h-8 object-contain bg-white rounded p-1" 
        />
      )}
      <span className="text-xs sm:text-sm">{rowData.brand?.name}</span>
    </div>
  );

  const statusBodyTemplate = (rowData) => (
    <span className={`px-2 py-1 rounded text-xs font-medium ${
      rowData.active 
        ? 'bg-green-600 text-black' 
        : 'bg-red-600 text-black'
    }`}>
      {rowData.active ? "Active" : "Inactive"}
    </span>
  );

  const variantCountTemplate = (rowData) => (
    <span className="text-xs sm:text-sm text-gray-300">
      {rowData._count?.variants || 0} variants
    </span>
  );

  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-1 sm:gap-2 justify-center">
      <Button 
        icon="pi pi-pencil" 
        rounded 
        severity="secondary"
        className="p-button-sm w-6 h-6 sm:w-8 sm:h-8" 
        onClick={() => openEdit(rowData)} 
        aria-label="Edit" 
      />
      {isAdmin() && (
        <Button
          icon="pi pi-trash"
          rounded
          severity="danger"
          className="p-button-sm w-6 h-6 sm:w-8 sm:h-8"
          onClick={() => deleteModel(rowData)}
          aria-label="Delete"
        />
      )}
    </div>
  );

  // Calculate stats
  const activeCount = models.filter((m) => m.active).length;
  const inactiveCount = models.length - activeCount;

  // Dialog functions
  const openAdd = () => {
    setEditing(null);
    setForm({ 
      name: "", 
      brandId: null,
      active: true 
    });
    setErrors({});
    setShowDialog(true);
  };

  const openEdit = (model) => {
    setEditing(model);
    setForm({ 
      name: model.name,
      brandId: model.brandId,
      active: model.active 
    });
    setErrors({});
    setShowDialog(true);
  };

  const onInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    if (name === "active") {
      setForm((f) => ({ ...f, active: checked }));
    } else if (name === "name") {
      setForm((f) => ({ ...f, name: value }));
      setErrors((e) => ({ ...e, name: value.trim() ? "" : "Model name is required." }));
    }
  };

  const onBrandChange = (e) => {
    setForm(f => ({ ...f, brandId: e.value }));
    setErrors(e => ({ ...e, brandId: "" }));
  };

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Model name is required.";
    if (!form.brandId) newErrors.brandId = "Brand is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save model to API
  const saveModel = async () => {
    if (!validate()) return;
    setSaving(true);
    
    try {
      const modelData = {
        name: form.name.trim(),
        brandId: form.brandId,
        active: form.active
      };

      let response;
      if (editing) {
        response = await fetch(`/api/v1/models/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(modelData),
        });
      } else {
        response = await fetch("/api/v1/models", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(modelData),
        });
      }

      const data = await response.json();
      if (response.ok) {
        setShowDialog(false);
        fetchModels();
        toast.current?.show({
          severity: "success",
          summary: editing ? "Model Updated" : "Model Added",
          detail: form.name,
          life: 2000,
        });
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: data.message || `Failed to ${editing ? 'update' : 'add'} model`,
          life: 3000,
        });
      }
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: `Failed to ${editing ? 'update' : 'add'} model`,
        life: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete model function (admin only)
  const deleteModel = async (model) => {
    if (!isAdmin()) {
      toast.current?.show({
        severity: "warn",
        summary: "Access Denied",
        detail: "Only administrators can delete models",
        life: 3000,
      });
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${model.name}?`)) {
      try {
        const response = await fetch(`/api/v1/models/${model.id}`, {
          method: "DELETE",
        });
        
        const data = await response.json();
        
        if (response.ok) {
          fetchModels();
          toast.current?.show({
            severity: "success",
            summary: "Model Deleted",
            detail: `${model.name} was deleted successfully!`,
            life: 2000,
          });
        } else {
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: data.message || "Failed to delete model",
            life: 3000,
          });
        }
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to delete model",
          life: 3000,
        });
      }
    }
  };

  // Brand dropdown templates
  const brandOptionTemplate = (option) => (
    <div className="flex items-center gap-2 p-2">
      {option.logo && (
        <img src={option.logo} alt={option.name} className="w-6 h-6 object-contain bg-white rounded p-1" />
      )}
      <span>{option.name}</span>
    </div>
  );

  const brandValueTemplate = (option) => {
    if (!option) return <span className="text-gray-400">Select Brand</span>;
    
    return (
      <div className="flex items-center gap-2">
        {option.logo && (
          <img src={option.logo} alt={option.name} className="w-6 h-6 object-contain bg-white rounded p-1" />
        )}
        <span>{option.name}</span>
      </div>
    );
  };

  const selectedBrand = brands.find(b => b.id === form.brandId);

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-950 via-gray-900 to-fuchsia-900 font-sans">
      <Toast ref={toast} />
      
      <div className="p-2 sm:p-4 lg:p-6">
        
        {/* Breadcrumb */}
        <div className="hidden sm:block mb-4">
          <BreadCrumb 
            model={breadcrumbItems}
            home={{ icon: "pi pi-home", command: () => window.location.href = "/" }}
            className="text-white font-bold text-sm"
          />
        </div>

        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white mb-2">
            Car Models
          </h1>
          {currentUser && (
            <span className="text-xs sm:text-sm text-gray-300">
              (Logged in as: {currentUser.role_id || currentUser.role || 'User'})
            </span>
          )}
        </div>

        {/* Stats and Add Button */}
        <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6 items-center text-xs sm:text-sm">
          <span className="font-bold text-white flex items-center">
            <i className="pi pi-check mr-1" />
            {activeCount} Active
          </span>
          <span className="font-bold text-rose-400 flex items-center">
            <i className="pi pi-times mr-1" />
            {inactiveCount} Inactive
          </span>
          <span className="font-bold text-white flex items-center">
            <i className="pi pi-list mr-1" />
            {models.length} Total
          </span>
          <Button 
            label="Add Model" 
            icon="pi pi-plus" 
            className="ml-auto bg-gradient-to-r from-fuchsia-700 to-purple-600 border-none font-bold px-3 py-1 sm:px-6 sm:py-2 text-xs sm:text-sm lg:text-base rounded-lg hover:scale-105 transition-transform" 
            onClick={openAdd} 
          />
        </div>

        {/* Data Table */}
        <div className="bg-zinc-900 p-2 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-2xl overflow-x-auto">
          <DataTable
            value={models}
            stripedRows
            paginator
            rows={10}
            loading={loading}
            className="p-datatable-sm text-white text-xs sm:text-sm"
            emptyMessage="No models found."
            responsiveLayout="scroll"
          >
            <Column 
              field="name" 
              header="Model Name" 
              className="text-xs sm:text-sm font-medium"
            />
            <Column 
              header="Brand" 
              body={brandBodyTemplate} 
              className="w-32 sm:w-40"
            />
            <Column
              header="Status"
              body={statusBodyTemplate}
              className="w-20 sm:w-24"
            />
            <Column 
              header="Variants" 
              body={variantCountTemplate} 
              className="w-20 sm:w-24"
            />
            <Column 
              header="Actions" 
              body={actionBodyTemplate} 
              className="w-28 sm:w-32"
            />
          </DataTable>
        </div>
      </div>

      {/* Dialog */}
      <Dialog
        header={
          <span className="text-lg sm:text-xl font-bold text-fuchsia-700">
            {editing ? "Edit Model" : "Add New Model"}
          </span>
        }
        visible={showDialog}
        position="right"
        modal
        blockScroll
        className="rounded-lg shadow-xl"
        style={{ 
          width: isMobile ? "95vw" : "400px", 
          maxWidth: "100vw",
          margin: isMobile ? "10px" : "0"
        }}
        onHide={() => setShowDialog(false)}
      >
        <div className="flex flex-col gap-4 p-2 sm:p-4">
          
          {/* Model Name Input */}
          <div>
            <label className="font-bold text-sm text-gray-700 block mb-2">
              Model Name <span className="text-red-600">*</span>
            </label>
            <InputText
              name="name"
              value={form.name}
              onChange={onInputChange}
              placeholder="Enter model name"
              className={`w-full p-2 text-sm rounded-lg ${
                errors.name ? "border border-red-500" : ""
              }`}
              autoFocus
            />
            {errors.name && (
              <small className="text-red-500 text-xs mt-1 block">
                {errors.name}
              </small>
            )}
          </div>

          {/* Brand Dropdown */}
          <div>
            <label className="font-bold text-sm text-gray-700 block mb-2">
              Brand <span className="text-red-600">*</span>
            </label>
            <Dropdown
              value={selectedBrand}
              options={brands}
              onChange={onBrandChange}
              optionLabel="name"
              optionValue="id"
              itemTemplate={brandOptionTemplate}
              valueTemplate={brandValueTemplate}
              placeholder="Select Brand"
              className={`w-full ${errors.brandId ? "border border-red-500" : ""}`}
              showClear
            />
            {errors.brandId && (
              <small className="text-red-500 text-xs mt-1 block">
                {errors.brandId}
              </small>
            )}
          </div>

          {/* Active Checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              inputId="activeModel"
              name="active"
              checked={form.active}
              onChange={onInputChange}
            />
            <label htmlFor="activeModel" className="font-bold text-sm text-gray-700">
              Active
            </label>
          </div>

          {/* Progress Bar */}
          {saving && (
            <ProgressBar mode="indeterminate" className="h-2" />
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4 justify-end">
            <Button
              label="Cancel"
              className="bg-gray-400 border-none font-bold px-4 py-2 text-sm rounded-lg"
              onClick={() => setShowDialog(false)}
              disabled={saving}
            />
            <Button
              label={editing ? "Update Model" : "Add Model"}
              icon="pi pi-check"
              className="bg-gradient-to-r from-fuchsia-700 to-purple-700 border-none font-bold px-4 py-2 text-sm rounded-lg"
              onClick={saveModel}
              disabled={!form.name.trim() || !form.brandId || saving}
              loading={saving}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
