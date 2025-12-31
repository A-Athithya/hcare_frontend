// src/components/admin/InventoryManagement.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchInventoryRequest,
  addInventoryRequest,
  updateInventoryRequest,
  deleteInventoryRequest,
} from "../../features/inventory/inventorySlice";
import { Table, Card, Input, Button, message, Tag } from "antd";
import dayjs from "dayjs";

export default function InventoryManagement() {
  const dispatch = useDispatch();
  const { items: itemsRaw = [], loading = false } = useSelector(
    (state) => state.inventory
  );
  const items = Array.isArray(itemsRaw) ? itemsRaw : [];

  const [mode, setMode] = useState("list"); // list | add | edit | view
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    medicine_name: "",
    description: "",
    category: "",
    price: "",
    stock: "",
    expiry_date: "",
  });

  useEffect(() => {
    dispatch(fetchInventoryRequest());
  }, [dispatch]);

  const openAdd = () => {
    setMode("add");
    setSelected(null);
    setFormData({
      medicine_name: "",
      description: "",
      category: "",
      price: "",
      stock: "",
      expiry_date: "",
    });
  };

  const openEdit = (record) => {
    setMode("edit");
    setSelected(record);
    setFormData({ ...record });
  };

  const openView = (record) => {
    setMode("view");
    setSelected(record);
    setFormData({ ...record });
  };

  const backToList = () => {
    setMode("list");
    setSelected(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (mode === "edit") {
      dispatch(updateInventoryRequest({ ...selected, ...formData }));
      message.success("Medicine updated successfully!");
    } else if (mode === "add") {
      dispatch(addInventoryRequest({ ...formData, id: Date.now().toString() }));
      message.success("Medicine added successfully!");
    }
    dispatch(fetchInventoryRequest());
    backToList();
  };

  const handleDelete = (id) => {
    dispatch(deleteInventoryRequest(id));
    message.success("Medicine deleted successfully!");
  };

  const filtered = items.filter(
    (i) =>
      !search ||
      i.medicine_name?.toLowerCase().includes(search.toLowerCase()) ||
      i.category?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { title: "Medicine Name", dataIndex: "medicine_name", key: "medicine_name" },
    { title: "Category", dataIndex: "category", key: "category" },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (text) => `₹${text}`,
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      render: (text) => (
        <span
          style={{
            color: text <= 10 ? "red" : text <= 50 ? "orange" : "green",
            fontWeight: "bold",
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Expiry Date",
      dataIndex: "expiry_date",
      key: "expiry_date",
      render: (text) => {
        if (!text) return "-";
        const isExpired = dayjs(text).isBefore(dayjs());
        return <span style={{ color: isExpired ? "red" : "black" }}>{text}</span>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 6 }}>
          <Button size="small" onClick={() => openView(record)}>View</Button>
          <Button size="small" type="primary" onClick={() => openEdit(record)}>Edit</Button>
          <Button size="small" danger onClick={() => handleDelete(record.id)}>Delete</Button>
        </div>
      ),
    },
  ];

  if (mode !== "list") {
    return (
      <div style={{ display: "flex", gap: 24, padding: 24 }}>
        <Card style={{ flex: 1, padding: 20 }}>
          <h2 style={{ marginTop: 0 }}>
            {mode === "view" ? "View Medicine" : mode === "edit" ? "Edit Medicine" : "Add Medicine"}
          </h2>
          <form
            onSubmit={(e) => { e.preventDefault(); handleSave(); }}
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            {[
              { label: "Medicine Name", name: "medicine_name" },
              { label: "Category", name: "category" },
              { label: "Price", name: "price" },
              { label: "Stock", name: "stock" },
              { label: "Expiry Date", name: "expiry_date", type: "date" },
              { label: "Description", name: "description", isTextArea: true },
            ].map((item) => (
              <div key={item.name} style={{ gridColumn: item.isTextArea ? "1 / span 2" : undefined }}>
                <label>{item.label}</label>
                {item.isTextArea ? (
                  <textarea
                    name={item.name}
                    value={formData[item.name]}
                    onChange={handleChange}
                    readOnly={mode === "view"}
                    rows={3}
                    style={{
                      width: "100%",
                      padding: 8,
                      borderRadius: 8,
                      border: "1px solid #ccc",
                      resize: "none",
                    }}
                  />
                ) : (
                  <input
                    type={item.type || "text"}
                    name={item.name}
                    value={formData[item.name]}
                    onChange={handleChange}
                    readOnly={mode === "view"}
                    style={{
                      width: "100%",
                      padding: 8,
                      borderRadius: 8,
                      border: "1px solid #ccc",
                    }}
                  />
                )}
              </div>
            ))}
            {mode !== "view" && (
              <div style={{ gridColumn: "1 / span 2", display: "flex", gap: 8 }}>
                <Button htmlType="submit" type="primary">{mode === "edit" ? "Update" : "Add"}</Button>
                <Button type="default" onClick={() => setFormData(selected || { ...formData })}>Reset</Button>
              </div>
            )}
          </form>
          <div style={{ marginTop: 12 }}>
            <Button onClick={backToList}>Back to List</Button>
          </div>
        </Card>

        <Card style={{ flex: 1, background: "#fafafa", padding: 20 }}>
          <h3>Medicine Preview</h3>
          {selected ? (
            <>
              <p><strong>Medicine Name:</strong> {selected.medicine_name || "-"}</p>
              <p><strong>Category:</strong> {selected.category || "-"}</p>
              <p><strong>Price:</strong> ₹{selected.price || "-"}</p>
              <p><strong>Stock:</strong> {selected.stock || "-"}</p>
              <p><strong>Expiry Date:</strong> {selected.expiry_date || "-"}</p>
              <p><strong>Description:</strong> {selected.description || "-"}</p>
            </>
          ) : (
            <p>Fill the form to see preview here...</p>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2>Inventory Management</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <Input.Search placeholder="Search medicine" allowClear onSearch={(v) => setSearch(v)} style={{ width: 220 }} />
          <Button type="primary" onClick={openAdd}>Add Medicine</Button>
        </div>
      </div>
      <Card>
        <Table rowKey="id" dataSource={filtered} columns={columns} loading={loading} pagination={{ pageSize: 7 }} />
      </Card>
    </div>
  );
}
