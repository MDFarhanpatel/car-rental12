"use client";
import React, { useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { Card } from "primereact/card";
import { Badge } from "primereact/badge";
import { Toast } from "primereact/toast";
import { FilterMatchMode } from "primereact/api";
import { InputSwitch } from "primereact/inputswitch";
import { Toolbar } from "primereact/toolbar";
import { Menu } from "primereact/menu";

export default function ChecklistItemsPage() {
  const toast = useRef(null);
  const menuRef = useRef(null);

  // Sample checklist items data
  const [checklistItems, setChecklistItems] = useState([
    {
      id: 1,
      itemName: "Check tire pressure",
      description: "Verify all tires have proper pressure according to manufacturer specs",
      category: "Exterior Inspection",
      categoryId: 1,
      isRequired: true,
      isActive: true,
      priority: "High",
      estimatedTime: 5,
      createdDate: "2025-01-15"
    },
    {
      id: 2,
      itemName: "Inspect body damage",
      description: "Look for scratches, dents, or any visible damage on vehicle body",
      category: "Exterior Inspection",
      categoryId: 1,
      isRequired: true,
      isActive: true,
      priority: "High",
      estimatedTime: 10,
      createdDate: "2025-01-15"
    },
    {
      id: 3,
      itemName: "Test headlights and taillights",
      description: "Check all exterior lights are functioning properly",
      category: "Exterior Inspection",
      categoryId: 1,
      isRequired: true,
      isActive: true,
      priority: "Medium",
      estimatedTime: 3,
      createdDate: "2025-01-15"
    },
    {
      id: 4,
      itemName: "Check seat condition",
      description: "Inspect seats for tears, stains, or damage",
      category: "Interior Inspection",
      categoryId: 2,
      isRequired: true,
      isActive: true,
      priority: "Medium",
      estimatedTime: 5,
      createdDate: "2025-01-16"
    },
    {
      id: 5,
      itemName: "Test air conditioning",
      description: "Verify AC and heating systems work properly",
      category: "Interior Inspection",
      categoryId: 2,
      isRequired: false,
      isActive: true,
      priority: "Low",
      estimatedTime: 8,
      createdDate: "2025-01-16"
    },
    {
      id: 6,
      itemName: "Check engine oil level",
      description: "Verify engine oil is at proper level and condition",
      category: "Engine & Mechanical",
      categoryId: 3,
      isRequired: true,
      isActive: true,
      priority: "High",
      estimatedTime: 5,
      createdDate: "2025-01-17"
    },
    {
      id: 7,
      itemName: "Test brake functionality",
      description: "Check brake pedal response and brake fluid level",
      category: "Engine & Mechanical",
      categoryId: 3,
      isRequired: true,
      isActive: true,
      priority: "High",
      estimatedTime: 15,
      createdDate: "2025-01-17"
    }
  ]);

  // Form states
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [editSidebarVisible, setEditSidebarVisible] = useState(false);
  const [menuSidebarVisible, setMenuSidebarVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Add item form
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(null);
  const [isRequired, setIsRequired] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [priority, setPriority] = useState("Medium");
  const [estimatedTime, setEstimatedTime] = useState("");

  // Edit item form
  const [editItemName, setEditItemName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState(null);
  const [editIsRequired, setEditIsRequired] = useState(false);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editPriority, setEditPriority] = useState("Medium");
  const [editEstimatedTime, setEditEstimatedTime] = useState("");

  // Filter states
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    itemName: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    category: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    priority: { value: null, matchMode: FilterMatchMode.EQUALS }
  });
  const [globalFilterValue, setGlobalFilterValue] = useState('');

  // Dropdown options
  const categoryOptions = [
    { label: "Exterior Inspection", value: "Exterior Inspection", id: 1 },
    { label: "Interior Inspection", value: "Interior Inspection", id: 2 },
    { label: "Engine & Mechanical", value: "Engine & Mechanical", id: 3 },
    { label: "Safety & Security", value: "Safety & Security", id: 4 },
    { label: "Documentation", value: "Documentation", id: 5 }
  ];

  const priorityOptions = [
    { label: "High", value: "High" },
    { label: "Medium", value: "Medium" },
    { label: "Low", value: "Low" }
  ];

  // Menu items for the sidebar menu
  const menuItems = [
    {
      label: 'Dashboard',
      icon: 'pi pi-fw pi-home',
      command: () => {
        console.log('Navigate to Dashboard');
        setMenuSidebarVisible(false);
      }
    },
    {
      label: 'Categories',
      icon: 'pi pi-fw pi-list',
      command: () => {
        console.log('Navigate to Categories');
        setMenuSidebarVisible(false);
      }
    },
    {
      label: 'Reports',
      icon: 'pi pi-fw pi-chart-bar',
      command: () => {
        console.log('Navigate to Reports');
        setMenuSidebarVisible(false);
      }
    },
    {
      label: 'Settings',
      icon: 'pi pi-fw pi-cog',
      command: () => {
        console.log('Navigate to Settings');
        setMenuSidebarVisible(false);
      }
    },
    {
      separator: true
    },
    {
      label: 'Export Data',
      icon: 'pi pi-fw pi-download',
      command: () => {
        console.log('Export data');
        setMenuSidebarVisible(false);
      }
    },
    {
      label: 'Import Data',
      icon: 'pi pi-fw pi-upload',
      command: () => {
        console.log('Import data');
        setMenuSidebarVisible(false);
      }
    }
  ];

  // Global filter function
  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters['global'].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  // Submit new item
  const handleSubmit = () => {
    if (!itemName || !description || !category || !estimatedTime) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill all required fields',
        life: 3000
      });
      return;
    }

    const selectedCategoryObj = categoryOptions.find(cat => cat.value === category);
    const newItem = {
      id: checklistItems.length + 1,
      itemName,
      description,
      category,
      categoryId: selectedCategoryObj?.id || 1,
      isRequired,
      isActive,
      priority,
      estimatedTime: parseInt(estimatedTime),
      createdDate: new Date().toISOString().split('T')[0]
    };

    setChecklistItems([...checklistItems, newItem]);
    
    // Reset form
    resetForm();
    setSidebarVisible(false);

    toast.current.show({
      severity: 'success',
      summary: 'Success',
      detail: 'Checklist item created successfully',
      life: 3000
    });
  };

  // Reset form
  const resetForm = () => {
    setItemName("");
    setDescription("");
    setCategory(null);
    setIsRequired(false);
    setIsActive(true);
    setPriority("Medium");
    setEstimatedTime("");
  };

  // Open edit sidebar
  const openEdit = (item) => {
    setSelectedItem(item);
    setEditItemName(item.itemName);
    setEditDescription(item.description);
    setEditCategory(item.category);
    setEditIsRequired(item.isRequired);
    setEditIsActive(item.isActive);
    setEditPriority(item.priority);
    setEditEstimatedTime(item.estimatedTime.toString());
    setEditSidebarVisible(true);
  };

  // Save edited item
  const saveEdit = () => {
    if (!editItemName || !editDescription || !editCategory || !editEstimatedTime) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill all required fields',
        life: 3000
      });
      return;
    }

    const selectedCategoryObj = categoryOptions.find(cat => cat.value === editCategory);
    setChecklistItems(prev => 
      prev.map(item => 
        item.id === selectedItem.id 
          ? { 
              ...item, 
              itemName: editItemName,
              description: editDescription,
              category: editCategory,
              categoryId: selectedCategoryObj?.id || 1,
              isRequired: editIsRequired,
              isActive: editIsActive,
              priority: editPriority,
              estimatedTime: parseInt(editEstimatedTime)
            }
          : item
      )
    );

    setEditSidebarVisible(false);
    setSelectedItem(null);

    toast.current.show({
      severity: 'success',
      summary: 'Success',
      detail: 'Checklist item updated successfully',
      life: 3000
    });
  };

  // Delete item
  const deleteItem = (itemId) => {
    setChecklistItems(prev => prev.filter(item => item.id !== itemId));
    toast.current.show({
      severity: 'info',
      summary: 'Deleted',
      detail: 'Checklist item deleted successfully',
      life: 3000
    });
  };

  // Toggle item status
  const toggleItemStatus = (item) => {
    setChecklistItems(prev => 
      prev.map(i => 
        i.id === item.id 
          ? { ...i, isActive: !i.isActive }
          : i
      )
    );
  };

  // Template functions for DataTable
  const requiredBodyTemplate = (rowData) => {
    return (
      <Badge 
        value={rowData.isRequired ? "Required" : "Optional"} 
        severity={rowData.isRequired ? "danger" : "info"}
      />
    );
  };

  const statusBodyTemplate = (rowData) => {
    return (
      <InputSwitch
        checked={rowData.isActive}
        onChange={() => toggleItemStatus(rowData)}
      />
    );
  };

  const priorityBodyTemplate = (rowData) => {
    const getSeverity = (priority) => {
      switch (priority) {
        case 'High': return 'danger';
        case 'Medium': return 'warning';
        case 'Low': return 'success';
        default: return null;
      }
    };

    return (
      <Badge 
        value={rowData.priority} 
        severity={getSeverity(rowData.priority)}
      />
    );
  };

  const timeBodyTemplate = (rowData) => {
    return `${rowData.estimatedTime} min`;
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          rounded
          text
          severity="info"
          aria-label="Edit"
          onClick={() => openEdit(rowData)}
          className="p-button-sm"
        />
        <Button
          icon="pi pi-trash"
          rounded
          text
          severity="danger"
          aria-label="Delete"
          onClick={() => deleteItem(rowData.id)}
          className="p-button-sm"
        />
      </div>
    );
  };

  // Toolbar content
  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button label="Export" icon="pi pi-upload" severity="help" onClick={() => {}} />
      </div>
    );
  };

  const rightToolbarTemplate = () => {
    return (
      <div>
        <Button 
          label="Add Item" 
          icon="pi pi-plus" 
          severity="success" 
          onClick={() => setSidebarVisible(true)} 
        />
        <Button 
          label="Menu" 
          icon="pi pi-bars" 
          severity="secondary" 
          className="ml-2"
          onClick={() => setMenuSidebarVisible(true)}
        />
      </div>
    );
  };

  return (
    <div className="p-4 min-h-screen bg-gradient-to-r from-gray-900 via-gray-500 to-gray-600 font-sans">
      <Toast ref={toast} />
      
      {/* Header */}
      <div className="flex justify-content-between align-items-center mb-4 ">
        <div>
          <h1 className="m-0">Checklist Items</h1>
          <p className="text-600 m-0">Manage your checklist items</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid mb-4">
        <div className="col-12 md:col-3">
          <Card>
            <div className="flex align-items-center">
              <div className="flex-1">
                <div className="text-xl font-bold text-primary">
                  {checklistItems.length}
                </div>
                <div className="text-600">Total Items</div>
              </div>
              <div className="text-primary">
                <i className="pi pi-list text-2xl"></i>
              </div>
            </div>
          </Card>
        </div>
        <div className="col-12 md:col-3">
          <Card>
            <div className="flex align-items-center">
              <div className="flex-1">
                <div className="text-xl font-bold text-green-500">
                  {checklistItems.filter(item => item.isActive).length}
                </div>
                <div className="text-600">Active Items</div>
              </div>
              <div className="text-green-500">
                <i className="pi pi-check-circle text-2xl"></i>
              </div>
            </div>
          </Card>
        </div>
        <div className="col-12 md:col-3">
          <Card>
            <div className="flex align-items-center">
              <div className="flex-1">
                <div className="text-xl font-bold text-red-500">
                  {checklistItems.filter(item => item.isRequired).length}
                </div>
                <div className="text-600">Required Items</div>
              </div>
              <div className="text-red-500">
                <i className="pi pi-exclamation-triangle text-2xl"></i>
              </div>
            </div>
          </Card>
        </div>
        <div className="col-12 md:col-3">
          <Card>
            <div className="flex align-items-center">
              <div className="flex-1">
                <div className="text-xl font-bold text-orange-500">
                  {checklistItems.reduce((total, item) => total + item.estimatedTime, 0)}
                </div>
                <div className="text-600">Total Minutes</div>
              </div>
              <div className="text-orange-500">
                <i className="pi pi-clock text-2xl"></i>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* DataTable */}
      <Card>
        <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
        
        {/* Global Search */}
        <div className="flex justify-content-end mb-3">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
              placeholder="Search items..."
            />
          </span>
        </div>

        <DataTable 
          value={checklistItems} 
          paginator 
          rows={10}
          dataKey="id"
          filters={filters}
          filterDisplay="menu"
          globalFilterFields={['itemName', 'description', 'category', 'priority']}
          emptyMessage="No checklist items found."
          sortMode="multiple"
        >
          <Column field="itemName" header="Item Name" sortable filter filterPlaceholder="Search by name" />
          <Column field="description" header="Description" />
          <Column field="category" header="Category" sortable filter filterPlaceholder="Search by category" />
          <Column header="Required" body={requiredBodyTemplate} sortable />
          <Column header="Priority" body={priorityBodyTemplate} sortable filter filterElement={(options) => (
            <Dropdown
              value={options.value}
              options={priorityOptions}
              onChange={(e) => options.filterCallback(e.value)}
              placeholder="Select Priority"
              className="p-column-filter"
              showClear
            />
          )} />
          <Column header="Time" body={timeBodyTemplate} sortable />
          <Column header="Status" body={statusBodyTemplate} />
          <Column header="Actions" body={actionBodyTemplate} />
        </DataTable>
      </Card>

      {/* Add Item Sidebar */}
      <Sidebar
        visible={sidebarVisible}
        position="right"
        onHide={() => setSidebarVisible(false)}
        style={{ width: "500px" }}
      >
        <h2 className="mb-4">Add Checklist Item</h2>

        <div className="p-fluid flex flex-column gap-4">
          <span className="p-float-label">
            <InputText
              id="itemName"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <label htmlFor="itemName">Item Name *</label>
          </span>

          <span className="p-float-label">
            <InputTextarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
            <label htmlFor="description">Description *</label>
          </span>

          <span className="p-float-label">
            <Dropdown
              id="category"
              value={category}
              options={categoryOptions}
              onChange={(e) => setCategory(e.value)}
            />
            <label htmlFor="category">Category *</label>
          </span>

          <span className="p-float-label">
            <Dropdown
              id="priority"
              value={priority}
              options={priorityOptions}
              onChange={(e) => setPriority(e.value)}
            />
            <label htmlFor="priority">Priority</label>
          </span>

          <span className="p-float-label">
            <InputText
              id="estimatedTime"
              type="number"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
            />
            <label htmlFor="estimatedTime">Estimated Time (minutes) *</label>
          </span>

          <div className="field-checkbox">
            <Checkbox
              id="isRequired"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.checked)}
            />
            <label htmlFor="isRequired" className="ml-2">This item is required</label>
          </div>

          <div className="field-checkbox">
            <Checkbox
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.checked)}
            />
            <label htmlFor="isActive" className="ml-2">Item is active</label>
          </div>

          <Button
            label="Save Item"
            onClick={handleSubmit}
            className="p-button-success mt-3"
          />
        </div>
      </Sidebar>

      {/* Edit Item Sidebar */}
      <Sidebar
        visible={editSidebarVisible}
        position="right"
        onHide={() => setEditSidebarVisible(false)}
        style={{ width: "500px" }}
      >
        <h2 className="mb-4">Edit Checklist Item</h2>

        <div className="p-fluid flex flex-column gap-4">
          <span className="p-float-label">
            <InputText
              id="editItemName"
              value={editItemName}
              onChange={(e) => setEditItemName(e.target.value)}
            />
            <label htmlFor="editItemName">Item Name *</label>
          </span>

          <span className="p-float-label">
            <InputTextarea
              id="editDescription"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={3}
            />
            <label htmlFor="editDescription">Description *</label>
          </span>

          <span className="p-float-label">
            <Dropdown
              id="editCategory"
              value={editCategory}
              options={categoryOptions}
              onChange={(e) => setEditCategory(e.value)}
            />
            <label htmlFor="editCategory">Category *</label>
          </span>

          <span className="p-float-label">
            <Dropdown
              id="editPriority"
              value={editPriority}
              options={priorityOptions}
              onChange={(e) => setEditPriority(e.value)}
            />
            <label htmlFor="editPriority">Priority</label>
          </span>

          <span className="p-float-label">
            <InputText
              id="editEstimatedTime"
              type="number"
              value={editEstimatedTime}
              onChange={(e) => setEditEstimatedTime(e.target.value)}
            />
            <label htmlFor="editEstimatedTime">Estimated Time (minutes) *</label>
          </span>

          <div className="field-checkbox">
            <Checkbox
              id="editIsRequired"
              checked={editIsRequired}
              onChange={(e) => setEditIsRequired(e.checked)}
            />
            <label htmlFor="editIsRequired" className="ml-2">This item is required</label>
          </div>

          <div className="field-checkbox">
            <Checkbox
              id="editIsActive"
              checked={editIsActive}
              onChange={(e) => setEditIsActive(e.checked)}
            />
            <label htmlFor="editIsActive" className="ml-2">Item is active</label>
          </div>

          <div className="flex gap-2 mt-3">
            <Button
              label="Cancel"
              className="p-button-secondary"
              onClick={() => setEditSidebarVisible(false)}
            />
            <Button
              label="Save Changes"
              className="p-button-success"
              onClick={saveEdit}
            />
          </div>
        </div>
      </Sidebar>

      {/* Menu Sidebar */}
      <Sidebar
        visible={menuSidebarVisible}
        position="left"
        onHide={() => setMenuSidebarVisible(false)}
        style={{ width: "250px" }}
      >
        <Menu model={menuItems} ref={menuRef} />
      </Sidebar>
    </div>
  );
}