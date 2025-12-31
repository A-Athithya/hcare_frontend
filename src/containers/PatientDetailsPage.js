// src/containers/PatientDetailsPage.js
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Card, Row, Col, Descriptions, Table, Button, Spin, message } from "antd";
import dayjs from "dayjs";

export default function PatientDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ✅ Use Redux selectors with safe defaults
  const patientsRaw = useSelector((s) => s.patients?.list);
  const patients = Array.isArray(patientsRaw) ? patientsRaw : [];
  const patientsLoading = useSelector((s) => s.patients?.loading) || false;

  const allAppointmentsRaw = useSelector((s) => s.appointments?.list);
  const allAppointments = Array.isArray(allAppointmentsRaw) ? allAppointmentsRaw : [];
  const appointmentsLoading = useSelector((s) => s.appointments?.loading) || false;

  // Derive data
  const patient = patients.find((p) => String(p.id) === String(id));
  const appointments = allAppointments.filter((a) => String(a.patientId) === String(id));

  const loading = patientsLoading || appointmentsLoading;

  useEffect(() => {
    if (patients.length === 0) dispatch({ type: "patients/fetchStart" });
    if (allAppointments.length === 0) dispatch({ type: "appointments/fetchStart" });
  }, [dispatch, patients.length, allAppointments.length]);

  const handleDelete = () => {
    if (!window.confirm("Are you sure you want to delete this patient?")) return;
    dispatch({ type: "patients/deleteStart", payload: id });
    message.success("Delete request sent");
    navigate("/patients");
  };

  if (loading && !patient)
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
        <Spin />
      </div>
    );

  if (!patient)
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        Patient not found or access denied.
      </div>
    );

  const appointmentsColumns = [
    {
      title: "Date",
      dataIndex: "appointmentDate",
      key: "appointmentDate",
      render: (d) => dayjs(d).format("DD MMM YYYY"),
    },
    { title: "Time", dataIndex: "appointmentTime", key: "appointmentTime" },
    { title: "Doctor ID", dataIndex: "doctorId", key: "doctorId" },
    { title: "Reason", dataIndex: "reason", key: "reason" },
    { title: "Status", dataIndex: "status", key: "status" },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Row gutter={16}>
        <Col xs={24}>
          <Card
            title={`${patient.name || "Unnamed"} — Details`}
            extra={
              <div style={{ display: "flex", gap: 8 }}>
                <Button onClick={() => navigate(`/patient/edit/${id}`)}>
                  Edit
                </Button>
                <Button
                  type="primary"
                  onClick={() =>
                    navigate(`/appointments?patientId=${id}`)
                  }
                >
                  Book Appointment
                </Button>
                <Button onClick={() => navigate("/patients")}>Back</Button>
                <Button danger onClick={handleDelete}>Delete</Button>
              </div>
            }
          >
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="Name">
                {patient.name || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Age">
                {patient.age ?? "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Gender">
                {patient.gender || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Contact">
                {patient.contact || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {patient.email || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                {patient.address || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Blood Group">
                {patient.bloodGroup || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Registered Date">
                {patient.registeredDate
                  ? dayjs(patient.registeredDate).format("DD MMM YYYY")
                  : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Medical History">
                {patient.medicalHistory || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Allergies">
                {patient.allergies || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Emergency Contact">
                {patient.emergencyContact || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {patient.status || "—"}
              </Descriptions.Item>
              {Object.keys(patient).map((k) => {
                if (
                  [
                    "id",
                    "name",
                    "age",
                    "gender",
                    "contact",
                    "email",
                    "address",
                    "bloodGroup",
                    "registeredDate",
                    "medicalHistory",
                    "allergies",
                    "emergencyContact",
                    "status",
                  ].includes(k)
                )
                  return null;
                return (
                  <Descriptions.Item key={k} label={k}>
                    {typeof patient[k] === "object"
                      ? JSON.stringify(patient[k])
                      : String(patient[k])}
                  </Descriptions.Item>
                );
              })}
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} style={{ marginTop: 16 }}>
          <Card title="Appointment History">
            <Table
              dataSource={appointments}
              columns={appointmentsColumns}
              rowKey="id"
              pagination={{ pageSize: 6 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
