"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Checkbox } from "primereact/checkbox";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { BreadCrumb } from "primereact/breadcrumb";
import { FileUpload } from "primereact/fileupload";
import { ProgressBar } from "primereact/progressbar";

export default function ModelsPage() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    brand: "",
    logoFile: null,
    logoPreview: null,
    active: true,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const toast = useRef(null);
  const fileUploadRef = useRef(null);

  const breadcrumbItems = [
    { label: "Home", command: () => (window.location.href = "/") },
    { label: "Admin", command: () => (window.location.href = "/admin") },
    { label: "Models" },
  ];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const isAdmin = () =>
    currentUser?.role_id === "ADMIN" || currentUser?.role === "ADMIN";

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/v1/models");
      if (!response.ok) throw new Error("Failed to fetch models");
      const data = await response.json();
      setModels(data.models);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to load models",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const statusBodyTemplate = (rowData) => (
    <span
      className={`px-2 py-1 rounded font-medium text-xm ${
        rowData.active ? "bg-green-500 text-gray-400" : "bg-red-500 text-gray-400"
      }`}
    >
      {rowData.active ? "Active" : "Inactive"}
    </span>
  );

  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2 justify-start ml-3">
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
          onClick={() => deleteModel(rowData)}
          aria-label="Delete"
        />
      )}
    </div>
  );

  const activeCount = models.filter((m) => m.active).length;
  const inactiveCount = models.length - activeCount;

  // Allow only local data update, no insertion to server
  const openAdd = () => {
    setEditing(null);
    setForm({
      name: "",
      brand: "",
      logoFile: null,
      logoPreview: null,
      active: true,
    });
    setErrors({});
    setShowDialog(true);
  };

  const openEdit = (model) => {
    setEditing(model);
    setForm({
      name: model.name,
      brand: model.brand?.name || "",
      logoFile: null,
      logoPreview: model.brand?.logo || null,
      active: model.active,
    });
    setErrors({});
    setShowDialog(true);
  };

  const onInputChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === "active") {
      setForm((f) => ({ ...f, active: checked }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
      setErrors((e) => ({
        ...e,
        [name]: value.trim()
          ? ""
          : `${name[0].toUpperCase() + name.slice(1)} is required.`,
      }));
    }
  };

  const onFileSelect = (e) => {
    const file = e.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.current?.show({
          severity: "error",
          summary: "Invalid file",
          detail: "Please select an image file",
          life: 3000,
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.current?.show({
          severity: "error",
          summary: "File too large",
          detail: "Please select a file smaller than 5MB",
          life: 3000,
        });
        return;
      }
      setForm((prev) => ({ ...prev, logoFile: file }));
      const reader = new FileReader();
      reader.onload = (e) =>
        setForm((prev) => ({ ...prev, logoPreview: e.target.result }));
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Model name is required.";
    if (!form.brand.trim()) newErrors.brand = "Brand is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // The saveModel here modifies local state only, no API call
  const saveModel = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      // Prepare logo data for local model (base64 preview or null)
      let logoUrl = form.logoPreview;

      if (editing) {
        // Update model locally
        setModels((prev) =>
          prev.map((m) =>
            m === editing
              ? {
                  ...m,
                  name: form.name.trim(),
                  brand: { name: form.brand.trim(), logo: logoUrl },
                  logo: logoUrl,
                  active: form.active,
                }
              : m
          )
        );
        toast.current?.show({
          severity: "success",
          summary: "Model Updated",
          detail: form.name,
          life: 2000,
        });
      } else {
        // Add to local list only with temporary id
        const newModel = {
          id: models.length + 1,
          name: form.name.trim(),
          brand: { name: form.brand.trim(), logo: logoUrl },
          logo: logoUrl,
          active: form.active,
        };
        setModels((prev) => [...prev, newModel]);
        toast.current?.show({
          severity: "success",
          summary: "Model Added",
          detail: form.name,
          life: 2000,
        });
      }
      setShowDialog(false);
      setEditing(null);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to save model locally",
        life: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete model locally only
  const deleteModel = (model) => {
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
      setModels((prev) => prev.filter((m) => m !== model));
      toast.current?.show({
        severity: "success",
        summary: "Model Deleted",
        detail: `${model.name} was deleted!`,
        life: 2000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 via-gray-500 to-gray-600 font-sans">
      <Toast ref={toast} />
      <div className="p-2 sm:p-4 lg:p-6">
        <div className="hidden sm:block mb-4">
          <BreadCrumb
            model={breadcrumbItems}
            home={{ icon: "pi pi-home", command: () => (window.location.href = "/") }}
            className="text-white font-bold text-sm"
          />
        </div>
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white mb-2">
            Car Models
          </h1>
          {currentUser && (
            <span className="text-xs sm:text-sm text-gray-300">
              (Logged in as: {currentUser.role_id || currentUser.role || "User"})
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6 items-center text-xs sm:text-sm">
          <span className="font-bold text-white flex items-center">
            <i className="pi pi-check mr-1" />
            {models.filter((m) => m.active).length} Active
          </span>
          <span className="font-bold text-rose-400 flex items-center">
            <i className="pi pi-times mr-1" />
            {models.length - models.filter((m) => m.active).length} Inactive
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
            tableStyle={{ tableLayout: "fixed", width: "100%" }}
          >
            <Column
              field="name"
              header="Model"
              className="text-xs sm:text-sm font-medium"
              style={{ width: "25%" }}
            />
            <Column
              field="brand.name"
              header="Brand"
              className="text-xs sm:text-sm font-medium"
              body={(rowData) => rowData.brand?.name || ""}
              style={{ width: "25%" }}
            />
            <Column
              header="Status"
              body={statusBodyTemplate}
              style={{ width: "25%" }}
            />
            <Column
              header="Action"
              body={actionBodyTemplate}
              style={{ width: "25%" }}
            />
          </DataTable>
        </div>
      </div>

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
          margin: isMobile ? "10px" : "0",
        }}
        onHide={() => setShowDialog(false)}
      >
        <div className="flex flex-col gap-4 p-2 sm:p-4">
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
              <small className="text-red-500 text-xs mt-1 block">{errors.name}</small>
            )}
          </div>
          <div>
            <label className="font-bold text-sm text-gray-700 block mb-2">
              Brand <span className="text-red-600">*</span>
            </label>
            <InputText
              name="brand"
              value={form.brand}
              onChange={onInputChange}
              placeholder="Enter brand name"
              className={`w-full p-2 text-sm rounded-lg ${
                errors.brand ? "border border-red-500" : ""
              }`}
            />
            {errors.brand && (
              <small className="text-red-500 text-xs mt-1 block">{errors.brand}</small>
            )}
          </div>
          <div>
            <label className="font-bold text-sm text-gray-700 block mb-2">
              Logo (Optional)
            </label>
            {form.logoPreview && (
              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-1">Current Logo:</div>
                <div className="w-20 h-20 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-white">
                  <img
                    src={form.logoPreview}
                    alt="Logo preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            )}
            <FileUpload
              ref={fileUploadRef}
              mode="basic"
              name="logo"
              accept="image/*"
              maxFileSize={5000000}
              onSelect={onFileSelect}
              chooseLabel="Choose Logo"
              className="w-full"
              auto={false}
              customUpload={true}
            />
            <div className="text-xs text-gray-500 mt-1">
              Upload a logo image (optional). Max size: 5MB
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              inputId="activeModel"
              name="active"
              checked={form.active}
              onChange={onInputChange}
            />
            <label
              htmlFor="activeModel"
              className="font-bold text-sm text-gray-700"
            >
              Active
            </label>
          </div>
          {saving && <ProgressBar mode="indeterminate" className="h-2" />}
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
              disabled={!form.name.trim() || !form.brand.trim() || saving}
              loading={saving}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
