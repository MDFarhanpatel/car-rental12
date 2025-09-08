// "use client";
// import React, { useState } from "react";
// import { useRouter } from "next/navigation";
// import "primereact/resources/themes/lara-light-indigo/theme.css";
// import "primereact/resources/primereact.css";
// import "primeicons/primeicons.css";
// import "primeflex/primeflex.css";
// import { Button } from "primereact/button";
// import { Menubar } from "primereact/menubar";

// const Header = () => {
//   const router = useRouter();
//   const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

//   const items = [
//     {
//       label: "Home",
//       icon: "pi pi-fw pi-home",
//       command: () => router.push("/pages/home"),
//     },
//     {
//       label: "Admin",
//       icon: "pi pi-fw pi-user",
//       items: [
//         { label: "Users", icon: "pi pi-fw pi-users", command: () => router.push("/pages/users") },
//         { label: "Brands", icon: "pi pi-fw pi-car", command: () => router.push("/pages/brands") },
//         { label: "Models", icon: "pi pi-fw pi-car", command: () => router.push("/pages/models") },
//         { label: "Variants", icon: "pi pi-fw pi-car", command: () => router.push("/pages/variants") },
//         { label: "States", icon: "pi pi-fw pi-map-marker", command: () => router.push("/pages/states") },
//         { label: "Cities", icon: "pi pi-fw pi-map-marker", command: () => router.push("/pages/cities") },
//         { label: "Checklist Category", icon: "pi pi-fw pi-check-square", command: () => router.push("/pages/ChecklistCatogary") },
//         { label: "Checklist Items", icon: "pi pi-fw pi-check-square", command: () => router.push("/pages/ChecklistOption") },
//         { label: "Settings", icon: "pi pi-fw pi-cog", command: () => router.push("/pages/Settings") },
//       ],
//     },
//     {
//       label: "Inventory",
//       icon: "pi pi-fw pi-warehouse",
//       items: [
//         { label: "Pending Vehicles", icon: "pi pi-fw pi-clock", command: () => router.push("/pages/inventory/pending vehicles") },
//         { label: "Available Vehicles", icon: "pi pi-fw pi-check", command: () => router.push("/pages/inventory/Available Vehicles") },
//       ],
//     },
//     {
//       label: "Bookings",
//       icon: "pi pi-fw pi-calendar",
//       command: () => router.push("/pages/bookings"),
//     },
//     {
//       label: "Hosters",
//       icon: "pi pi-fw pi-users",
//       command: () => router.push("/pages/hosters"),
//     },
//     {
//       label: "Customers",
//       icon: "pi pi-fw pi-users",
//       command: () => router.push("/pages/customers"),
//     },
//     {
//       label: "Billing",
//       icon: "pi pi-fw pi-dollar",
//       command: () => router.push("/pages/billing"),
//     },
//     {
//       label: "Reports",
//       icon: "pi pi-fw pi-chart-bar",
//       command: () => router.push("/pages/reports"),
//     },
//     {
//       label: "Support",
//       icon: "pi pi-fw pi-phone",
//       command: () => router.push("/pages/support"),
//     },
//   ];

//   const start = (
//     <div className="flex align-items-center gap-2">
//       {/* <img
//         src="https://img.icons8.com/color/64/000000/car--v2.png"
//         alt="Car Rental Logo"
//         style={{ width: 48, height: 48 }}
//         className="animate-bounce shadow-4 border-circle bg-yellow-100 p-1"
//       /> */}
//       <span className="text-xl font-extrabold text-primary font-mono tracking-wide">
        
//       </span>
//     </div>
//   );

//   const end = (
//     <Button
//       label="Logout"
//       icon="pi pi-power-off"
//       severity="danger"
//       className="p-button-rounded bg-black font-bold px- py-2"
//       onClick={() => router.push("/home")}
//       style={{ fontSize: "1rem" }}
//     />
//   );

//   return (
//     <header className="surface-0 shadow-5 border-round-bottom-3xl mb-0.5">
//       <div className="flex align-items-center justify-content-between px-1 py-3 bg-white-alpha-90 from-teal-800  to-gray-400"> 
//         <div className="flex align-items-center w-full">
//           <div className="flex align-items-center flex-grow-1">
//             {start}
//           </div>
//           <div className="hidden md:flex flex-grow- 1">
//             <Menubar
//               model={items}
//               end={end}
//               className="border-none w-full bg-transparent"
//             />
//           </div>
//           <Button
//             icon="pi pi-bars"
//             className="md:hidden ml-2 bg-black p-button-text"
//             onClick={() => setMobileMenuVisible(!mobileMenuVisible)}
//             aria-label="Menu"
//           />
//         </div>
//       </div>
//       {/* Mobile Menu */}
//       {mobileMenuVisible && (
//         <div className="md:hidden bg-white shadow-4 absolute w-full z-5">
//           <Menubar
//             model={items}
//             end={end}
//             className="border-none w-full bg-transparent"
//           />
//         </div>
//       )}
//     </header>
//   );
// };

// const Layout = ({ children }) => {
//   return (
//     <div className="min-h-screen flex flex-column">
//       <Header />
//       <main className="flex-grow-1">{children}</main>
//     </div>
//   );
// };

// export default Layout;




"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import { Button } from "primereact/button";
import { Menubar } from "primereact/menubar";
import { Toast } from "primereact/toast";

const Header = ({ user, onLogout }) => {
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
      <img
        src="https://img.icons8.com/color/64/000000/car--v2.png"
        alt="Car Rental Logo"
        style={{ width: 48, height: 48 }}
        className="animate-bounce shadow-4 border-circle bg-yellow-100 p-1"
      />
      <span className="text-xl font-extrabold text-primary font-mono tracking-wide">
        Car Rental
      </span>
      {user && (
        <span className="ml-3 text-sm text-gray-600">
          Welcome, {user.name || user.email}
        </span>
      )}
    </div>
  );

  const end = (
    <div className="flex align-items-center gap-2">
      {user && (
        <span className="hidden md:block text-sm text-gray-600 mr-2">
          {user.email}
        </span>
      )}
      <Button
        label="Logout"
        icon="pi pi-power-off"
        severity="danger"
        className="p-button-rounded bg-red-500 hover:bg-red-600 font-bold px-3 py-2"
        onClick={onLogout}
        style={{ fontSize: "1rem" }}
      />
    </div>
  );

  return (
    <header className="surface-0 shadow-5 border-round-bottom-3xl mb-0.5">
      <div className="flex align-items-center justify-content-between px-1 py-3 bg-white-alpha-90 from-teal-800 to-gray-400"> 
        <div className="flex align-items-center w-full">
          <div className="flex align-items-center flex-grow-1">
            {start}
          </div>
          <div className="hidden md:flex flex-grow-1">
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const toast = React.useRef(null);

  // Check authentication on component mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const token = localStorage.getItem('authToken') || 
                   sessionStorage.getItem('authToken') || 
                   getCookieValue('authToken');

      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        router.push('/login');
        return;
      }

      // Try to decode token client-side
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ 
          id: payload.userId,
          email: payload.email,
          name: payload.name 
        });
        setIsAuthenticated(true);
      } catch (decodeError) {
        console.error('Token decode error:', decodeError);
        handleLogout();
        return;
      }

    } catch (error) {
      console.error('Authentication check failed:', error);
      setIsAuthenticated(false);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const getCookieValue = (name) => {
    if (typeof document !== 'undefined') {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    }
    return null;
  };

  const handleLogout = () => {
    // Clear all stored tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
    
    // Clear user state
    setUser(null);
    setIsAuthenticated(false);
    
    // Show success message
    if (toast.current) {
      toast.current.show({
        severity: 'success',
        summary: 'Logged Out',
        detail: 'You have been successfully logged out',
        life: 3000
      });
    }
    
    // Redirect to login
    setTimeout(() => {
      router.push('/login');
    }, 1000);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex align-items-center justify-content-center">
        <div className="text-center">
          <i className="pi pi-spinner pi-spin text-4xl text-primary"></i>
          <p className="mt-3 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - don't render layout
  if (!isAuthenticated) {
    return null; // Let the router handle redirect to login
  }

  return (
    <div className="min-h-screen flex flex-column">
      <Toast ref={toast} />
      <Header user={user} onLogout={handleLogout} />
      <main className="flex-grow-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;
