"use client";
import { useState } from "react";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";




const usersData = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "Active" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User", status: "Inactive" },
  { id: 3, name: "Alice Brown", email: "alice@example.com", role: "User", status: "Active" },
  { id: 4, name: "Bob Lee", email: "bob@example.com", role: "Manager", status: "Inactive" },
];



export default function Users() {
  const [users, setUsers] = useState(usersData);

  const statusBodyTemplate = (rowData) => (
    <Tag
      value={rowData.status}
      severity={rowData.status === "Active" ? "success" : "danger"}
      className="px-3 py-1 text-base"
    />
  );

  const actionBodyTemplate = (rowData) => (
    <Button
      label="Edit"
      icon="pi pi-pencil"
      className="p-button-rounded p-button-info p-button-sm"
      onClick={() => alert(`Edit user: ${rowData.name}`)}
    />
  );

  return (
    <div className="min-h-screen flex align-items-center justify-content-center bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200">
      <div className="bg-white/90 backdrop-blur-lg p-10 rounded-3xl shadow-2xl w-full max-w-3xl flex flex-column gap-8 border-2 border-blue-300">
       
        <DataTable value={users} className="p-datatable-striped" responsiveLayout="scroll">
          <Column field="name" header="Name" sortable className="text-black" />
          <Column field="email" header="Email" sortable className="text-black" />
          <Column field="role" header="Role" sortable className="text-black" />
          <Column header="Status" body={statusBodyTemplate} className="text-black" />
          <Column header="Action" body={actionBodyTemplate} style={{ minWidth: "120px" }} />
        </DataTable>
      </div>
    </div>
  );
}


