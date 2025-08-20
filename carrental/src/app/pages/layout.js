// 



"use client"
import React from "react";
import { useRouter } from "next/navigation";
import "primereact/resources/themes/lara-light-indigo/theme.css";     // theme
import "primereact/resources/primereact.css";                       // core css
import "primeicons/primeicons.css";                                // icons
import "primeflex/primeflex.css";                                 // primeflex
import { Button } from "primereact/button";
import { Menubar } from "primereact/menubar";

// ...existing code...

const Header = () => {
  const router = useRouter();

  const items = [
    {
      label: 'Home',
      icon: 'pi pi-fw pi-home',
      command: () => router.push('/pages/cars')
    },
    {
      label: 'Users',
      icon: 'pi pi-fw pi-users',
      command: () => router.push('/pages/users')
    },
    {
      label: 'Bookings',
      icon: 'pi pi-fw pi-calendar',
      command: () => router.push('/pages/booking')
    }
  ];

  const start = (
    <div className="flex align-items-center gap-4">
      <img
        src="https://img.icons8.com/color/64/000000/car--v2.png"
        alt="Car Rental Logo"
        style={{ width: 48, height: 48 }}
        className="animate-bounce shadow-4 border-circle bg-yellow-100 p-1"
      />
      <span className="text-3xl font-extrabold text-primary font-mono tracking-wide">
        Car Rental
      </span>
    </div>
  );

  const end = (
    <Button 
      label="Logout" 
      icon="pi pi-power-off" 
      severity="danger" 
      className="p-button-rounded font-bold px-5 py-1"
      onClick={() => router.push('/')}
      style={{ fontSize: "1rem" }}
    />
  );

  return (
    <header className="surface-0 shadow-5 border-round-bottom-3xl mb-0.5 ">
      <div className="flex align-items-center justify-content-between px-6 py-3 bg-gradient-to-r from-cyan-200 via-pink-200 to-yellow-200">
        <Menubar 
          model={items} 
          start={start} 
          end={end}
          className="border-none w-full bg-transparent"
        />
      </div>
    </header>
  );
};

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-column">
      <Header />
      <main className="flex-grow-1 ">
        {children}
      </main>
    </div>
  );
};

export default Layout;