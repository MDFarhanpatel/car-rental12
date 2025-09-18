"use client";

import React, { useState, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Sidebar } from 'primereact/sidebar';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Checkbox } from 'primereact/checkbox';

const dataTypeOptions = [
  { label: 'String', value: 'string' },
  { label: 'Number', value: 'number' },
  { label: 'Boolean', value: 'boolean' },
  { label: 'JSON', value: 'json' },
];

const categoryOptions = [
  { label: 'General', value: 'general' },
  { label: 'Email', value: 'email' },
  { label: 'Payment', value: 'payment' },
  { label: 'Security', value: 'security' },
  { label: 'API', value: 'api' },
  { label: 'UI', value: 'ui' },
];

// Sample data for settings
const initialSettings = [
  {
    id: 1,
    key: 'site_name',
    value: 'Car Rental System',
    category: 'general',
    description: 'Name of the website',
    dataType: 'string',
    active: true
  },
  {
    id: 2,
    key: 'max_rental_days',
    value: '30',
    category: 'general',
    description: 'Maximum number of days for rental',
    dataType: 'number',
    active: true
  },
  {
    id: 3,
    key: 'email_notifications',
    value: 'true',
    category: 'email',
    description: 'Enable email notifications',
    dataType: 'boolean',
    active: true
  },
  {
    id: 4,
    key: 'smtp_host',
    value: 'smtp.gmail.com',
    category: 'email',
    description: 'SMTP server host',
    dataType: 'string',
    active: true
  },
  {
    id: 5,
    key: 'payment_gateway',
    value: 'stripe',
    category: 'payment',
    description: 'Default payment gateway',
    dataType: 'string',
    active: true
  },
  {
    id: 6,
    key: 'session_timeout',
    value: '3600',
    category: 'security',
    description: 'Session timeout in seconds',
    dataType: 'number',
    active: true
  },
  {
    id: 7,
    key: 'api_rate_limit',
    value: '100',
    category: 'api',
    description: 'API requests per minute',
    dataType: 'number',
    active: true
  },
  {
    id: 8,
    key: 'theme_color',
    value: '#6366f1',
    category: 'ui',
    description: 'Primary theme color',
    dataType: 'string',
    active: true
  },
  {
    id: 9,
    key: 'maintenance_mode',
    value: 'false',
    category: 'general',
    description: 'Enable maintenance mode',
    dataType: 'boolean',
    active: false
  },
  {
    id: 10,
    key: 'currency',
    value: 'USD',
    category: 'payment',
    description: 'Default currency',
    dataType: 'string',
    active: true
  }
];

export default function SettingsPage() {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({
    key: '',
    value: '',
    category: 'general',
    description: '',
    dataType: 'string',
    active: true
  });
  const [editingId, setEditingId] = useState(null);
  const toast = useRef(null);

  const resetForm = () => {
    setForm({
      key: '',
      value: '',
      category: 'general',
      description: '',
      dataType: 'string',
      active: true
    });
  };

  const openSidebarForAdd = () => {
    resetForm();
    setIsEdit(false);
    setEditingId(null);
    setSidebarVisible(true);
  };

  const openSidebarForEdit = (rowData) => {
    setForm({
      key: rowData.key,
      value: rowData.value,
      category: rowData.category,
      description: rowData.description || '',
      dataType: rowData.dataType || 'string',
      active: rowData.active
    });
    setEditingId(rowData.id);
    setIsEdit(true);
    setSidebarVisible(true);
  };

  const validateForm = () => {
    if (!form.key?.trim()) {
      toast.current.show({ 
        severity: 'error', 
        summary: 'Validation Error', 
        detail: 'Key is required', 
        life: 3000 
      });
      return false;
    }

    if (!form.value?.trim()) {
      toast.current.show({ 
        severity: 'error', 
        summary: 'Validation Error', 
        detail: 'Value is required', 
        life: 3000 
      });
      return false;
    }

    if (!form.category) {
      toast.current.show({ 
        severity: 'error', 
        summary: 'Validation Error', 
        detail: 'Category is required', 
        life: 3000 
      });
      return false;
    }

    // Check for duplicate keys (excluding current item when editing)
    const duplicateKey = settings.find(setting => 
      setting.key.toLowerCase() === form.key.trim().toLowerCase() && setting.id !== editingId
    );
    
    if (duplicateKey) {
      toast.current.show({ 
        severity: 'error', 
        summary: 'Validation Error', 
        detail: 'A setting with this key already exists', 
        life: 3000 
      });
      return false;
    }

    return true;
  };

  const saveSettings = () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      if (isEdit) {
        // Update existing setting
        const updatedSettings = settings.map(setting => 
          setting.id === editingId 
            ? { 
                ...setting, 
                key: form.key.trim(),
                value: form.value.trim(),
                category: form.category,
                description: form.description.trim(),
                dataType: form.dataType,
                active: form.active
              }
            : setting
        );
        setSettings(updatedSettings);
        
        toast.current.show({ 
          severity: 'success', 
          summary: 'Success', 
          detail: 'Setting updated successfully', 
          life: 3000 
        });
      } else {
        // Add new setting
        const newSetting = {
          id: Math.max(...settings.map(s => s.id), 0) + 1,
          key: form.key.trim(),
          value: form.value.trim(),
          category: form.category,
          description: form.description.trim(),
          dataType: form.dataType,
          active: form.active
        };
        setSettings([...settings, newSetting]);
        
        toast.current.show({ 
          severity: 'success', 
          summary: 'Success', 
          detail: 'Setting added successfully', 
          life: 3000 
        });
      }
      
      setSidebarVisible(false);
      resetForm();
    } catch (error) {
      console.error('Error saving setting:', error);
      toast.current.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Failed to save setting', 
        life: 3000 
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteSetting = (id) => {
    try {
      const updatedSettings = settings.filter(setting => setting.id !== id);
      setSettings(updatedSettings);
      
      toast.current.show({ 
        severity: 'success', 
        summary: 'Success', 
        detail: 'Setting deleted successfully', 
        life: 3000 
      });
    } catch (error) {
      console.error('Error deleting setting:', error);
      toast.current.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Failed to delete setting', 
        life: 3000 
      });
    }
  };

  const closeSidebar = () => {
    setSidebarVisible(false);
    resetForm();
    setIsEdit(false);
    setEditingId(null);
  };

  const breadcrumbItems = [
    { label: 'Admin' },
    { label: 'Settings' }
  ];
  const breadcrumbHome = { icon: 'pi pi-home', url: '/' };

  const actionBodyTemplate = (rowData) => (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-text p-button-rounded p-button-sm"
          onClick={() => openSidebarForEdit(rowData)}
          aria-label="Edit"
          tooltip="Edit"
        />
        <Button
          icon="pi pi-trash"
          className="p-button-text p-button-rounded p-button-danger p-button-sm"
          onClick={() => deleteSetting(rowData.id)}
          aria-label="Delete"
          tooltip="Delete"
        />
      </div>
    );

  const statusBodyTemplate = (rowData) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      rowData.active 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
    }`}>
      {rowData.active ? 'Active' : 'Inactive'}
    </span>
  );

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 via-gray-500 to-gray-600 font-sans">
      <Toast ref={toast} />
      <div className="p-7">
        <BreadCrumb model={breadcrumbItems} home={breadcrumbHome} className="mb-6" />
        <h2 className="text-3xl font-semibold mb-8 text-white">Settings Management</h2>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-black">System Settings</h3>
            <Button
              label="Add Setting"
              icon="pi pi-plus"
              className="p-button-primary"
              onClick={openSidebarForAdd}
            />
          </div>
          <DataTable 
            value={settings} 
            paginator 
            rows={10} 
            loading={loading}
            emptyMessage="No settings found"
            className="w-full"
          >
            <Column field="key" header="Key" sortable />
            <Column field="value" header="Value" sortable />
            <Column field="category" header="Category" sortable />
            <Column field="dataType" header="Data Type" sortable />
            <Column 
              field="active" 
              header="Status" 
              body={statusBodyTemplate}
              sortable 
            />
            <Column body={actionBodyTemplate} header="Actions" style={{ width: '120px' }} />
          </DataTable>
        </div>
      </div>

      <Sidebar
        visible={sidebarVisible}
        position="right"
        style={{ width: '400px' }}
        onHide={closeSidebar}
        blockScroll
      >
        <div className="flex flex-col h-full p-4">
          <div className="mb-6">
            <h3 className="font-bold text-2xl mb-1">
              {isEdit ? 'Edit Setting' : 'Add Setting'}
            </h3>
            <p className="text-sm text-gray-500 mb-3">Please fill out all required fields.</p>
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <div>
              <label className="font-semibold flex items-center">
                Key <span className="text-red-500 ml-1">*</span>
              </label>
              <InputText
                value={form.key}
                onChange={(e) => setForm({ ...form, key: e.target.value })}
                className="w-full mt-1"
                required
              />
            </div>
            <div>
              <label className="font-semibold flex items-center">
                Value <span className="text-red-500 ml-1">*</span>
              </label>
              <InputText
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className="w-full mt-1"
                required
              />
            </div>
            <div>
              <label className="font-semibold flex items-center">
                Category <span className="text-red-500 ml-1">*</span>
              </label>
              <Dropdown
                value={form.category}
                options={categoryOptions}
                onChange={(e) => setForm({ ...form, category: e.value })}
                className="w-full mt-1"
                required
              />
            </div>
            <div>
              <label className="font-semibold">Description</label>
              <InputText
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full mt-1"
              />
            </div>
            <div>
              <label className="font-semibold">Data Type</label>
              <Dropdown
                value={form.dataType}
                options={dataTypeOptions}
                onChange={(e) => setForm({ ...form, dataType: e.value })}
                className="w-full mt-1"
              />
            </div>
            <div className="flex items-center">
              <label className="font-semibold mr-2">Active</label>
              <Checkbox
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.checked })}
                className="mt-1"
              />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button
              label={isEdit ? 'Update' : 'Add'}
              className="p-button-primary w-full"
              onClick={saveSettings}
              loading={loading}
            />
            <Button
              label="Cancel"
              className="p-button-secondary w-full"
              onClick={closeSidebar}
            />
          </div>
        </div>
      </Sidebar>
    </div>
  );
}
