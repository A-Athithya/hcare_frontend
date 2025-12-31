// src/containers/BillingPage.js
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  Card,
  Tag,
  Typography,
  Button,
  Modal,
  Descriptions,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import InvoiceForm from "../components/Forms/InvoiceForm";

const { Title } = Typography;

export default function BillingPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const invoicesRaw = useSelector((s) => s.billing?.list);
  const invoices = Array.isArray(invoicesRaw) ? invoicesRaw : [];

  // ✅ Use Redux selectors with safe defaults
  const doctorsRaw = useSelector((s) => s.doctors?.list);
  const doctors = Array.isArray(doctorsRaw) ? doctorsRaw : [];

  const patientsRaw = useSelector((s) => s.patients?.list);
  const patients = Array.isArray(patientsRaw) ? patientsRaw : [];

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  useEffect(() => {
    dispatch({ type: "billing/fetchStart" });
    if (doctors.length === 0) dispatch({ type: "doctors/fetchStart" });
    if (patients.length === 0) dispatch({ type: "patients/fetchStart" });
  }, [dispatch, doctors.length, patients.length]);

  const findPatient = (id) =>
    patients.find((p) => String(p.id) === String(id));

  const findDoctor = (id) =>
    doctors.find((d) => String(d.id) === String(id));

  const getPatientName = (id) =>
    findPatient(id)?.name || "Unknown Patient";

  const getDoctorName = (id) =>
    findDoctor(id)?.name || "Unknown Doctor";

  const handleViewDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setIsModalVisible(true);
  };

  const handlePay = (invoice) => {
    setIsModalVisible(false);
    navigate("/payment", { state: { invoice } });
  };

  const columns = [
    { title: "Invoice ID", dataIndex: "id" },

    {
      title: "Patient",
      render: (_, rec) => getPatientName(rec.patientId),
    },

    {
      title: "Doctor",
      render: (_, rec) => getDoctorName(rec.doctorId),
    },

    {
      title: "Total Amount",
      render: (_, rec) => {
        const amount = typeof rec.totalAmount === "object" ? rec.totalAmount.amount : rec.totalAmount;
        return `₹${amount || 0}`;
      },
    },

    {
      title: "Paid Amount",
      render: (_, rec) => {
        const paid = typeof rec.paidAmount === "object" ? rec.paidAmount.amount : rec.paidAmount;
        return `₹${paid || 0}`;
      },
    },

    {
      title: "Balance",
      render: (_, rec) => {
        const total = typeof rec.totalAmount === "object" ? rec.totalAmount.amount : rec.totalAmount;
        const paid = typeof rec.paidAmount === "object" ? rec.paidAmount.amount : rec.paidAmount;
        const balance = (total || 0) - (paid || 0);
        return `₹${balance.toFixed(2)}`;
      },
    },

    {
      title: "Status",
      render: (_, rec) => {
        const status = typeof rec.status === "object" ? rec.status.status : rec.status;
        let color = "red";
        if (status === "Paid") color = "green";
        else if (status === "Partial Paid") color = "orange";

        return <Tag color={color}>{status}</Tag>;
      },
    },

    {
      title: "Action",
      render: (_, record) => (
        <Button type="primary" onClick={() => handleViewDetails(record)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Billing</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalVisible(true)}>
          Add Invoice
        </Button>
      </div>

      <Card>
        <Table
          dataSource={Array.isArray(invoices) ? invoices : []}
          columns={columns}
          rowKey="id"
        />
      </Card>

      {/* Add Invoice Modal */}
      <Modal
        title="Create New Invoice"
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <InvoiceForm
          onSaved={() => setIsAddModalVisible(false)}
          onCancel={() => setIsAddModalVisible(false)}
        />
      </Modal>

      <Modal
        title="Invoice Details"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
          selectedInvoice?.status !== "Paid" && (
            <Button
              key="pay"
              type="primary"
              onClick={() => handlePay(selectedInvoice)}
            >
              Pay
            </Button>
          ),
        ]}
      >
        {selectedInvoice && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Patient">
              {getPatientName(selectedInvoice.patientId)}
            </Descriptions.Item>

            <Descriptions.Item label="Doctor">
              {getDoctorName(selectedInvoice.doctorId)}
            </Descriptions.Item>

            <Descriptions.Item label="Total Amount">
              ₹{selectedInvoice.totalAmount || 0}
            </Descriptions.Item>

            <Descriptions.Item label="Paid Amount">
              ₹{selectedInvoice.paidAmount || 0}
            </Descriptions.Item>

            <Descriptions.Item label="Balance">
              ₹{((selectedInvoice.totalAmount || 0) - (selectedInvoice.paidAmount || 0)).toFixed(2)}
            </Descriptions.Item>

            <Descriptions.Item label="Status">
              <Tag color={
                selectedInvoice.status === "Paid" ? "green" :
                  selectedInvoice.status === "Partial Paid" ? "orange" : "red"
              }>
                {selectedInvoice.status}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
