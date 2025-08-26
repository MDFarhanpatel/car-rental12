"use client";

import React from "react";
import { Card } from "primereact/card";

export default function DashboardHome() {
  // Sample static data (later fetch from API)
  const stats = [
    { title: "Users", value: 120, icon: "pi pi-user text-blue-500" },
    { title: "Cars", value: 45, icon: "pi pi-car text-green-500" },
    { title: "Bookings", value: 230, icon: "pi pi-calendar text-purple-500" },
  ];

  return (
    <div className="min-h-screen border-b-blue-500 bg-white p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((item, index) => (
          <Card
            key={index}
            className="shadow-2xl rounded-2xl p-6 bg-white border border-gray-200 hover:shadow-2xl transition-all hover:scale-110  ease-in-out border-b-4 border-b-blue-500    border-r-4 border-r-blue-500 border-shadow-2xl justify-content-center"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-600">
                  {item.title}
                </h2>
                <p className="text-3xl font-bold mt-2">{item.value}</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-full shadow-inner">
                <i className={`${item.icon} text-2xl`} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
