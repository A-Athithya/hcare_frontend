// src/containers/DashboardCharts.js
import React, { useEffect, useMemo } from "react";
import { Card, Typography, Box, CircularProgress, Grid } from "@mui/material";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";

// Tooltip UI
const RichTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <Box sx={{ background: "#fff", p: 1.5, borderRadius: 2, boxShadow: "0 6px 18px rgba(0,0,0,0.18)" }}>
      <Typography sx={{ fontWeight: 700, mb: 1 }}>{label}</Typography>
      {payload.map((p, i) => (
        <Typography key={i} sx={{ color: p.color, fontSize: 13 }}>
          {p.name}: {p.value}
        </Typography>
      ))}
    </Box>
  );
};

const COLORS = ["#4982c9ff", "#4caf82", "#f2a65a", "#e36464", "#9aa5b1"];

export default function DashboardCharts({ startDate, endDate, appointments = [], medicines = [], invoices = [], role }) {

  const start = dayjs(startDate);
  const end = dayjs(endDate);

  const canSeeStock = role === 'admin' || role === 'pharmacist';

  // Revenue Line Data
  const revenueData = useMemo(() => {
    const map = new Map();
    let d = start.clone();
    while (d.isBefore(end) || d.isSame(end)) {
      map.set(d.format("YYYY-MM-DD"), 0);
      d = d.add(1, "day");
    }

    appointments.forEach((a) => {
      const dt = dayjs(a.appointment_date || a.appointmentDate).format("YYYY-MM-DD");
      if (map.has(dt)) map.set(dt, map.get(dt) + Number(a.payment_amount || a.paymentAmount || 0));
    });

    return Array.from(map.entries()).map(([date, revenue]) => ({ date, revenue }));
  }, [appointments, start, end]);

  // Appointment Status
  const apptStatusData = useMemo(() => {
    const status = { Pending: 0, Completed: 0, Cancelled: 0, Other: 0 };
    appointments.forEach((a) => {
      const st = (a.status || "").toLowerCase();
      if (st.includes("pending")) status.Pending++;
      else if (st.includes("completed")) status.Completed++;
      else if (st.includes("cancel")) status.Cancelled++;
      else status.Other++;
    });
    return Object.keys(status).map((k) => ({ name: k, value: status[k] }));
  }, [appointments]);

  const stockData = medicines.map((m) => ({
    name: m.medicine_name || m.medicineName || "Unknown",
    stock: Number(m.stock || 0),
  }));

  const canSeeRevenue = role === 'admin' || role === 'receptionist' || role === 'provider'; // Excluding 'doctor' as per request

  const emptyBlock = (t) => <Typography sx={{ textAlign: "center", py: 4, opacity: 0.6 }}>{t}</Typography>;

  return (
    <Box sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        {/* Revenue Line Chart */}
        {canSeeRevenue && (
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, borderRadius: 3, boxShadow: "0 6px 20px rgba(0,0,0,0.10)" }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Revenue Trend
              </Typography>
              {!revenueData.length ? emptyBlock("No revenue data available") : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<RichTooltip />} />
                    <Line type="monotone" dataKey="revenue" stroke="#3f72af" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>
          </Grid>
        )}

        {/* Appointment Status Pie */}
        <Grid item xs={12} md={canSeeRevenue ? 6 : 12}>
          <Card sx={{ p: 2, borderRadius: 3, boxShadow: "0 6px 20px rgba(0,0,0,0.10)" }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Appointment Status
            </Typography>
            {!apptStatusData.length ? emptyBlock("No appointment data available") : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={apptStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {apptStatusData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<RichTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Grid>

        {/* Medical Stock Overview */}
        {canSeeStock && (
          <Grid item xs={12}>
            <Card sx={{ p: 2, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Medical Stock Overview</Typography>
              {!stockData.length ? (
                <Box sx={{ py: 6, textAlign: "center", color: "gray" }}>No inventory data found.</Box>
              ) : (
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={stockData} margin={{ left: 0, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f6fb" />
                    <XAxis dataKey="name" tick={false} axisLine={false} />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name, props) => [`${value} units`, props.payload.name || "Unknown"]}
                      labelFormatter={() => ""}
                      contentStyle={{ borderRadius: 10, boxShadow: "0 0 12px rgba(0,0,0,0.1)" }}
                    />
                    <Bar dataKey="stock" fill="#4f86c6" radius={[8, 8, 0, 0]} animationDuration={700} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
