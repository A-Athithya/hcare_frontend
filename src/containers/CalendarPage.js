import React, { useState, useEffect } from "react";
import {
  Calendar,
  Card,
  Select,
  Button,
  Typography,
  Badge,
  Divider,
  Tooltip,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

const { Title } = Typography;
const { Option } = Select;

const CalendarPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ✅ Use Redux selectors with safe defaults
  const appointmentsRaw = useSelector((s) => s.appointments?.list);
  const appointments = Array.isArray(appointmentsRaw) ? appointmentsRaw : [];

  const doctorsRaw = useSelector((s) => s.doctors?.list);
  const doctors = Array.isArray(doctorsRaw) ? doctorsRaw : [];

  const patientsRaw = useSelector((s) => s.patients?.list);
  const patients = Array.isArray(patientsRaw) ? patientsRaw : [];

  const [filterDoctor, setFilterDoctor] = useState("all");

  useEffect(() => {
    if (appointments.length === 0) dispatch({ type: "appointments/fetchStart" });
    if (doctors.length === 0) dispatch({ type: "doctors/fetchStart" });
    if (patients.length === 0) dispatch({ type: "patients/fetchStart" });
  }, [dispatch, appointments.length, doctors.length, patients.length]);

  const filteredAppointments =
    filterDoctor === "all"
      ? appointments
      : appointments.filter((a) => a.doctorId === parseInt(filterDoctor));

  // 🐛 Debug: Log appointments data
  useEffect(() => {
    console.log('📅 CalendarPage - appointments:', appointments);
    console.log('📅 CalendarPage - filtered appointments:', filteredAppointments);
    console.log('📅 CalendarPage - doctors:', doctors);
    console.log('📅 CalendarPage - patients:', patients);
  }, [appointments, filteredAppointments, doctors, patients]);



  const getListData = (value) => {
    const dateStr = value.format("YYYY-MM-DD");
    return filteredAppointments.filter((a) => a.appointmentDate === dateStr);
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);

    return (
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {listData.map((item) => (
          <Tooltip
            key={item.id}
            title={
              <div>
                <strong>{item.patientName}</strong> <br />
                Time: {item.appointmentTime} <br />
                Doctor: {doctors.find(d => d.id === item.doctorId)?.name || 'Unknown'} <br />
                Reason: {item.reason} <br />
                Status: {item.status}
              </div>
            }
          >
            <li
              style={{
                marginBottom: 4,
                padding: "2px 6px",
                background: "#f7f7f7",
                borderRadius: 6,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Badge
                status={
                  item.status === "Completed"
                    ? "success"
                    : item.status === "Pending"
                      ? "warning"
                      : "error"
                }
              />
              <span style={{ fontSize: 12, marginLeft: 6, color: "#444" }}>
                {patients.find(p => p.id === item.patientId)?.name || item.patientName || 'Unknown'} — {item.appointmentTime}
              </span>
            </li>
          </Tooltip>
        ))}
      </ul>
    );
  };

  const handleAddAppointment = () => {
    navigate("/appointments?create=true");
  };

  return (
    <div style={{ padding: "0px 24px 10px", background: "#fafbfc", minHeight: "85vh" }}>

      {/* HEADER ROW */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,   // 🔥 reduced spacing
        }}
      >
        <Title level={2} style={{ margin: 0, color: "#202124" }}>
          Appointment Calendar
        </Title>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div>
            <span style={{ marginRight: 8, fontWeight: 500 }}>
              Filter by Doctor:
            </span>
            <Select
              value={filterDoctor}
              onChange={setFilterDoctor}
              style={{ width: 200 }}
            >
              <Option value="all">All Doctors</Option>
              {doctors.map((d) => (
                <Option key={d.id} value={d.id}>
                  {d.name}
                </Option>
              ))}
            </Select>
          </div>

          <Button type="primary" onClick={handleAddAppointment}>
            + Add Appointment
          </Button>
        </div>
      </div>

      <Divider style={{ margin: "10px 0" }} />  {/* ✅ reduced gap */}

      <Card
        style={{
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        <Calendar dateCellRender={dateCellRender} style={{ borderRadius: 12 }} />
      </Card>
    </div>
  );
};

export default CalendarPage;
