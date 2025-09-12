"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { BreadCrumb } from "primereact/breadcrumb";
import { ProgressBar } from "primereact/progressbar";
import { Checkbox } from "primereact/checkbox";
import { PrimeReactProvider } from 'primereact/api';

// PrimeReact configuration
const primeReactConfig = {
  hideOverlaysOnDocumentScrolling: false,
  ripple: true,
  inputStyle: 'outlined',
  locale: 'en',
  appendTo: 'self'
};

export default function ChecklistOptionsPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ 
    name: "", 
    categoryId: "", 
    description: "",
    checkType: "BOOLEAN",
    required: false,
    active: true
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const toast = useRef(null);

  const breadcrumbItems = [
    { label: "Home", command: () => window.location.href = "/" },
    { label: "Admin", command: () => window.location.href = "/admin" },
    { label: "Checklist Items" },
  ];

  const checkTypes = [
    { label: "Yes/No", value: "BOOLEAN" },
    { label: "Text", value: "TEXT" },
    { label: "Number", value: "NUMBER" },
    { label: "Dropdown", value: "DROPDOWN" },
    { label: "Rating", value: "RATING" }
  ];

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

  // Calculate counts dynamically
  const activeItems = items.filter(item => item && item.active).length;
  const inactiveItems = items.length - activeItems;

  // Handle component mounting
  useEffect(() => {
    setMounted(true);
    fetchItems();
    fetchCategories();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/checklistitems');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch items: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setItems(Array.isArray(data.data) ? data.data : []);
      } else {
        throw new Error(data.error || 'Failed to fetch checklist items');
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      if (toast.current) {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to fetch checklist items',
          life: 3000
        });
      }
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/v1/checklistcategories');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        // Format categories for dropdown with proper error handling
        const formattedCategories = data.data
          .filter(cat => cat && cat.active && cat.name && cat.id)
          .map(cat => ({
            label: cat.name,
            value: cat.id
          }));
        setCategories(formattedCategories);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
      if (toast.current) {
        toast.current.show({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Could not load categories. Please refresh the page.',
          life: 3000
        });
      }
    }
  };

  const openAdd = () => {
    setForm({ 
      name: "", 
      categoryId: "", 
      description: "",
      checkType: "BOOLEAN",
      required: false,
      active: true
    });
    setErrors({});
    setEditingItem(null);
    setShowDialog(true);
  };

  const openEdit = (item) => {
    if (!item) return;
    
    setForm({ 
      name: item.name || "", 
      categoryId: item.categoryId || "",
      description: item.description || "",
      checkType: item.checkType || "BOOLEAN",
      required: Boolean(item.required),
      active: Boolean(item.active)
    });
    setErrors({});
    setEditingItem(item);
    setShowDialog(true);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name || !form.name.trim()) {
      newErrors.name = "Item Name is required.";
    }
    if (!form.categoryId) {
      newErrors.categoryId = "Category is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveItem = async () => {
    if (!validate()) return;
    
    try {
      setSaving(true);
      
      const url = editingItem 
        ? `/api/v1/checklistitems/${editingItem.id}`
        : '/api/v1/checklistitems';
      
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          name: form.name.trim()
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save item: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        await fetchItems(); // Refresh the list
        if (toast.current) {
          toast.current.show({
            severity: 'success',
            summary: 'Success',
            detail: `Item "${form.name}" ${editingItem ? 'updated' : 'added'} successfully`,
            life: 3000
          });
        }
        setShowDialog(false);
      } else {
        throw new Error(data.error || `Failed to ${editingItem ? 'update' : 'add'} item`);
      }
    } catch (error) {
      console.error('Error saving item:', error);
      if (toast.current) {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: error.message || `Failed to ${editingItem ? 'update' : 'add'} item`,
          life: 3000
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (item) => {
    if (!item || !item.id) return;
    
    if (!isAdmin()) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Access Denied',
        detail: 'Only administrators can delete items',
        life: 3000
      });
      return;
    }
    
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;
    
    try {
      const response = await fetch(`/api/v1/checklistitems/${item.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete item: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        await fetchItems(); // Refresh the list
        if (toast.current) {
          toast.current.show({
            severity: 'success',
            summary: 'Success',
            detail: `Item "${item.name}" deleted successfully`,
            life: 3000
          });
        }
      } else {
        throw new Error(data.error || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      if (toast.current) {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to delete item',
          life: 3000
        });
      }
    }
  };

  const dialogFooter = (
    <Button
      label={saving ? "Saving..." : "Save"}
      icon={saving ? "pi pi-spin pi-spinner" : "pi pi-check"}
      className="w-full mt-4 bg-black font-extrabold border-none py-3 rounded-md"
      onClick={saveItem}
      disabled={saving}
    />
  );

  const actionBodyTemplate = (rowData) => {
    if (!rowData) return null;
    
    return (
      <div className="flex gap-2">
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
            onClick={() => deleteItem(rowData)} 
            aria-label="Delete"
          />
        )}
      </div>
    );
  };

  const statusBodyTemplate = (rowData) => {
    if (!rowData) return null;
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        rowData.active 
          ? 'bg-green-500 text-white' 
          : 'bg-red-500 text-white'
      }`}>
        {rowData.active ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const categoryBodyTemplate = (rowData) => {
    if (!rowData) return null;
    
    return (
      <span className="text-blue-300">
        {rowData.category?.name || 'Unknown'}
      </span>
    );
  };

  const checkTypeBodyTemplate = (rowData) => {
    if (!rowData) return null;
    
    const typeLabels = {
      'BOOLEAN': 'Yes/No',
      'TEXT': 'Text',
      'NUMBER': 'Number',
      'DROPDOWN': 'Dropdown',
      'RATING': 'Rating'
    };
    
    return (
      <span className="text-purple-300">
        {typeLabels[rowData.checkType] || rowData.checkType}
      </span>
    );
  };

  const requiredBodyTemplate = (rowData) => {
    if (!rowData) return null;
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        rowData.required 
          ? 'bg-orange-500 text-white' 
          : 'bg-gray-500 text-white'
      }`}>
        {rowData.required ? 'Required' : 'Optional'}
      </span>
    );
  };

  // Don't render anything until mounted to avoid SSR issues
  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-4 min-h-screen bg-gradient-to-r from-gray-900 via-purple-900 to-purple-800 font-sans">
        <div className="flex flex-column align-items-center justify-content-center" style={{ minHeight: '400px' }}>
          <ProgressBar mode="indeterminate" style={{ height: '6px', width: '300px' }} />
          <p className="text-white mt-3">Loading checklist items...</p>
        </div>
      </div>
    );
  }

  return (
    <PrimeReactProvider value={primeReactConfig}>
      <div className="p-4 min-h-screen bg-gradient-to-r from-gray-900 via-purple-900 to-purple-800 font-sans">
        <Toast ref={toast} />
        <div className="mb-4">
          <BreadCrumb 
            model={breadcrumbItems} 
            home={{ icon: "pi pi-home" }} 
            className="text-white font-bold" 
          />
        </div>
        
        <div className="text-3xl font-extrabold text-white mb-3">Checklist Items</div>
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <span className="font-extrabold text-green-400 flex items-center">
            <i className="pi pi-check mr-1" />
            {activeItems} Active
          </span>
          <span className="font-extrabold text-rose-400 flex items-center">
            <i className="pi pi-times mr-1" />
            {inactiveItems} Inactive
          </span>
          <span className="font-extrabold text-indigo-200 flex items-center">
            <i className="pi pi-list mr-1" />
            {items.length} Total Checklist Items
          </span>
          {isAdmin() && (
            <Button
              label="Add Item"
              icon="pi pi-plus"
              className="ml-auto bg-black border-none font-bold"
              onClick={openAdd}
            />
          )}
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl shadow-2xl overflow-x-auto">
          <DataTable value={items} stripedRows paginator rows={5} className="p-datatable-sm text-white" emptyMessage="No checklist items found.">
            <Column field="name" header="Item Name" />
            <Column body={categoryBodyTemplate} header="Category" />
            <Column body={checkTypeBodyTemplate} header="Check Type" />
            <Column body={requiredBodyTemplate} header="Required" />
            <Column body={statusBodyTemplate} header="Status" />
            <Column body={actionBodyTemplate} header="Actions" />
          </DataTable>
        </div>

        <Dialog
          header={<span className="text-xl font-extrabold text-fuchsia-700">{editingItem === null ? "Add Item" : "Edit Item"}</span>}
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
              placeholder="Item Name"
              className={`w-full p-2 rounded-lg mt-3 ${errors.name ? "border border-red-500" : ""}`}
              autoFocus
            />
            {errors.name && <small className="text-red-500">{errors.name}</small>}

            <label className="font-bold text-gray-700 ml-1 mt-1">Category</label>
            <Dropdown
              value={form.categoryId}
              options={categories}
              onChange={e => setForm(f => ({ ...f, categoryId: e.value }))}
              placeholder="Select Category"
              className={`w-full p-2 rounded-lg mt-2 ${errors.categoryId ? "border border-red-500" : ""}`}
              panelClassName="border-2 border-purple-400"
              style={{ borderColor: "#a78bfa" }}
            />
            {errors.categoryId && <small className="text-red-500">{errors.categoryId}</small>}

            <label className="font-bold text-gray-700 ml-1 mt-1">Description</label>
            <InputText
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Description (optional)"
              className="w-full p-2 rounded-lg mt-2"
            />

            <label className="font-bold text-gray-700 ml-1 mt-1">Check Type</label>
            <Dropdown
              value={form.checkType}
              options={checkTypes}
              onChange={e => setForm(f => ({ ...f, checkType: e.value }))}
              placeholder="Select Check Type"
              className="w-full p-2 rounded-lg mt-2"
              panelClassName="border-2 border-purple-400"
              style={{ borderColor: "#a78bfa" }}
            />

            <div className="flex align-items-center mt-3">
              <Checkbox
                inputId="required"
                checked={form.required}
                onChange={e => setForm(f => ({ ...f, required: e.checked }))}
              />
              <label htmlFor="required" className="ml-2">Required</label>
            </div>

            <div className="flex align-items-center mt-2">
              <Checkbox
                inputId="active"
                checked={form.active}
                onChange={e => setForm(f => ({ ...f, active: e.checked }))}
              />
              <label htmlFor="active" className="ml-2">Active</label>
            </div>
          </form>
        </Dialog>
      </div>
    </PrimeReactProvider>
  );
}
