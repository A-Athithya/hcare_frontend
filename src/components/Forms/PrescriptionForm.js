import React, { useEffect } from "react";
import { Form, Input, Select, DatePicker, Button, Row, Col, Space, message } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";

export default function PrescriptionForm({ onSaved = () => { }, onCancel = () => { } }) {
    const [form] = Form.useForm();
    const dispatch = useDispatch();

    // ✅ Use Redux selectors with safe defaults
    const patientsRaw = useSelector((s) => s.patients?.list);
    const patients = Array.isArray(patientsRaw) ? patientsRaw : [];

    const doctorsRaw = useSelector((s) => s.doctors?.list);
    const doctors = Array.isArray(doctorsRaw) ? doctorsRaw : [];

    const appointmentsRaw = useSelector((s) => s.appointments?.list);
    const appointments = Array.isArray(appointmentsRaw) ? appointmentsRaw : [];

    // Fetch dependencies if not loaded
    useEffect(() => {
        if (patients.length === 0) dispatch({ type: "patients/fetchStart" });
        if (doctors.length === 0) dispatch({ type: "doctors/fetchStart" });
        dispatch({ type: "appointments/fetchStart" });
    }, [dispatch, patients.length, doctors.length]);

    const onFinish = (vals) => {
        // Format payload for backend
        // Backend expects: patient_id, doctor_id, prescription_date, medicines (array of objects), status, notes
        const payload = {
            patient_id: vals.patientId,
            doctor_id: vals.doctorId,
            appointment_id: vals.appointmentId,
            pharmacist_id: vals.pharmacistId, // Optional
            prescription_date: vals.date ? vals.date.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
            status: "Active",
            notes: vals.notes || "",
            dosage: vals.dosage || "", // Global dosage
            instructions: vals.instructions || "", // Global instructions
            medicines: JSON.stringify(vals.medicines || []),
        };

        // Correct payload for Saga
        dispatch({
            type: "prescriptions/createStart",
            payload: {
                ...payload,
                // Saga might expect just the object.
            },
        });

        // Optimistic success msg (Saga handles real one)
        message.success("Prescription created");
        form.resetFields();
        onSaved();
    };

    return (
        <Form
            layout="vertical"
            form={form}
            onFinish={onFinish}
            initialValues={{ date: dayjs(), medicines: [{}] }} // Default one empty medicine row
        >
            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item name="patientId" label="Patient" rules={[{ required: true, message: "Select Patient" }]}>
                        <Select placeholder="Select Patient" showSearch optionFilterProp="children">
                            {patients.map((p) => (
                                <Select.Option key={p.id} value={p.id}>
                                    {p.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="doctorId" label="Doctor" rules={[{ required: true, message: "Select Doctor" }]}>
                        <Select placeholder="Select Doctor" showSearch optionFilterProp="children">
                            {doctors.map((d) => (
                                <Select.Option key={d.id} value={d.id}>
                                    {d.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="appointmentId" label="Appointment">
                        <Select placeholder="Link Appointment" allowClear optionLabelProp="label">
                            {appointments?.map((a) => {
                                const patientName = patients.find(p => String(p.id) === String(a.patient_id || a.patientId))?.name || "Unknown";
                                const label = `Appt #${a.id} - ${patientName} (${a.appointment_date || a.appointmentDate} ${a.appointment_time || a.appointmentTime || ''})`;

                                return (
                                    <Select.Option key={a.id} value={a.id} label={label}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 'bold' }}>#{a.id} - {patientName}</span>
                                            <span style={{ fontSize: '12px', color: '#666' }}>
                                                {a.appointment_date || a.appointmentDate} • {a.appointment_time || a.appointmentTime || 'Time N/A'}
                                            </span>
                                        </div>
                                    </Select.Option>
                                );
                            })}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="dosage" label="Global Dosage Info">
                        <Input placeholder="e.g. 2 times a day" />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="instructions" label="Global Instructions">
                        <Input placeholder="e.g. Take after food" />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item label="Medicines">
                <Form.List name="medicines">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Space key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                                    <Form.Item
                                        {...restField}
                                        name={[name, "medicineName"]}
                                        rules={[{ required: true, message: "Name required" }]}
                                    >
                                        <Input placeholder="Medicine Name" />
                                    </Form.Item>
                                    <Form.Item
                                        {...restField}
                                        name={[name, "dosage"]}
                                        rules={[{ required: true, message: "Dosage required" }]}
                                    >
                                        <Input placeholder="Dosage (e.g. 500mg)" />
                                    </Form.Item>
                                    <Form.Item
                                        {...restField}
                                        name={[name, "frequency"]}
                                    >
                                        <Input placeholder="Freq (1-0-1)" />
                                    </Form.Item>
                                    <Form.Item
                                        {...restField}
                                        name={[name, "duration"]}
                                    >
                                        <Input placeholder="Duration (5 days)" />
                                    </Form.Item>
                                    <MinusCircleOutlined onClick={() => remove(name)} />
                                </Space>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    Add Medicine
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>
            </Form.Item>

            <Form.Item name="notes" label="Notes">
                <Input.TextArea rows={2} placeholder="Additional instructions..." />
            </Form.Item>

            <div style={{ textAlign: "right" }}>
                <Space>
                    <Button onClick={onCancel}>Cancel</Button>
                    <Button type="primary" htmlType="submit">
                        Save Prescription
                    </Button>
                </Space>
            </div>
        </Form>
    );
}
