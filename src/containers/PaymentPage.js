// src/containers/PaymentPage.js
import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  message,
  Typography,
  Row,
  Col,
} from "antd";
import {
  CreditCardOutlined,
  BankOutlined,
  QrcodeOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

const { Title, Text } = Typography;
const { Option } = Select;

export default function PaymentPage() {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [form] = Form.useForm();

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const invoice = location.state?.invoice;

  useEffect(() => {
    if (invoice) {
      const balance =
        (invoice.totalAmount || 0) - (invoice.paidAmount || 0);
      form.setFieldsValue({
        amount: balance > 0 ? balance : 0,
        method: "credit",
      });
    }
  }, [invoice, form]);

  // ❌ LOGIC UNCHANGED
  const onFinish = (values) => {
    setLoading(true);

    const paidAmount = Number(values.amount);
    const totalAmount = Number(invoice?.totalAmount || 0);
    const existingPaid = Number(invoice?.paidAmount || 0);
    const newTotalPaid = existingPaid + paidAmount;

    let status = "Unpaid";
    if (newTotalPaid >= totalAmount) status = "Paid";
    else if (newTotalPaid > 0) status = "Partial Paid";

    const payload = {
      id: invoice?.id,
      paidAmount: newTotalPaid,
      status,
    };

    dispatch({
      type: "billing/updatePaymentStart",
      payload,
    });

    message.success(`Payment of ₹${paidAmount} successful! Status: ${status}`);
    setTimeout(() => {
      navigate("/billing");
      setLoading(false);
    }, 1000);
  };

  // ❌ LOGIC UNCHANGED
  const renderPaymentFields = () => {
    if (paymentMethod === "upi") {
      return (
        <>
          <Form.Item
            label="UPI ID"
            name="upiId"
            rules={[
              { required: true, message: "UPI ID podu bro" },
              { pattern: /^[\w.-]+@[\w.-]+$/, message: "Invalid UPI ID" },
            ]}
          >
            <Input placeholder="user@upi" />
          </Form.Item>

          <div style={{ textAlign: "center", marginBottom: 6 }}>
            <QrcodeOutlined style={{ fontSize: 32, color: "#1890ff" }} />
            <Text type="secondary">Scan to Pay</Text>
          </div>
        </>
      );
    }

    return (
      <>
        <Form.Item
          label="Card Number"
          name="cardNumber"
          rules={[
            { required: true, message: "Card number podu" },
            { pattern: /^\d{16}$/, message: "16 digits venum" },
          ]}
        >
          <Input maxLength={16} placeholder="1234567890123456" />
        </Form.Item>

        <Row gutter={8}>
          <Col span={12}>
            <Form.Item
              label="Expiry"
              name="expiry"
              rules={[{ required: true, message: "MM/YY podu" }]}
            >
              <Input placeholder="MM/YY" maxLength={5} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="CVV"
              name="cvv"
              rules={[{ required: true, message: "CVV podu" }]}
            >
              <Input maxLength={4} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Name podu" }]}
        >
          <Input />
        </Form.Item>

        <div style={{ textAlign: "center", marginBottom: 4 }}>
          {paymentMethod === "debit" ? (
            <BankOutlined style={{ fontSize: 30, color: "#52c41a" }} />
          ) : (
            <CreditCardOutlined style={{ fontSize: 30, color: "#1890ff" }} />
          )}
        </div>
      </>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        background: "#f5f7fb",
        paddingTop: 0,   // ✅ TOP SPACE REDUCED
        paddingBottom: 24,
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 460,
          padding: 16,
          borderRadius: 12,
          boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
        }}
      >
        <Title level={4} style={{ textAlign: "center", marginBottom: 0 }}>
          Payment Gateway
        </Title>
        <Text
          type="secondary"
          style={{ display: "block", textAlign: "center", marginBottom: 10 }}
        >
          Secure & Fast Payment
        </Text>

        <Form layout="vertical" onFinish={onFinish} form={form}>
          <Form.Item
            label="Method"
            name="method"
            rules={[{ required: true, message: "Method select pannu" }]}
          >
            <Select onChange={(v) => setPaymentMethod(v)}>
              <Option value="credit">Credit</Option>
              <Option value="debit">Debit</Option>
              <Option value="upi">UPI</Option>
            </Select>
          </Form.Item>

          {renderPaymentFields()}

          <Form.Item
            label="Amount"
            name="amount"
            rules={[{ required: true, message: "Amount podu" }]}
          >
            <Input prefix="₹" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
          >
            Pay Now
          </Button>
        </Form>
      </Card>
    </div>
  );
}
