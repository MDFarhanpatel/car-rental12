"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Sidebar } from 'primereact/sidebar';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Checkbox } from 'primereact/checkbox';
import { classNames } from 'primereact/utils';

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

export default function SettingsPage() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setSettings(data.data || []);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to load settings', life: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const openSidebarForAdd = () => {
    setForm({
      key: '',
      value: '',
      category: 'general',
      description: '',
      dataType: 'string',
      active: true
    });
    setIsEdit(false);
    setEditingId(null);
    setSidebarVisible(true);
  };

  const openSidebarForEdit = (rowData) => {
    setForm({
      id: rowData.id,
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

  const saveSettings = async () => {
    try {
      // Validate form
      if (!form.key || !form.value || !form.category) {
        toast.current.show({ 
          severity: 'error', 
          summary: 'Validation Error', 
          detail: 'Key, value and category are required', 
          life: 3000 
        });
        return;
      }

      const url = isEdit ? `/api/v1/settings?id=${editingId}` : '/api/v1/settings';
      const method = isEdit ? 'PUT' : 'POST';
      
      console.log('Sending data:', form); // Debug log
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save setting');
      }
      
      const result = await response.json();
      
      toast.current.show({ 
        severity: 'success', 
        summary: 'Success', 
        detail: isEdit ? 'Setting updated successfully' : 'Setting added successfully', 
        life: 3000 
      });
      
      setSidebarVisible(false);
      fetchSettings(); // Refresh the list
    } catch (error) {
      console.error('Error saving setting:', error);
      toast.current.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: error.message || 'Failed to save setting', 
        life: 3000 
      });
    }
  };

  const deleteSetting = async (id) => {
    try {
      const response = await fetch(`/api/v1/settings?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete setting');
      }
      
      toast.current.show({ 
        severity: 'success', 
        summary: 'Success', 
        detail: 'Setting deleted successfully', 
        life: 3000 
      });
      
      fetchSettings(); // Refresh the list
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

  const breadcrumbItems = [
    { label: 'Admin' },
    { label: 'Settings' }
  ];
  const breadcrumbHome = { icon: 'pi pi-home', url: '/' };

  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        className="p-button-text p-button-rounded"
        onClick={() => openSidebarForEdit(rowData)}
        aria-label="Edit"
      />
      <Button
        icon="pi pi-trash"
        className="p-button-text p-button-rounded p-button-danger"
        onClick={() => deleteSetting(rowData.id)}
        aria-label="Delete"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 via-purple-900 to-purple-800 font-sans">
      <Toast ref={toast} />
      <div className="p-7">
        <BreadCrumb model={breadcrumbItems} home={breadcrumbHome} className="mb-6" />
        <h2 className="text-3xl font-semibold mb-8 text-white">Settings</h2>
        <div className="bg-white rounded shadow p-6">
          <div className="flex justify-end mb-4">
            <Button
              label="Add Setting"
              icon="pi pi-plus"
              className="p-button-rounded font-semibold"
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
              body={(rowData) => rowData.active ? 'Active' : 'Inactive'} 
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
        onHide={() => setSidebarVisible(false)}
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
            />
            <Button
              label="Cancel"
              className="p-button-secondary w-full"
              onClick={() => setSidebarVisible(false)}
            />
          </div>
        </div>
      </Sidebar>
    </div>
  );
}
