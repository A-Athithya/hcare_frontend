import React, { useEffect } from "react";
import { Form, Input, Select, DatePicker, Button, InputNumber, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";

const { Option } = Select;

export default function InvoiceForm({ onSaved, onCancel }) {
    const [form] = Form.useForm();
    const dispatch = useDispatch();

    const patientsRaw = useSelector((s) => s.patients?.list);
    const patients = Array.isArray(patientsRaw) ? patientsRaw : [];

    const doctorsRaw = useSelector((s) => s.doctors?.list);
    const doctors = Array.isArray(doctorsRaw) ? doctorsRaw : [];

    const appointmentsRaw = useSelector((s) => s.appointments?.list);
    const appointments = Array.isArray(appointmentsRaw) ? appointmentsRaw : [];

    useEffect(() => {
        if (patients.length === 0) dispatch({ type: "patients/fetchStart" });
        if (doctors.length === 0) dispatch({ type: "doctors/fetchStart" });
        dispatch({ type: "appointments/fetchStart" });
    }, [dispatch, patients.length, doctors.length]);

    const onFinish = (values) => {
        const payload = {
            patientId: values.patientId,
            doctorId: values.doctorId,
            appointmentId: values.appointmentId,
            invoiceDate: values.invoiceDate ? dayjs(values.invoiceDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
            totalAmount: values.totalAmount,
            paidAmount: values.paidAmount || 0,
            status: (values.paidAmount || 0) >= values.totalAmount ? "Paid" : "Unpaid"
        };

        dispatch({ type: "billing/createStart", payload });
        message.success("Invoice created successfully!");
        form.resetFields();
        if (onSaved) onSaved();
    };

    return (
        <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
                label="Patient"
                name="patientId"
                rules={[{ required: true, message: "Please select a patient" }]}
            >
                <Select
                    placeholder="Select Patient"
                    showSearch
                    filterOption={(input, option) =>
                        (option?.children || "").toString().toLowerCase().includes(input.toLowerCase())
                    }
                >
                    {patients.map((p) => (
                        <Option key={p.id} value={p.id}>
                            {p.name}
                        </Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item
                label="Doctor"
                name="doctorId"
                rules={[{ required: true, message: "Please select a doctor" }]}
            >
                <Select
                    placeholder="Select Doctor"
                    showSearch
                    filterOption={(input, option) =>
                        (option?.children || "").toString().toLowerCase().includes(input.toLowerCase())
                    }
                >
                    {doctors.map((d) => (
                        <Option key={d.id} value={d.id}>
                            {d.name}
                        </Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item
                label="Link to Appointment"
                name="appointmentId"
            >
                <Select placeholder="Select Appointment (Optional)" allowClear>
                    {appointments.map((a) => {
                        const patient = patients.find(p => String(p.id) === String(a.patient_id || a.patientId));
                        const label = `#${a.id} - ${a.appointment_date || a.appointmentDate} (${patient?.name || 'Unknown'})`;
                        return (
                            <Option key={a.id} value={a.id}>
                                {label}
                            </Option>
                        );
                    })}
                </Select>
            </Form.Item>

            <Form.Item label="Invoice Date" name="invoiceDate">
                <DatePicker style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
                label="Total Amount (₹)"
                name="totalAmount"
                rules={[{ required: true, message: "Please enter total amount" }]}
            >
                <InputNumber min={0} style={{ width: "100%" }} placeholder="Enter total amount" />
            </Form.Item>

            <Form.Item label="Paid Amount (₹)" name="paidAmount">
                <InputNumber min={0} style={{ width: "100%" }} placeholder="Enter paid amount (optional)" />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                    Create Invoice
                </Button>
                <Button onClick={onCancel}>Cancel</Button>
            </Form.Item>
        </Form>
    );
}
