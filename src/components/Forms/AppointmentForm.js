import React, { useEffect, useRef } from "react";
import { Form, Input, Select, DatePicker, TimePicker, Row, Col, message } from "antd";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";

export default function AppointmentForm({ initial = null, onSaved = () => { }, autoFocusPatientId }) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  // ✅ Use Redux selectors with safe defaults
  const patientsRaw = useSelector((s) => s.patients?.list);
  const patients = Array.isArray(patientsRaw) ? patientsRaw : [];

  const doctorsRaw = useSelector((s) => s.doctors?.list);
  const doctors = Array.isArray(doctorsRaw) ? doctorsRaw : [];
  const { user } = useSelector((state) => state.auth || {});

  useEffect(() => {
    if (patients.length === 0) dispatch({ type: "patients/fetchStart" });
    if (doctors.length === 0) dispatch({ type: "doctors/fetchStart" });
  }, [dispatch, patients.length, doctors.length]);

  useEffect(() => {
    if (initial) {
      form.setFieldsValue({
        patientId: initial.patientId || initial.patient_id,
        doctorId: initial.doctorId || initial.doctor_id,
        date: dayjs(initial.appointmentDate || initial.appointment_date),
        time: (initial.appointmentTime || initial.appointment_time)
          ? dayjs(initial.appointmentTime || initial.appointment_time, "hh:mm:ss")
          : undefined,
        reason: initial.reason || "",
        remarks: initial.remarks || "",
        status: initial.status || "Pending",
      });
    } else {
      form.resetFields();
      if (autoFocusPatientId) form.setFieldsValue({ patientId: autoFocusPatientId });

      // Auto-select if only one patient available (Patient Role)
      if (patients.length === 1) {
        form.setFieldsValue({ patientId: patients[0].id });
      }

      // Pre-select self if doctor
      if (user?.role === "doctor" && doctors.length > 0) {
        const selfDoc = doctors.find(d =>
          d.email?.toLowerCase() === user.email?.toLowerCase()
        );
        if (selfDoc) {
          form.setFieldsValue({ doctorId: selfDoc.id });
        }
      }
    }
  }, [initial, form, autoFocusPatientId, user, doctors, patients]);

  const onFinish = (vals) => {
    const payload = {
      patient_id: vals.patientId,
      doctor_id: vals.doctorId,
      appointment_date: vals.date.format("YYYY-MM-DD"),
      appointment_time: vals.time.format("HH:mm:ss"),
      reason: vals.reason,
      remarks: vals.remarks || "",
      status: vals.status || "Pending",
    };

    if (initial?.id) {
      dispatch({
        type: "appointments/updateStatus",
        payload: { appointment: { ...initial, ...payload }, status: payload.status },
      });
      message.success("Appointment updated");
    } else {
      dispatch({
        type: "appointments/createStart",
        payload,
      });
      message.success("Appointment scheduled");
    }

    onSaved();
  };

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={onFinish}
      style={{ paddingRight: 8, marginTop: "-10px" }}
    >
      <Row gutter={[12, 4]}>
        <Col span={8}>
          <Form.Item name="patientId" label="Patient" rules={[{ required: true }]} style={{ marginBottom: 8 }}>
            <Select placeholder="Select patient">
              {patients.map((p) => (
                <Select.Option key={p.id} value={p.id}>
                  {p.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item name="doctorId" label="Doctor" rules={[{ required: true }]} style={{ marginBottom: 8 }}>
            <Select placeholder="Select doctor" disabled={user?.role === "doctor"}>
              {doctors.map((d) => (
                <Select.Option key={d.id} value={d.id}>
                  {d.name} {d.specialization ? `• ${d.specialization}` : ""}
                  {user?.role === "doctor" && d.email === user?.email ? " (Me)" : ""}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item name="date" label="Date" rules={[{ required: true }]} style={{ marginBottom: 8 }}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item name="time" label="Time" rules={[{ required: true }]} style={{ marginBottom: 8 }}>
            <TimePicker style={{ width: "100%" }} format="hh:mm A" use12Hours />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item name="status" label="Status" style={{ marginBottom: 8 }}>
            <Select disabled={user?.role === "patient" && !initial}>
              <Select.Option value="Pending">Pending</Select.Option>
              <Select.Option value="Accepted">Accepted</Select.Option>
              <Select.Option value="Completed">Completed</Select.Option>
              <Select.Option value="Rejected">Rejected</Select.Option>
              <Select.Option value="Cancelled">Cancelled</Select.Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item name="reason" label="Reason" rules={[{ required: true }]} style={{ marginBottom: 8 }}>
            <Input placeholder="Appointment reason" />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item name="remarks" label="Remarks" style={{ marginBottom: 8 }}>
            <Input.TextArea placeholder="Notes" />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}
