/* src/containers/Dashboard.js
   Updated: resolve patient names in recent activity + auto-refresh
*/

import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Grid,
  Card,
  Typography,
  Box,
  Avatar,
  Chip,
  LinearProgress,
  CircularProgress,
  TextField,
  Button,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import DashboardCharts from "./DashboardCharts";
import dayjs from "dayjs";
import { fetchDashboardData } from "../features/dashboard/dashboardSlice";

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});
  const role = user?.role;

  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    appointments: 0,
    medicines: 0,
  });

  const [recentPatients, setRecentPatients] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);

  const [startDate, setStartDate] = useState(dayjs().subtract(7, "day"));
  const [endDate, setEndDate] = useState(dayjs());
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);

  const [loading, setLoading] = useState(true);

  // polling ref so we can clean up
  const pollRef = useRef(null);

  // central loader (fetches patients, doctors, appointments, medicines, invoices)
  const loadStats = () => {
    dispatch(fetchDashboardData());
  };

  const { stats: dashboardStats, loading: dashboardLoading } = useSelector((s) => s.dashboard);

  // Poll for data
  useEffect(() => {
    loadStats();
    pollRef.current = setInterval(loadStats, 50000);
    return () => clearInterval(pollRef.current);
  }, [dispatch, role]);

  // Derived state from dashboardStats
  useEffect(() => {
    if (!dashboardStats) return;

    let { patients, doctors, appointments, medicines, invoices } = dashboardStats || {};

    if (!Array.isArray(patients)) patients = [];
    if (!Array.isArray(doctors)) doctors = [];
    if (!Array.isArray(appointments)) appointments = [];
    if (!Array.isArray(medicines)) medicines = [];
    if (!Array.isArray(invoices)) invoices = [];

    // Role based filtering (re-implementing logic from original loadStats)
    if (role === "doctor") {
      // Use clinic totals for doctors, backend already filters appointments/invoices
    } else if (role === "patient") {
      patients = [user];
      // appointments and invoices are already filtered by the backend for this patient
    }

    setStats({
      patients: patients.length,
      doctors: doctors.length,
      appointments: appointments.length,
      medicines: medicines.length,
      medicinesList: medicines // Add this so we can access it
    });

    // Recent Patients
    const recentP = [...patients].sort((a, b) => new Date(b.registered_date || b.registeredDate || b.created_at || 0) - new Date(a.registered_date || a.registeredDate || a.created_at || 0)).slice(0, 3);
    setRecentPatients(recentP);

    // Recent Appointments
    const mappedAppts = (appointments || []).map((a) => {
      const patient = patients.find((p) => String(p.id) === String(a.patient_id || a.patientId)) || null;
      return { ...a, patientName: patient?.name || a.patient_name || null };
    });
    const sortedAppts = mappedAppts.sort((a, b) => new Date(b.appointment_date || b.appointmentDate) - new Date(a.appointment_date || a.appointmentDate));
    setRecentAppointments(sortedAppts.slice(0, 3));

    // Filtered lists
    setFilteredAppointments((appointments || []).filter((a) => {
      const d = dayjs(a.appointment_date || a.appointmentDate);
      return d.isAfter(startDate.subtract(1, 'day')) && d.isBefore(endDate.add(1, "day"));
    }));

    setFilteredInvoices((invoices || []).filter((invoice) => {
      const d = dayjs(invoice.invoice_date || invoice.invoiceDate);
      return d.isAfter(startDate.subtract(1, 'day')) && d.isBefore(endDate.add(1, "day"));
    }));

    setLoading(false);

  }, [dashboardStats, role, user, startDate, endDate]);

  if (dashboardLoading && !dashboardStats) {
    // ... loading spinner
  }

  // Removed duplicate useEffects

  if (dashboardLoading && !dashboardStats) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const totalRevenue = filteredInvoices.reduce(
    (sum, invoice) => sum + (Number(invoice.paid_amount || invoice.paidAmount) || 0),
    0
  );

  // stat cards by role (same as before)
  const getStatCards = () => {
    if (role === "doctor") {
      return [
        { title: "Total Patients", value: stats.patients, route: "/patients" },
        { title: "My Appointments", value: stats.appointments, route: "/appointments" },
      ];
    } else if (role === "patient") {
      return [
        { title: "My Appointments", value: stats.appointments, route: "/appointments" },
        { title: "My Bills", value: `₹${totalRevenue}`, route: "/billing" },
      ];
    } else if (role === "pharmacist") {
      return [
        { title: "Total Patients", value: stats.patients, route: "/patients" },
        { title: "Active Doctors", value: stats.doctors, route: "/doctors" },
        { title: "Today's Appointments", value: stats.appointments, route: "/appointments" },
        { title: "Medicines in Stock", value: stats.medicines, route: "/inventory" },
      ];
    } else if (role === "nurse") {
      return [
        { title: "Total Patients", value: stats.patients, route: "/patients" },
        { title: "Active Doctors", value: stats.doctors, route: "/doctors" },
        { title: "Today's Appointments", value: stats.appointments, route: "/appointments" },
      ];
    } else if (role === "receptionist") {
      return [
        { title: "Total Patients", value: stats.patients, route: "/patients" },
        { title: "Active Doctors", value: stats.doctors, route: "/doctors" },
        { title: "Today's Appointments", value: stats.appointments, route: "/appointments" },
      ];
    } else {
      // Admin
      return [
        { title: "Total Patients", value: stats.patients, route: "/patients" },
        { title: "Active Doctors", value: stats.doctors, route: "/doctors" },
        { title: "Today's Appointments", value: stats.appointments, route: "/appointments" },
        { title: "Medicines in Stock", value: stats.medicines, route: "/inventory" },
        { title: "Total Revenue", value: `₹${totalRevenue}`, route: "/billing" },
      ];
    }
  };

  const statCards = getStatCards();

  const DefaultIcon = () => (
    <Avatar
      sx={{
        bgcolor: "#1976d2",
        width: 55,
        height: 55,
        margin: "0 auto",
        boxShadow: "0 4px 10px rgba(25,118,210,0.4)",
      }}
    >
      <PersonIcon sx={{ fontSize: 30, color: "white" }} />
    </Avatar>
  );

  return (
    <Box sx={{ minHeight: "50vh", background: "#f3f6fb", p: { xs: 3, md: 5 }, maxWidth: 1400, mx: "auto" }}>
      {/* FILTER SECTION */}
      <Box sx={{ display: "flex", gap: 3, justifyContent: "flex-end", mb: 3 }}>
        <TextField
          type="date"
          size="small"
          label="Start Date"
          InputLabelProps={{ shrink: true }}
          value={startDate.format("YYYY-MM-DD")}
          onChange={(e) => setStartDate(dayjs(e.target.value))}
        />

        <TextField
          type="date"
          size="small"
          label="End Date"
          InputLabelProps={{ shrink: true }}
          value={endDate.format("YYYY-MM-DD")}
          onChange={(e) => setEndDate(dayjs(e.target.value))}
        />

        <Button
          variant="contained"
          size="small"
          onClick={() => {
            setStartDate(dayjs().subtract(7, "day"));
            setEndDate(dayjs());
          }}
        >
          Reset
        </Button>
      </Box>

      {/* STAT CARDS */}
      <Grid container spacing={3} justifyContent="center">
        {statCards.map((card, i) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={i}>
            <Card
              sx={{
                borderRadius: 4,
                minHeight: 230,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "white",
                boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
                cursor: "pointer",
                transition: "0.25s",
                "&:hover": { transform: "translateY(-5px)", boxShadow: "0 12px 25px rgba(0,0,0,0.15)" },
              }}
              onClick={() => navigate(card.route)}
            >
              <DefaultIcon />
              <Typography variant="h5" sx={{ mt: 2, fontWeight: 700, color: "#1e2a4a" }}>{card.value}</Typography>
              <Typography sx={{ opacity: 0.7, fontSize: 14 }}>{card.title}</Typography>
              <LinearProgress
                variant="determinate"
                value={70}
                sx={{
                  mt: 2,
                  width: "85%",
                  height: 6,
                  borderRadius: 3,
                  "& .MuiLinearProgress-bar": { bgcolor: "#1976d2" },
                }}
              />
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* RECENT ACTIVITY + NEW PATIENTS */}
      <Grid container spacing={4} sx={{ mt: 4 }}>
        {/* RECENT ACTIVITY */}
        <Grid item xs={12} lg={7}>
          <Card sx={{ borderRadius: 4, p: 3, background: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Recent Activity
            </Typography>

            {recentAppointments.length === 0 ? (
              <Typography sx={{ color: "gray" }}>No recent appointments</Typography>
            ) : (
              recentAppointments.map((a, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 2,
                    mb: 2,
                    borderRadius: 3,
                    background: "#f7f9fc",
                    border: "1px solid #e8ecf3",
                  }}
                >
                  <Avatar sx={{ bgcolor: "#1976d2", width: 45, height: 45, mr: 2 }}>
                    <PersonIcon sx={{ color: "white" }} />
                  </Avatar>

                  <Box sx={{ flex: 1 }}>
                    {/* patientName resolved earlier; fallback to Unknown Patient */}
                    <Typography sx={{ fontWeight: 600 }}>{a.patientName || "Unknown Patient"}</Typography>
                    <Typography sx={{ fontSize: 13, opacity: 0.7 }}>
                      {a.appointmentDate || "-"} • {a.appointmentTime || "-"}
                    </Typography>
                  </Box>

                  <Chip
                    label={a.status || "Pending"}
                    size="small"
                    sx={{
                      bgcolor:
                        a.status === "Completed"
                          ? "#4caf50"
                          : a.status === "Cancelled"
                            ? "#d32f2f"
                            : "#ed6c02",
                      color: "white",
                      fontWeight: 600,
                    }}
                  />
                </Box>
              ))
            )}
          </Card>
        </Grid>

        {/* NEW PATIENTS */}
        <Grid item xs={12} lg={5}>
          <Card sx={{ borderRadius: 4, p: 3, background: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              {role === 'doctor' ? 'My Patients' : role === 'patient' ? 'My Profile' : 'New Patients'}
            </Typography>

            {recentPatients.length === 0 ? (
              <Typography sx={{ color: "gray" }}>
                {role === 'doctor' ? 'No patients assigned' : role === 'patient' ? 'Profile information' : 'No recent patients'}
              </Typography>
            ) : (
              recentPatients.map((p, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 2,
                    mb: 2,
                    borderRadius: 3,
                    background: "#f7f9fc",
                    border: "1px solid #e8ecf3",
                  }}
                >
                  <Avatar sx={{ bgcolor: "#1976d2", width: 45, height: 45, mr: 2 }}>
                    <PersonIcon sx={{ color: "white" }} />
                  </Avatar>

                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 600 }}>{p.name || "Unnamed"}</Typography>
                    <Typography sx={{ opacity: 0.7 }}>
                      {role === 'patient' ? `ID: ${p.id}` : p.registeredDate || "-"}
                    </Typography>
                  </Box>
                </Box>
              ))
            )}
          </Card>
        </Grid>
      </Grid>

      {/* CHARTS */}
      <Box sx={{ mt: 6 }}>
        <DashboardCharts
          startDate={dayjs(startDate).format("YYYY-MM-DD")}
          endDate={dayjs(endDate).format("YYYY-MM-DD")}
          appointments={filteredAppointments} // Use filtered appointments for charts
          medicines={stats.medicinesList || []} // We need raw list for stock, let's grab it from dashboardStats
          invoices={filteredInvoices}
          role={role}
        />
      </Box>
    </Box>
  );
};

export default Dashboard;
