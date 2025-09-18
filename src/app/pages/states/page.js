"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { BreadCrumb } from "primereact/breadcrumb";
import { Checkbox } from "primereact/checkbox";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

export default function StatesPage() {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", code: "", active: true });
  const [errors, setErrors] = useState({});
  const [stats, setStats] = useState({ active: 0, inactive: 0, total: 0 });
  const [saving, setSaving] = useState(false);
  const toast = useRef(null);

  const breadcrumbItems = [
    { label: "Home", command: () => window.location.href = "/" },
    { label: "Admin", command: () => window.location.href = "/admin" },
    { label: "States" },
  ];

  // Fetch states from API
  useEffect(() => {
    fetchStates();
    fetchStats();
  }, []);

  const fetchStates = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/v1/states");
      const data = await response.json();
      
      if (data.success) {
        setStates(data.data);
      } else {
        throw new Error(data.error || "Failed to fetch states");
      }
    } catch (error) {
      console.error("Error fetching states:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load states",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/v1/states/stats");
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data.counts);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const openAdd = () => {
    setForm({ name: "", code: "", active: true });
    setErrors({});
    setEditing(null);
    setShowDialog(true);
  };

  const openEdit = (state) => {
    setForm({ 
      name: state.name, 
      code: state.code, 
      active: state.active 
    });
    setErrors({});
    setEditing(state);
    setShowDialog(true);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.code.trim()) newErrors.code = "Code is required.";
    if (!form.name.trim()) newErrors.name = "State Name is required.";
    if (form.code.trim().length < 2) newErrors.code = "Code must be at least 2 characters.";
    if (form.code.trim().length > 5) newErrors.code = "Code must be maximum 5 characters.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveState = async () => {
    if (!validate()) return;
    
    setSaving(true);
    try {
      const stateData = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        active: form.active
      };

      let response;
      if (editing) {
        // Update existing state
        response = await fetch("/api/v1/states", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...stateData, id: editing.id }),
        });
      } else {
        // Create new state
        response = await fetch("/api/v1/states", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(stateData),
        });
      }

      const data = await response.json();
      
      if (data.success) {
        setShowDialog(false);
        fetchStates();
        fetchStats();
        toast.current?.show({
          severity: "success",
          summary: editing ? "State Updated" : "State Added",
          detail: form.name,
          life: 2000,
        });
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: data.error || `Failed to ${editing ? 'update' : 'add'} state`,
          life: 3000,
        });
      }
    } catch (error) {
      console.error("Error saving state:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: `Failed to ${editing ? 'update' : 'add'} state`,
        life: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteState = (state) => {
    confirmDialog({
      message: `Are you sure you want to delete "${state.name}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          const response = await fetch(`/api/v1/states?id=${state.id}`, {
            method: "DELETE",
          });
          
          const data = await response.json();
          
          if (data.success) {
            fetchStates();
            fetchStats();
            toast.current?.show({
              severity: "success",
              summary: "State Deleted",
              detail: `${state.name} was deleted successfully`,
              life: 2000,
            });
          } else {
            toast.current?.show({
              severity: "error",
              summary: "Error",
              detail: data.error || "Failed to delete state",
              life: 3000,
            });
          }
        } catch (error) {
          console.error("Error deleting state:", error);
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to delete state",
            life: 3000,
          });
        }
      }
    });
  };

  const statusBodyTemplate = (rowData) => (
    <span className={`px-2 py-1 rounded text-xs font-medium ${
      rowData.active 
        ? 'bg-green-600 text-white' 
        : 'bg-red-600 text-white'
    }`}>
      {rowData.active ? "Active" : "Inactive"}
    </span>
  );

  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2 justify-center">
      <Button 
        icon="pi pi-pencil" 
        rounded 
        severity="secondary"
        className="p-button-sm" 
        onClick={() => openEdit(rowData)} 
        aria-label="Edit" 
      />
      <Button
        icon="pi pi-trash"
        rounded
        severity="danger"
        className="p-button-sm"
        onClick={() => deleteState(rowData)}
        aria-label="Delete"
      />
    </div>
  );

  const dialogFooter = (
    <div className="flex gap-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        className="p-button-text"
        onClick={() => setShowDialog(false)}
        disabled={saving}
      />
      <Button
        label={saving ? "Saving..." : "Save"}
        icon={saving ? "pi pi-spin pi-spinner" : "pi pi-check"}
        className="bg-black font-extrabold border-none"
        onClick={saveState}
        disabled={saving}
      />
    </div>
  );

  return (
    <div className="p-4 min-h-screen bg-gradient-to-r from-gray-900 via-gray-500 to-gray-600 font-sans">
      <Toast ref={toast} />
      <ConfirmDialog />
      
      <div className="mb-4">
        <BreadCrumb 
          model={breadcrumbItems} 
          home={{ icon: "pi pi-home", command: () => window.location.href = "/" }} 
          className="text-white font-bold" 
        />
      </div>
      
      <div className="text-3xl font-extrabold text-white mb-3">States</div>
      
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <span className="font-extrabold text-green-400 flex items-center">
          <i className="pi pi-check mr-1" />
          {stats.active} Active
        </span>
        <span className="font-extrabold text-rose-400 flex items-center">
          <i className="pi pi-times mr-1" />
          {stats.inactive} Inactive
        </span>
        <span className="font-extrabold text-indigo-200 flex items-center">
          <i className="pi pi-list mr-1" />
          {stats.total} Total States
        </span>
        <Button
          label="Add State"
          icon="pi pi-plus"
          className="ml-auto bg-black border-none font-bold"
          onClick={openAdd}
        />
      </div>
      
      <div className="bg-zinc-900 p-6 rounded-2xl shadow-2xl overflow-x-auto">
        <DataTable 
          value={states} 
          stripedRows 
          paginator 
          rows={10} 
          loading={loading}
          className="p-datatable-sm text-white" 
          emptyMessage="No states found."
        >
          <Column field="name" header="State Name" sortable />
          <Column field="code" header="Code" sortable />
          <Column 
            header="Status" 
            body={statusBodyTemplate}
            sortable
            sortField="active"
          />
          <Column
            header="Actions"
            body={actionBodyTemplate}
            style={{ width: '120px' }}
          />
        </DataTable>
      </div>

      <Dialog
        header={
          <span className="text-xl font-extrabold text-fuchsia-700">
            {editing ? "Edit State" : "Add New State"}
          </span>
        }
        visible={showDialog}
        position="right"
        modal
        blockScroll
        className="rounded-lg shadow-xl"
        style={{ width: 400, maxWidth: "100vw" }}
        onHide={() => setShowDialog(false)}
        footer={dialogFooter}
      >
        <div className="flex flex-col gap-4 p-2">
          <div>
            <label className="font-bold text-sm text-gray-700 block mb-2">
              State Code <span className="text-red-600">*</span>
            </label>
            <InputText
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="e.g., TS, AP, MH"
              className={`w-full p-2 rounded-lg mt-1 ${errors.code ? "border border-red-500" : ""}`}
              autoFocus
            />
            {errors.code && <small className="text-red-500">{errors.code}</small>}
          </div>

          <div>
            <label className="font-bold text-sm text-gray-700 block mb-2">
              State Name <span className="text-red-600">*</span>
            </label>
            <InputText
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Enter state name"
              className={`w-full p-2 rounded-lg mt-1 ${errors.name ? "border border-red-500" : ""}`}
            />
            {errors.name && <small className="text-red-500">{errors.name}</small>}
          </div>

          <div className="flex items-center mt-2">
            <Checkbox
              inputId="active"
              checked={form.active}
              onChange={e => setForm(f => ({ ...f, active: e.checked }))}
              className="mr-2"
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-700">
              Active
            </label>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
