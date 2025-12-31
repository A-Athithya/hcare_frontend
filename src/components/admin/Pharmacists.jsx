// src/components/admin/PharmacistsPage.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStaffRequest,
  addStaffRequest,
  updateStaffRequest,
  deleteStaffRequest,
} from "../../features/staff/staffSlice";
import { Table, Card, Input, Button, Space, message } from "antd";

export default function Pharmacists() {
  const dispatch = useDispatch();
  const { pharmacists: pharmacistsRaw, loading } = useSelector((s) => s.staff);
  const pharmacists = Array.isArray(pharmacistsRaw) ? pharmacistsRaw : [];

  const [mode, setMode] = useState("list"); // list | new | edit | view
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    license_no: "", // match table column
    email: "",
    contact: "",
    experience: "",
    password: "", // Added password field
  });

  useEffect(() => {
    dispatch(fetchStaffRequest({ role: "pharmacists" }));
  }, [dispatch]);

  const openNew = () => {
    setSelected(null);
    setFormData({
      name: "",
      license_no: "",
      email: "",
      contact: "",
      experience: "",
    });
    setMode("new");
  };

  const openEdit = (record) => {
    setSelected(record);
    setFormData({ ...record });
    setMode("edit");
  };

  const openView = (record) => {
    setSelected(record);
    setFormData({ ...record });
    setMode("view");
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
      dispatch(updateStaffRequest({ role: "pharmacists", staff: { ...selected, ...formData } }));
      message.success("Pharmacist updated successfully!");
    } else if (mode === "new") {
      dispatch(addStaffRequest({ role: "pharmacists", staff: { ...formData, id: Date.now() } }));
      message.success("Pharmacist added successfully!");
    }
    dispatch(fetchStaffRequest({ role: "pharmacists" }));
    setMode("list");
  };

  const handleDelete = (id) => {
    dispatch(deleteStaffRequest({ role: "pharmacists", id }));
    message.success("Pharmacist deleted successfully!");
  };

  const filtered = pharmacists.filter(
    (p) =>
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.license_no?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()) ||
      p.contact?.toLowerCase().includes(search.toLowerCase()) ||
      p.experience?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "License No", dataIndex: "license_no", key: "license_no" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Contact", dataIndex: "contact", key: "contact" },
    { title: "Experience", dataIndex: "experience", key: "experience" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openView(record)}>View</Button>
          <Button size="small" type="primary" onClick={() => openEdit(record)}>Edit</Button>
          <Button size="small" danger onClick={() => handleDelete(record.id)}>Delete</Button>
        </Space>
      ),
    },
  ];

  if (mode !== "list") {
    return (
      <div style={{ padding: 24, display: "flex", gap: 24, height: "100%" }}>
        <Card style={{ width: "55%", height: "100%", overflowY: "auto", padding: 20 }}>
          <h2 style={{ marginTop: 0 }}>
            {mode === "edit" ? "Edit Pharmacist" : mode === "view" ? "Pharmacist Details" : "Add Pharmacist"}
          </h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            {[
              { label: "Name", name: "name" },
              { label: "License No", name: "license_no" },
              { label: "Email", name: "email" },
              { label: "Contact", name: "contact" },
              { label: "Experience", name: "experience" },
              ...(mode === "new" ? [{ label: "Login Password", name: "password", type: "password" }] : []),
            ].map((item) => (
              <div key={item.name}>
                <label>{item.label}</label>
                <input
                  name={item.name}
                  type={item.type || "text"}
                  value={formData[item.name] || ""}
                  onChange={handleChange}
                  readOnly={mode === "view"}
                  required={item.name === "password" && mode === "new"}
                  style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
                />
              </div>
            ))}

            {mode !== "view" && (
              <div style={{ gridColumn: "1 / span 2", display: "flex", gap: 8 }}>
                <Button htmlType="submit" type="primary">{mode === "edit" ? "Update Pharmacist" : "Add Pharmacist"}</Button>
                <Button type="default" onClick={() => setFormData(selected || {})}>Reset</Button>
              </div>
            )}
          </form>

          <div style={{ marginTop: 12 }}>
            <Button onClick={backToList}>Back to List</Button>
          </div>
        </Card>

        <Card style={{ width: "45%", height: "100%", overflowY: "auto", padding: 20, background: "#fafafa" }}>
          {selected ? (
            <>
              <h3>Pharmacist Preview</h3>
              <p><strong>Name:</strong> {selected.name || "—"}</p>
              <p><strong>License No:</strong> {selected.license_no || "—"}</p>
              <p><strong>Email:</strong> {selected.email || "—"}</p>
              <p><strong>Contact:</strong> {selected.contact || "—"}</p>
              <p><strong>Experience:</strong> {selected.experience || "—"}</p>
            </>
          ) : (
            <>
              <h3>New Pharmacist</h3>
              <p>Fill the form to see preview here...</p>
            </>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Pharmacists</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <Input.Search placeholder="Search pharmacist" onSearch={(v) => setSearch(v)} allowClear style={{ width: 220 }} />
          <Button type="primary" onClick={openNew}>Add Pharmacist</Button>
        </div>
      </div>
      <Card>
        <Table rowKey="id" dataSource={filtered} columns={columns} loading={loading} pagination={{ pageSize: 8 }} />
      </Card>
    </div>
  );
}
