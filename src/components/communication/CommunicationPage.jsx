import React, { useEffect, useState } from "react";
import {
  Layout,
  List,
  Input,
  Button,
  Spin,
  Typography,
  Card,
  Row,
  Col
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotesRequest,
  fetchNotesSilentRequest,
  fetchAppointmentsRequest,
  addNoteRequest
} from "../../features/communication/communicationSlice";
import { getData } from "../../api/client";

const { Sider, Content } = Layout;
const { TextArea } = Input;
const { Text, Title } = Typography;

export default function CommunicationsPage() {
  const dispatch = useDispatch();

  const { appointments = [], notesByAppointment = {}, loading, sendingNote } =
    useSelector((s) => s.communication);

  const user = useSelector((s) => s.auth.user);

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [message, setMessage] = useState("");

  const [prescription, setPrescription] = useState(null);
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);

  const [headerInfo, setHeaderInfo] = useState({
    patientName: "",
    doctorName: ""
  });

  /* ================= LOAD APPOINTMENTS ================= */
  useEffect(() => {
    if (user) {
      dispatch(fetchAppointmentsRequest(user));
    }
  }, [dispatch, user]);

  /* ================= LOAD NOTES + PRESCRIPTION ================= */
  useEffect(() => {
    if (!selectedAppointment) return;

    dispatch(fetchNotesRequest(selectedAppointment));
    fetchPrescription(selectedAppointment);

    // Poll for new messages every 3 seconds
    const interval = setInterval(() => {
      dispatch(fetchNotesSilentRequest(selectedAppointment));
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedAppointment, dispatch]);

  /* ================= FETCH PRESCRIPTION ================= */
  const fetchPrescription = async (appointmentId) => {
    try {
      setPrescriptionLoading(true);
      const data = await getData(`/prescriptions/appointment/${appointmentId}`);
      setPrescription(data || null);
    } catch {
      setPrescription(null);
    } finally {
      setPrescriptionLoading(false);
    }
  };

  /* ================= FETCH PATIENT + DOCTOR ================= */
  const fetchHeaderInfo = async (appointment) => {
    try {
      const [patient, doctor] = await Promise.all([
        getData(`/patients/${appointment.patient_id}`),
        getData(`/staff/${appointment.doctor_id}?role=doctor`)
      ]);

      setHeaderInfo({
        patientName: patient?.name || "—",
        doctorName: doctor?.name || "—"
      });
    } catch {
      setHeaderInfo({ patientName: "—", doctorName: "—" });
    }
  };

  const notes = notesByAppointment[selectedAppointment] || [];

  /* ================= SEND NOTE ================= */
  const sendNote = () => {
    if (!message.trim() || !selectedAppointment) return;

    dispatch(
      addNoteRequest({
        appointment_id: selectedAppointment,
        content: message
      })
    );
    setMessage("");
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f6fa" }}>
      {/* ================= LEFT PANEL ================= */}
      <Sider width={300} style={{ background: "#fff", padding: 12 }}>
        <Text strong>Appointments</Text>

        {loading ? (
          <Spin style={{ marginTop: 20 }} />
        ) : (
          <List
            style={{ marginTop: 12 }}
            dataSource={appointments}
            renderItem={(item) => (
              <List.Item
                style={{
                  cursor: "pointer",
                  background:
                    selectedAppointment === item.id ? "#e6f7ff" : "transparent"
                }}
                onClick={() => {
                  setSelectedAppointment(item.id);
                  fetchHeaderInfo(item);
                }}
              >
                <div>
                  <Text strong>Appointment {item.id}</Text>
                  <br />
                  <Text type="secondary">
                    {new Date(
                      item.appointment_date + " " + item.appointment_time
                    ).toLocaleString()}
                  </Text>
                </div>
              </List.Item>
            )}
          />
        )}
      </Sider>

      {/* ================= RIGHT PANEL ================= */}
      <Content style={{ padding: 20 }}>
        {!selectedAppointment ? (
          <Card>
            <Text type="secondary">
              Select an appointment to start communication
            </Text>
          </Card>
        ) : (
          <>
            {/* ===== PRESCRIPTION (WITH RIGHT CORNER INFO) ===== */}
            <Card size="small" style={{ marginBottom: 12 }}>
              <Row justify="space-between" align="middle">
                <Col>
                  <Title level={5} style={{ margin: 0 }}>
                    Prescription
                  </Title>
                </Col>

                <Col>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <Text strong>Patient:</Text> {headerInfo.patientName}
                    {" | "}
                    <Text strong>Doctor:</Text> Dr. {headerInfo.doctorName}
                  </Text>
                </Col>
              </Row>

              <div style={{ marginTop: 8 }}>
                {prescriptionLoading ? (
                  <Spin />
                ) : !prescription ? (
                  <Text type="secondary">No prescription yet</Text>
                ) : (
                  <>
                    {prescription.status && (
                      <span
                        style={{
                          padding: "2px 6px",
                          background: "#d9f7be",
                          color: "#389e0d",
                          borderRadius: 4,
                          fontSize: 12
                        }}
                      >
                        {prescription.status}
                      </span>
                    )}

                    <div style={{ marginTop: 6 }}>
                      <Text>
                        <Text strong>Medicine:</Text>{" "}
                        {prescription.medicines?.length
                          ? prescription.medicines
                            .map(
                              (m) =>
                                `${m.medicineName} (${m.dosage}, ${m.frequency}, ${m.duration})`
                            )
                            .join(", ")
                          : "—"}
                        {" | "}
                        <Text strong>Instructions:</Text>{" "}
                        {prescription.instructions || "—"}
                      </Text>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* ===== COMMUNICATION ===== */}
            <Card
              title="Communication"
              bodyStyle={{ maxHeight: "45vh", overflowY: "auto" }}
            >
              {loading ? (
                <Spin />
              ) : notes.length === 0 ? (
                <Text type="secondary">No messages yet</Text>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    style={{
                      marginBottom: 12,
                      textAlign:
                        note.senderRole === "doctor" ? "right" : "left"
                    }}
                  >
                    <Card
                      size="small"
                      style={{
                        display: "inline-block",
                        maxWidth: "70%",
                        background:
                          note.senderRole === "doctor"
                            ? "#e6f7ff"
                            : "#fafafa"
                      }}
                    >
                      <Text>{note.content}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {note.senderRole} •{" "}
                        {new Date(note.createdAt).toLocaleString()}
                      </Text>
                    </Card>
                  </div>
                ))
              )}
            </Card>

            {/* ===== ADD NOTE ===== */}
            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <TextArea
                rows={2}
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button
                type="primary"
                onClick={sendNote}
                loading={sendingNote}
                disabled={!message.trim()}
              >
                Send
              </Button>
            </div>
          </>
        )}
      </Content>
    </Layout>
  );
}
