// SidebarMenu.jsx
"use client";
import React, { useState } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';

const SidebarMenu = () => {
    const [visible, setVisible] = useState(false);

    return (
        <div className="card bg-white justify-center" >
            {/* Toggle Button */}
            <Button icon="pi pi-bars" onClick={() => setVisible(true)} className="p-button-text" />

            {/* Sidebar */}
            <Sidebar visible={visible} onHide={() => setVisible(false)} className="p-sidebar-sm" position="left">
                <h2 className="m-0 mb-3">Menu</h2>
                <ul className="list-none p-0 m-0">
                    <li className="mb-2">
                        <Button
                            label="Dashboard"
                            icon="pi pi-home"
                            className="p-button-text w-full text-left"
                        />
                    </li>
                    <li className="mb-2">
                        <Button
                            label="Settings"
                            icon="pi pi-cog"
                            className="p-button-text w-full text-left"
                        />
                    </li>
                    <li className="mb-2">
                        <Button
                            label="Profile"
                            icon="pi pi-user"
                            className="p-button-text w-full text-left"
                        />
                    </li>
                    <li className="mb-2">
                        <Button
                            label="Logout"
                            icon="pi pi-sign-out"
                            className="p-button-text w-full text-left"
                        />
                    </li>
                </ul>
            </Sidebar>
        </div>
    );
};

export default SidebarMenu;
