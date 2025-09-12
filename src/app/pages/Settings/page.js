"use client";
import React, { useState } from 'react';
import { BreadCrumb } from 'primereact/breadcrumb';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import { useRef, useEffect } from 'react';

// Import CSS (put in index.js or App.js too)
import 'primereact/resources/themes/lara-light-blue/theme.css';  // Use any PrimeReact blue theme you prefer
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';


const initialSettings = [
  { name: 'site_name', value: 'karnataka', dataType: 'number' },
  { name: 'support_email', value: 'carrentalsupport.com', dataType: 'string' },
  { name: 'timezone', value: 'mumbai/india', dataType: 'string' }
];

const dataTypeOptions = [
  { label: 'String', value: 'string' },
  { label: 'Number', value: 'number' },
  { label: 'Boolean', value: 'boolean' },
  { label: 'Date', value: 'date' }
];

export default function SettingsPage() {
  const [settings, setSettings] = useState(initialSettings);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({ name: '', value: '', dataType: 'string' });
  const [editingIdx, setEditingIdx] = useState(null);

  const toast = useRef(null);

  useEffect(() => {
    if (sidebarVisible) {
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarVisible]);

  const breadcrumbItems = [
    { label: 'Admin' },
    { label: 'Settings' }
  ];
  const breadcrumbHome = { icon: 'pi pi-home', url: '/' };

  const openSidebarForAdd = () => {
    setForm({ name: '', value: '', dataType: 'string' });
    setIsEdit(false);
    setEditingIdx(null);
    setSidebarVisible(true);
  };

  const openSidebarForEdit = idx => {
    setForm(settings[idx]);
    setEditingIdx(idx);
    setIsEdit(true);
    setSidebarVisible(true);
  };

  const handleSave = () => {
    if (!form.name || !form.dataType) return; // Prevent if required fields missing
    if (isEdit && editingIdx !== null) {
      const updated = [...settings];
      updated[editingIdx] = form;
      setSettings(updated);
      toast.current.show({ severity: 'success', summary: 'Success', detail: 'Setting updated', life: 2200 });
    } else {
      setSettings([...settings, form]);
      toast.current.show({ severity: 'success', summary: 'Success', detail: 'Setting added', life: 2200 });
    }
    setSidebarVisible(false);
  };

  const actionBodyTemplate = (rowData, options) => (
    <Button
      icon="pi pi-pencil"
      className="p-button-text"
      style={{ color: '#2563eb', background: 'transparent', border: 'none' }}
      onClick={() => openSidebarForEdit(options.rowIndex)}
      aria-label="Edit"
    />
  );

  return (
    <div className={classNames('min-h-screen bg-gradient-to-r from-gray-900 via-purple-900 to-purple-800 font-sans', { 'overflow-hidden': sidebarVisible })}>
      <Toast ref={toast} />
      <div className="p-7">
        {/* Breadcrumb */}
        <BreadCrumb model={breadcrumbItems} home={breadcrumbHome} className="mb-6" />
        <h2 className="text-3xl font-semibold mb-8 text-white">Settings</h2>
        <div className="bg-white rounded shadow p-6">
          <div className="flex justify-end mb-4">
            <Button
              label="Add Setting"
              icon="pi pi-plus"
              className="p-button-rounded font-semibold"
              style={{ background: '#2563eb', border: 'none', color: '#fff' }}
              onClick={openSidebarForAdd}
            />
          </div>
          <DataTable value={settings} paginator rows={5} className=" border-18 border-black rounded-xl w-full">
            <Column field="name" header="Name" />
            <Column field="value" header="Value" />
            <Column field="dataType" header="Data Type" />
            <Column body={actionBodyTemplate} header="Actions" style={{ width: '80px' }} />
          </DataTable>
        </div>
      </div>

      {/* Sidebar for Add/Edit */}
      <Sidebar
        visible={sidebarVisible}
        position="right"
        style={{ width: '400px', background: '#f9fafb', borderLeft: '2px solid #2563eb' }}
        onHide={() => setSidebarVisible(false)}
        blockScroll
      >
        <div className="flex flex-col h-full">
          <div className="mb-6">
            <h3 className="font-bold text-2xl text-[#2563eb] mb-1">
              {isEdit ? 'Edit Setting' : 'Add Setting'}
            </h3>
            <p className="text-sm text-gray-500 mb-3">Please fill out all required fields.</p>
          </div>
          <div className="flex-1 flex flex-col gap-5">
            {/* Name Field */}
            <div>
              <label className="font-semibold flex items-center">
                Name <span className="text-red-500 ml-1">*</span>
              </label>
              <InputText
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full mt-2 border-gray-300 rounded-lg focus:border-[#2563eb]"
                required
              />
            </div>
            {/* Value Field */}
            <div>
              <label className="font-semibold">Value</label>
              <InputText
                value={form.value}
                onChange={e => setForm({ ...form, value: e.target.value })}
                className="w-full mt-2 border-gray-300 rounded-lg focus:border-[#2563eb]"
              />
            </div>
            {/* Data Type Field */}
            <div>
              <label className="font-semibold flex items-center">
                Data Type <span className="text-red-500 ml-1">*</span>
              </label>
              <Dropdown
                value={form.dataType}
                options={dataTypeOptions}
                optionLabel="label"
                optionValue="value"
                onChange={e => setForm({ ...form, dataType: e.value })}
                className="w-full mt-2"
                placeholder="Select Data Type"
                required
                style={{ borderRadius: '0.75rem' }}
              />
            </div>
            {/* Submit Button */}
            <Button
              label={isEdit ? 'Update Setting' : 'Add Setting'}
              className="w-full mt-4 font-semibold py-3"
              style={{
                background: '#2563eb',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1.1rem',
                boxShadow: '0 4px 10px #2563eb50',
                color: '#fff'
              }}
              onClick={handleSave}
              disabled={!form.name || !form.dataType}
            />
          </div>
        </div>
      </Sidebar>
    </div>
  );
}
