"use client";
import React, { useState, useRef } from "react";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { BreadCrumb } from "primereact/breadcrumb";

const themes = [
  { name: "Light", code: "light" },
  { name: "Dark", code: "dark" },
  { name: "System", code: "system" }
];

export default function SettingsPage() {
  const [form, setForm] = useState({
    siteName: "",
    adminEmail: "",
    notificationsEnabled: false,
    theme: null
  });

  const [errors, setErrors] = useState({});
  const toast = useRef(null);

  const breadcrumbItems = [
    { label: "Home", command: () => window.location.href = "/" },
    { label: "Admin", command: () => window.location.href = "/admin" },
    { label: "Settings" },
  ];

  const validate = () => {
    const errs = {};
    if (!form.siteName.trim()) errs.siteName = "Site Name is required.";
    if (!form.adminEmail.trim()) errs.adminEmail = "Admin Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.adminEmail)) errs.adminEmail = "Invalid email format.";
    if (!form.theme) errs.theme = "Please select a theme.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveSettings = () => {
    if (!validate()) return;
    // Save logic here (e.g. API call)
    toast.current.show({ severity: "success", summary: "Settings Saved", detail: "Settings updated successfully.", life: 2000 });
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-r from-gray-950 via-gray-900 to-fuchsia-900 font-sans">
      <Toast ref={toast} />
      <div className="mb-5">
        <BreadCrumb model={breadcrumbItems} home={{ icon: "pi pi-home" }} className="text-white font-bold" />
      </div>
      <h1 className="text-3xl font-extrabold text-white mb-6">Settings</h1>

      <div className="bg-zinc-900 p-6 rounded-2xl shadow-lg max-w-lg mx-auto">
        <div className="flex flex-col gap-5">
          <div>
            <label className="block text-white font-semibold mb-1" htmlFor="siteName">Site Name</label>
            <InputText
              id="siteName"
              value={form.siteName}
              onChange={e => setForm(f => ({ ...f, siteName: e.target.value }))}
              placeholder="Enter site name"
              className={`w-full p-3 rounded-md text-black ${errors.siteName ? "border-2 border-red-500" : ""}`}
              autoFocus
            />
            {errors.siteName && <small className="text-red-500">{errors.siteName}</small>}
          </div>

          <div>
            <label className="block text-white font-semibold mb-1" htmlFor="adminEmail">Admin Email</label>
            <InputText
              id="adminEmail"
              value={form.adminEmail}
              type="email"
              onChange={e => setForm(f => ({ ...f, adminEmail: e.target.value }))}
              placeholder="admin@example.com"
              className={`w-full p-3 rounded-md text-black ${errors.adminEmail ? "border-2 border-red-500" : ""}`}
            />
            {errors.adminEmail && <small className="text-red-500">{errors.adminEmail}</small>}
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              inputId="notifications"
              checked={form.notificationsEnabled}
              onChange={e => setForm(f => ({ ...f, notificationsEnabled: e.checked }))}
            />
            <label htmlFor="notifications" className="text-white font-semibold">Enable Notifications</label>
          </div>

          <div>
            <label className="block text-white font-semibold mb-1">Theme</label>
            <Dropdown
              value={form.theme}
              options={themes}
              onChange={e => setForm(f => ({ ...f, theme: e.value }))}
              optionLabel="name"
              placeholder="Select a theme"
              className={`${errors.theme ? "border-2 border-red-500" : ""} w-full text-black rounded-md p-3`}
            />
            {errors.theme && <small className="text-red-500">{errors.theme}</small>}
          </div>

          <Button
            label="Save Settings"
            icon="pi pi-check"
            onClick={saveSettings}
            className="bg-purple-700 border-none font-extrabold py-3 rounded-md"
          />
        </div>
      </div>
    </div>
  );
}
