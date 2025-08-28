"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import { Button } from "primereact/button";
import { Menubar } from "primereact/menubar";

const Header = () => {
  const router = useRouter();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  const items = [
    {
      label: "Home",
      icon: "pi pi-fw pi-home",
      command: () => router.push("/pages/home"),
    },
    {
      label: "Admin",
      icon: "pi pi-fw pi-user",
      items: [
        { label: "Users", icon: "pi pi-fw pi-users", command: () => router.push("/pages/users") },
        { label: "Brands", icon: "pi pi-fw pi-car", command: () => router.push("/pages/brands") },
        { label: "Models", icon: "pi pi-fw pi-car", command: () => router.push("/pages/models") },
        { label: "Variants", icon: "pi pi-fw pi-car", command: () => router.push("/pages/variants") },
        { label: "States", icon: "pi pi-fw pi-map-marker", command: () => router.push("/pages/states") },
        { label: "Cities", icon: "pi pi-fw pi-map-marker", command: () => router.push("/pages/cities") },
        { label: "Checklist Category", icon: "pi pi-fw pi-check-square", command: () => router.push("/pages/ChecklistCatogary") },
        { label: "Checklist Items", icon: "pi pi-fw pi-check-square", command: () => router.push("/pages/ChecklistOption") },
        { label: "Settings", icon: "pi pi-fw pi-cog", command: () => router.push("/pages/Settings") },
      ],
    },
    {
      label: "Inventory",
      icon: "pi pi-fw pi-warehouse",
      items: [
        { label: "Pending Vehicles", icon: "pi pi-fw pi-clock", command: () => router.push("/pages/inventory/pending vehicles") },
        { label: "Available Vehicles", icon: "pi pi-fw pi-check", command: () => router.push("/pages/inventory/Available Vehicles") },
      ],
    },
    {
      label: "Bookings",
      icon: "pi pi-fw pi-calendar",
      command: () => router.push("/pages/bookings"),
    },
    {
      label: "Hosters",
      icon: "pi pi-fw pi-users",
      command: () => router.push("/pages/hosters"),
    },
    {
      label: "Customers",
      icon: "pi pi-fw pi-users",
      command: () => router.push("/pages/customers"),
    },
    {
      label: "Billing",
      icon: "pi pi-fw pi-dollar",
      command: () => router.push("/pages/billing"),
    },
    {
      label: "Reports",
      icon: "pi pi-fw pi-chart-bar",
      command: () => router.push("/pages/reports"),
    },
    {
      label: "Support",
      icon: "pi pi-fw pi-phone",
      command: () => router.push("/pages/support"),
    },
  ];

  const start = (
    <div className="flex align-items-center gap-2">
      {/* <img
        src="https://img.icons8.com/color/64/000000/car--v2.png"
        alt="Car Rental Logo"
        style={{ width: 48, height: 48 }}
        className="animate-bounce shadow-4 border-circle bg-yellow-100 p-1"
      /> */}
      <span className="text-xl font-extrabold text-primary font-mono tracking-wide">
        
      </span>
    </div>
  );

  const end = (
    <Button
      label="Logout"
      icon="pi pi-power-off"
      severity="danger"
      className="p-button-rounded bg-black font-bold px- py-1"
      onClick={() => router.push("/home")}
      style={{ fontSize: "1rem" }}
    />
  );

  return (
    <header className="surface-0 shadow-5 border-round-bottom-3xl mb-0.5">
      <div className="flex align-items-center justify-content-between px-1 py-3 bg-white-alpha-90 from-teal-800  to-gray-400"> 
        <div className="flex align-items-center w-full">
          <div className="flex align-items-center flex-grow-1">
            {start}
          </div>
          <div className="hidden md:flex flex-grow- 1">
            <Menubar
              model={items}
              end={end}
              className="border-none w-full bg-transparent"
            />
          </div>
          <Button
            icon="pi pi-bars"
            className="md:hidden ml-2 bg-black p-button-text"
            onClick={() => setMobileMenuVisible(!mobileMenuVisible)}
            aria-label="Menu"
          />
        </div>
      </div>
      {/* Mobile Menu */}
      {mobileMenuVisible && (
        <div className="md:hidden bg-white shadow-4 absolute w-full z-5">
          <Menubar
            model={items}
            end={end}
            className="border-none w-full bg-transparent"
          />
        </div>
      )}
    </header>
  );
};

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-column">
      <Header />
      <main className="flex-grow-1">{children}</main>
    </div>
  );
};

export default Layout;