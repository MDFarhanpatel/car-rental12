"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { BreadCrumb } from "primereact/breadcrumb";
import { ProgressBar } from "primereact/progressbar";

export default function ChecklistCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", active: true });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const toast = useRef(null);

  // Detect mobile devices
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Home", command: () => window.location.href = "/" },
    { label: "Admin", command: () => window.location.href = "/admin" },
    { label: "Checklist Categories" },
  ];

  // Calculate counts dynamically
  const activeCount = categories.filter(c => c.active).length;
  const inactiveCount = categories.length - activeCount;

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Create a new function for fetching categories without setting loading state
  const fetchCategoriesWithoutLoading = async () => {
    try {
      const response = await fetch('/api/v1/checklistcategories');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data || []);
      } else {
        console.error('Failed to fetch categories:', data.error);
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: data.error || 'Failed to fetch categories',
          life: 3000
        });
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch categories',
        life: 3000
      });
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/checklistcategories');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data || []);
      } else {
        console.error('Failed to fetch categories:', data.error);
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: data.error || 'Failed to fetch categories',
          life: 3000
        });
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch categories',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setForm({ name: "", description: "", active: true });
    setErrors({});
    setEditingCategory(null);
    setShowAddDialog(true);
  };

  const openEdit = (category) => {
    setForm({ 
      name: category.name, 
      description: category.description, 
      active: category.active 
    });
    setErrors({});
    setEditingCategory(category);
    setShowEditDialog(true);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Category Name is required.";
    if (!form.description.trim()) newErrors.description = "Description is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveAddCategory = async () => {
    if (!validate()) return;
    
    try {
      setSaving(true);
      const response = await fetch('/api/v1/checklistcategories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Use the new function instead of fetchCategories
        await fetchCategoriesWithoutLoading();
        setShowAddDialog(false);
        
        // Show success toast
        setTimeout(() => {
          toast.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: `Category "${form.name}" added successfully`,
            life: 3000
          });
        }, 100);
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: data.error || 'Failed to add category',
          life: 3000
        });
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to add category',
        life: 3000
      });
    } finally {
      setSaving(false);
    }
  };

  const saveEditCategory = async () => {
    if (!validate()) return;
    
    try {
      setSaving(true);
      const response = await fetch('/api/v1/checklistcategories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...form, id: editingCategory.id }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Use the new function instead of fetchCategories
        await fetchCategoriesWithoutLoading();
        setShowEditDialog(false);
        
        // Show success toast
        setTimeout(() => {
          toast.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: `Category "${form.name}" updated successfully`,
            life: 3000
          });
        }, 100);
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: data.error || 'Failed to update category',
          life: 3000
        });
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update category',
        life: 3000
      });
    } finally {
      setSaving(false);
    }
  };

  const addDialogFooter = (
    <Button
      label={saving ? "Saving..." : "Save"}
      icon={saving ? "pi pi-spin pi-spinner" : "pi pi-check"}
      className="w-full mt-4 bg-black font-extrabold border-none py-3 rounded-md"
      onClick={saveAddCategory}
      disabled={saving}
    />
  );

  const editDialogFooter = (
    <Button
      label={saving ? "Saving..." : "Save"}
      icon={saving ? "pi pi-spin pi-spinner" : "pi pi-check"}
      className="w-full mt-4 bg-black font-extrabold border-none py-3 rounded-md"
      onClick={saveEditCategory}
      disabled={saving}
    />
  );

  const actionBodyTemplate = (rowData) => {
    return (
      <Button 
        icon="pi pi-pencil" 
        rounded 
        className="p-button-sm p-button-outlined p-button-secondary"
        style={{ 
          backgroundColor: '#3b82f6', 
          borderColor: '#3b82f6',
          color: 'white',
          width: isMobile ? '2rem' : '2.5rem',
          height: isMobile ? '2rem' : '2.5rem'
        }}
        onClick={() => openEdit(rowData)} 
        aria-label="Edit"
        tooltip="Edit Category"
        tooltipOptions={{ position: isMobile ? 'top' : 'left' }}
      />
    );
  };

  const statusBodyTemplate = (rowData) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
        rowData.active 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {rowData.active ? 'Active' : 'Inactive'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-2 sm:p-4 min-h-screen bg-gradient-to-r from-gray-900 via-gray-500 to-gray-600 font-sans">
        <div className="flex flex-col items-center justify-center" style={{ minHeight: '400px' }}>
          <ProgressBar mode="indeterminate" style={{ height: '7px', width: '80%', maxWidth: '300px' }} />
          <p className="text-white mt-3 text-sm sm:text-base">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 md:p-6 min-h-screen bg-gradient-to-r from-gray-900 via-gray-500 to-gray-600 font-sans">
      <Toast ref={toast} />
      
      {/* Breadcrumb - Hidden on very small screens */}
      <div className="hidden sm:block mb-4">
        <BreadCrumb 
          model={breadcrumbItems} 
          home={{ icon: "pi pi-home" }} 
          className="text-white font-bold text-sm" 
        />
      </div>

      {/* Page Title - Responsive text size */}
      <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mb-3">
        Checklist Categories
      </div>
      
      {/* Stats and Add Button - Responsive layout */}
      <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6 items-center text-xs sm:text-sm">
        <span className="font-extrabold text-green-400 flex items-center">
          <i className="pi pi-check mr-1" />
          {activeCount} Active
        </span>
        <span className="font-extrabold text-rose-400 flex items-center">
          <i className="pi pi-times mr-1" />
          {inactiveCount} Inactive
        </span>
        <span className="font-extrabold text-indigo-200 flex items-center">
          <i className="pi pi-list mr-1" />
          {categories.length} Total Categories
        </span>
        <Button 
          label="Add Category" 
          icon="pi pi-plus" 
          className="ml-auto bg-black border-none font-bold hover:bg-gray-800 text-xs sm:text-sm" 
          onClick={openAdd} 
        />
      </div>
      
      <div className="">
        <DataTable 
          value={categories} 
          stripedRows 
          paginator 
          rows={10} 
          className="p-datatable-sm text-white" 
          emptyMessage="No checklist categories found."
          loading={loading}
        >
          <Column field="name" header="Category Name" sortable />
          <Column field="description" header="Description" sortable />
          <Column body={statusBodyTemplate} header="Status" sortable field="active" />
          <Column 
            field="itemsCount" 
            header="Items" 
            sortable 
            body={(rowData) => (
              <span className="text-blue-300">
                {rowData.itemsCount || 0} items
              </span>
            )}
          />
          <Column body={actionBodyTemplate} header="Actions" style={{ width: '8rem' }} />
        </DataTable>
      </div>

      {/* Add Category Dialog */}
      <Dialog
        header={<span className="text-xl font-extrabold text-purple-700">Add Checklist Category</span>}
        visible={showAddDialog}
        position="right"
        modal
        blockScroll
        className="rounded-lg shadow-xl"
        style={{ width: 380, maxWidth: "100vw" }}
        onHide={() => setShowAddDialog(false)}
        footer={addDialogFooter}
      >
        <form className="flex flex-col gap-3 p-1">
          <InputText
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Category Name"
            className={`w-full p-2 rounded-lg mt-3 ${errors.name ? "border border-red-500" : ""}`}
            autoFocus
          />
          {errors.name && <small className="text-red-500">{errors.name}</small>}

          <InputText
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Description"
            className={`w-full p-2 rounded-lg mt-2 ${errors.description ? "border border-red-500" : ""}`}
          />
          {errors.description && <small className="text-red-500">{errors.description}</small>}
        </form>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog
        header={<span className="text-xl font-extrabold text-purple-700">Edit Checklist Category</span>}
        visible={showEditDialog}
        position="right"
        modal
        blockScroll
        className="rounded-lg shadow-xl"
        style={{ width: 380, maxWidth: "100vw" }}
        onHide={() => setShowEditDialog(false)}
        footer={editDialogFooter}
      >
        <form className="flex flex-col gap-3 p-1">
          <InputText
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Category Name"
            className={`w-full p-2 rounded-lg mt-1 ${errors.name ? "border border-red-500" : ""}`}
            autoFocus
          />
          {errors.name && <small className="text-red-500">{errors.name}</small>}

          <InputText
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Description"
            className={`w-full p-2 rounded-lg mt-1 ${errors.description ? "border border-red-500" : ""}`}
          />
          {errors.description && <small className="text-red-500">{errors.description}</small>}
        </form>
      </Dialog>
    </div>
  );
}
