// src/containers/DoctorsPage.js
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Avatar,
  Typography,
  Button,
  Rating,
  Collapse,
  Paper,
  Box,
  Divider,
} from "@mui/material";
import { Drawer, Form, Select, DatePicker, TimePicker, Input, List, message, Spin } from "antd";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const { TextArea } = Input;

// TAG CHIP UI COMPONENT
const TagChip = ({ label, color = "#e3f2fd" }) => (
  <Box
    sx={{
      display: "inline-block",
      px: 1.2,
      py: 0.4,
      fontSize: "11.5px",
      borderRadius: "8px",
      background: color,
      color: "#0d47a1",
      fontWeight: 500,
      mr: 1,
      mb: 1,
    }}
  >
    {label}
  </Box>
);

export default function DoctorsPage() {
  const dispatch = useDispatch();

  // ✅ Use safe defaults
  const doctorsRaw = useSelector((s) => s.doctors?.list);
  const doctors = Array.isArray(doctorsRaw) ? doctorsRaw : [];
  const doctorsLoading = useSelector((s) => s.doctors?.loading) || false;

  const appointmentsRaw = useSelector((s) => s.appointments?.list);
  const appointments = Array.isArray(appointmentsRaw) ? appointmentsRaw : [];
  const appointmentsLoading = useSelector((s) => s.appointments?.loading) || false;

  const patientsRaw = useSelector((s) => s.patients?.list);
  const patients = Array.isArray(patientsRaw) ? patientsRaw : [];
  const patientsLoading = useSelector((s) => s.patients?.loading) || false;

  const loading = doctorsLoading || appointmentsLoading || patientsLoading;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [form] = Form.useForm();
  const [expandedDoctor, setExpandedDoctor] = useState(null);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState(null);

  useEffect(() => {
    if (doctors.length === 0) dispatch({ type: "doctors/fetchStart" });
    if (patients.length === 0) dispatch({ type: "patients/fetchStart" });
    dispatch({ type: "appointments/fetchStart" });
  }, [dispatch, doctors.length, patients.length]);

  const openBooking = (doc) => {
    setSelectedDoctor(doc);
    setDrawerOpen(true);
    form.resetFields();
  };

  const submitBooking = (vals) => {
    const payload = {
      patientId: vals.patientId,
      doctorId: selectedDoctor.id,
      appointmentDate: vals.date.format("YYYY-MM-DD"),
      appointmentTime: vals.time.format("hh:mm A"),
      reason: vals.reason,
      remarks: vals.remarks || "",
      status: "Pending",
      paymentStatus: "Pending",
    };

    dispatch({ type: "appointments/createStart", payload });
    message.success("Appointment booking request sent");
    setDrawerOpen(false);
  };

  const updateStatus = (appt, status) => {
    dispatch({
      type: "appointments/updateStatus",
      payload: { appointment: appt, status },
    });
    message.info(`Updating status to ${status}...`);
    setTimeout(() => dispatch({ type: "appointments/fetchStart" }), 1000);
  };

  const getPatientName = (id) =>
    patients.find((p) => String(p.id) === String(id))?.name || "Unknown";

  const pendingForDoctor = (docId) =>
    appointments.filter((a) => {
      const dId = a.doctor_id || a.doctorId;
      return String(dId) === String(docId) && a.status === "Pending";
    });

  if (loading && doctors.length === 0)
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <Spin size="large" />
        <Typography sx={{ mt: 2 }}>Loading Data...</Typography>
      </div>
    );

  return (
    <Box sx={{ padding: 0, pt: 1, background: "#fafbfc", minHeight: "100vh" }}>
      {/* TITLE + FILTER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ m: 0 }}>
          Doctors Directory
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Input
            placeholder="Search doctor..."
            style={{ width: 240 }}
            onChange={(e) => setSearch(e.target.value.toLowerCase())}
          />

          <Select
            placeholder="Filter by Department"
            allowClear
            style={{ width: 200 }}
            onChange={(v) => setDeptFilter(v)}
          >
            {[...new Set(doctors.map((d) => d.department))].map((dep) => (
              <Select.Option key={dep} value={dep}>
                {dep}
              </Select.Option>
            ))}
          </Select>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {Array.isArray(doctors)
          ? doctors
            .filter((d) =>
              search
                ? d.name.toLowerCase().includes(search) ||
                d.specialization.toLowerCase().includes(search)
                : true
            )
            .filter((d) => (deptFilter ? d.department === deptFilter : true))
            .map((doc) => (
              <Grid item xs={12} sm={6} md={4} key={doc.id} display="flex">
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <CardHeader
                      avatar={
                        <Avatar
                          sx={{ width: 54, height: 54 }}
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                            doc.name
                          )}`}
                        />
                      }
                      title={
                        <>
                          <Typography variant="h6">{doc.name}</Typography>

                          <Box sx={{ mt: 1 }}>
                            {doc.specialization && (
                              <TagChip label={doc.specialization} color="#e8f5e9" />
                            )}
                            {doc.department && (
                              <TagChip label={doc.department} color="#e3f2fd" />
                            )}
                            {doc.experience && (
                              <TagChip
                                label={`${parseInt(doc.experience)} yrs`}
                                color="#fff3e0"
                              />
                            )}
                          </Box>
                        </>
                      }
                    />

                    <CardContent sx={{ px: 2, pb: 1 }}>
                      <Box display="flex" gap={1} alignItems="center">
                        <LocalHospitalIcon fontSize="small" />
                        <Typography fontSize={14}>{doc.experience}</Typography>
                      </Box>

                      <Box mt={1} display="flex" gap={1} alignItems="center">
                        <AccessTimeIcon fontSize="small" />
                        <Typography fontSize={13}>
                          {doc.available_days || "N/A"} ({doc.available_time || "N/A"})
                        </Typography>
                      </Box>

                      <Rating
                        value={doc.rating}
                        precision={0.1}
                        readOnly
                        size="small"
                        sx={{ mt: 1 }}
                      />

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 1,
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {doc.bio}
                      </Typography>
                    </CardContent>
                  </Box>

                  <Divider sx={{ m: 0 }} />

                  <CardActions
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      px: 2,
                      py: 1,
                    }}
                  >
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => openBooking(doc)}
                    >
                      Book
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        setExpandedDoctor(expandedDoctor === doc.id ? null : doc.id)
                      }
                    >
                      {expandedDoctor === doc.id ? "Hide Requests" : "View Requests (Admin)"}
                    </Button>
                  </CardActions>

                  <Collapse in={expandedDoctor === doc.id}>
                    <Paper sx={{ p: 2, bgcolor: "#fafafa" }}>
                      {pendingForDoctor(doc.id).length === 0 ? (
                        <Typography>No pending requests</Typography>
                      ) : (
                        <List
                          dataSource={pendingForDoctor(doc.id)}
                          renderItem={(appt) => (
                            <List.Item
                              actions={[
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  onClick={() => updateStatus(appt, "Accepted")}
                                >
                                  Accept
                                </Button>,
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="error"
                                  onClick={() => updateStatus(appt, "Rejected")}
                                >
                                  Reject
                                </Button>,
                              ]}
                            >
                              <List.Item.Meta
                                title={getPatientName(appt.patient_id || appt.patientId)}
                                description={`${appt.appointment_date || appt.appointmentDate} • ${appt.appointment_time || appt.appointmentTime}`}
                              />
                            </List.Item>
                          )}
                        />
                      )}
                    </Paper>
                  </Collapse>
                </Card>
              </Grid>
            ))
          : null}
      </Grid>

      <Drawer
        title={`Book Appointment - Dr. ${selectedDoctor?.name || ""}`}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={480}
        destroyOnClose
        styles={{ body: { padding: "20px" } }}
      >
        <Form layout="vertical" form={form} onFinish={submitBooking}>
          <Form.Item
            name="patientId"
            label="Select Patient"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select patient">
              {patients.map((p) => (
                <Select.Option key={p.id} value={p.id}>
                  {p.name} • Age {p.age}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Doctor">
            <Input value={selectedDoctor?.name} disabled />
          </Form.Item>

          <div style={{ display: "flex", gap: 12 }}>
            <Form.Item
              name="date"
              label="Appointment Date"
              rules={[{ required: true }]}
              style={{ flex: 1 }}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="time"
              label="Appointment Time"
              rules={[{ required: true }]}
              style={{ flex: 1 }}
            >
              <TimePicker use12Hours format="hh:mm A" style={{ width: "100%" }} />
            </Form.Item>
          </div>

          <Form.Item
            name="reason"
            label="Reason for Visit"
            rules={[{ required: true }]}
          >
            <TextArea rows={3} placeholder="Describe issue" />
          </Form.Item>

          <Form.Item name="remarks" label="Additional Notes">
            <TextArea rows={3} placeholder="Optional notes" />
          </Form.Item>

          <Button
            type="primary"
            block
            size="large"
            loading={appointmentsLoading}
            onClick={() => form.submit()}
          >
            Book Appointment
          </Button>
        </Form>
      </Drawer>
    </Box>
  );
}
