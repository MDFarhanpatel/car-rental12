"use client";

import React, { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { Skeleton } from "primereact/skeleton";

export default function DashboardHome() {
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Sample static data (later fetch from API)
  const stats = [
    { 
      title: "Users", 
      value: 120, 
      icon: "pi pi-user text-blue-500",
      color: "from-blue-500 to-blue-700"
    },
    { 
      title: "Cars", 
      value: 45, 
      icon: "pi pi-car text-green-500",
      color: "from-green-500 to-green-700"
    },
    { 
      title: "Bookings", 
      value: 230, 
      icon: "pi pi-calendar text-purple-500",
      color: "from-purple-500 to-purple-700"
    },
    { 
      title: "Revenue", 
      value: "$12,450", 
      icon: "pi pi-dollar text-yellow-500",
      color: "from-yellow-500 to-yellow-700"
    }
  ];

  // Detect screen size for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-3 sm:p-4 md:p-6 min-h-screen bg-gradient-to-r from-gray-900 via-gray-500 to-gray-600 font-sans">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="w-2/3">
                  <Skeleton width="70%" height="1.5rem" className="mb-2" />
                  <Skeleton width="50%" height="2rem" />
                </div>
                <Skeleton shape="circle" size="4rem" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 min-h-screen  bg-gradient-to-r from-gray-900 via-gray-500 to-gray-600 font-sans">
      {/* Welcome message - responsive text size */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
          Welcome to the Dashboard
        </h1>
        <p className="text-sm sm:text-base text-gray-200 mt-2">
          Here&apos;s an overview of your car rental business
        </p>
      </div>
      
      {/* Stats cards - responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {stats.map((item, index) => (
          <Card
            key={index}
            className={`
              bg-white hover:bg-gray-50
              rounded-2xl shadow-lg
              border border-gray-200
              transition-all duration-300
              hover:shadow-2xl hover:scale-105
              border-b-4 border-r-4 ${item.color.includes('black') ? 'border-b-black border-r-black' : 
                                     item.color.includes('green') ? 'border-b-green-500 border-r-green-500' : 
                                     item.color.includes('purple') ? 'border-b-purple-500 border-r-purple-500' : 
                                     'border-b-yellow-500 border-r-yellow-500'}
            `}
            pt={{ root: { className: 'p-0' } }}
          >
            <div className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-600">
                    {item.title}
                  </h2>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2">
                    {item.value}
                  </p>
                </div>
                <div className={`
                  bg-gradient-to-br ${item.color}
                  p-3 sm:p-4 rounded-full shadow-inner
                  flex items-center justify-center
                `}>
                  <i className={`${item.icon.split(' ')[0]} text-white text-lg sm:text-xl md:text-2xl`} />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Recent Activity Section */}
      <div className="mt-6 sm:mt-8 md:mt-10">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4">
          Recent Activity
        </h2>
        
        <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-2xl p-4 sm:p-6">
          <div className="space-y-3 ">
            {[
              { action: "New booking", user: "John Doe", time: "10 minutes ago", icon: "pi pi-calendar-plus text-green-500" },
              { action: "Car returned", user: "Sarah Smith", time: "2 hours ago", icon: "pi pi-check-circle text-blue-500" },
              { action: "Payment received", user: "Mike Johnson", time: "Yesterday", icon: "pi pi-dollar text-yellow-500" }
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-2 sm:p-3 bg-white bg-opacity-20 rounded-lg">
                <div className="bg-blackp-2 rounded-full">
                  <i className={`${activity.icon} text-lg`} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <span className="font-medium text-black">{activity.action}</span>
                    <span className="text-xs text-black">{activity.time}</span>
                  </div>
                  <span className="text-sm text-black">{activity.user}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}