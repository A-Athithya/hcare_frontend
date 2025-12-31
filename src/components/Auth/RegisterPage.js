import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Divider,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { useDispatch } from "react-redux";
import { setCsrfToken } from "../../features/auth/authSlice";
import api, { postData } from "../../api/client";
import dayjs from "dayjs";

export default function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 🔒 ROLE FIXED AS PATIENT (LOGIC UNCHANGED)
  const [role] = useState("patient");

  const [submitting, setSubmitting] = useState(false);
  const submitLock = useRef(false);

  // ✅ Pre-fetch CSRF token (LOGIC UNCHANGED)
  useEffect(() => {
    api.get("/csrf-token")
      .then(res => {
        const token = res.data.csrfToken || res.data.csrf_token;
        if (token) dispatch(setCsrfToken(token));
      })
      .catch(() => {});
  }, []);

  const [form, setForm] = useState({
    name: "",
    gender: "Male",
    age: "",
    contact: "",
    email: "",
    password: "",
    address: "",
    bloodGroup: "",
    registeredDate: dayjs().format("YYYY-MM-DD"),
    medicalHistory: "",
    allergies: "",
    emergencyContact: "",
    status: "Active",
  });

  const handleField = (k) => (e) =>
    setForm((s) => ({ ...s, [k]: e.target.value }));

  const validateBasic = () => {
    if (!form.name) return message.warning("Name required");
    if (!form.email) return message.warning("Email required");
    if (!form.password) return message.warning("Password required");
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitLock.current) return;
    submitLock.current = true;

    if (!validateBasic()) {
      submitLock.current = false;
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: form.name,
        age: Number(form.age) || "",
        gender: form.gender,
        contact: form.contact,
        email: form.email,
        password: form.password,
        role: "patient",
        address: form.address,
        bloodGroup: form.bloodGroup,
        registeredDate: form.registeredDate,
        medicalHistory: form.medicalHistory,
        allergies: form.allergies,
        emergencyContact: form.emergencyContact,
        status: "Active",
      };

      await postData("/register", payload);

      message.success("Registered successfully! Please login.");
      navigate("/login");

    } catch (err) {
      message.error("Registration failed!");
    } finally {
      setSubmitting(false);
      submitLock.current = false;
    }
  };

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#F6FAFF,#EEF2FF)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 950,
          borderRadius: 3,
          boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          {/* HEADER */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <IconButton onClick={() => navigate("/login")}>
              <ArrowBack />
            </IconButton>
            <Box sx={{ ml: 1 }}>
              <Typography variant="h5" fontWeight={700}>
                Patient Registration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your patient account to access healthcare services
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* FORM */}
          <Box component="form" onSubmit={onSubmit}>
            <Grid container spacing={2}>
              {[
                ["Full Name", "name"],
                ["Email", "email"],
                ["Password", "password", "password"],
                ["Contact", "contact"],
                ["Address", "address"],
                ["Age", "age", "number"],
              ].map(([label, key, type]) => (
                <Grid item xs={12} sm={6} md={4} key={key}>
                  <TextField
                    label={label}
                    type={type || "text"}
                    fullWidth
                    required={["name", "email", "password"].includes(key)}
                    value={form[key]}
                    onChange={handleField(key)}
                  />
                </Grid>
              ))}

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Gender"
                  fullWidth
                  value={form.gender}
                  onChange={handleField("gender")}
                />
              </Grid>

              {[
                ["Blood Group", "bloodGroup"],
                ["Registered Date", "registeredDate"],
                ["Medical History", "medicalHistory"],
                ["Allergies", "allergies"],
                ["Emergency Contact", "emergencyContact"],
              ].map(([label, key]) => (
                <Grid item xs={12} sm={6} md={4} key={key}>
                  <TextField
                    label={label}
                    fullWidth
                    value={form[key]}
                    onChange={handleField(key)}
                  />
                </Grid>
              ))}

              {/* ACTIONS */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/login")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting}
                    sx={{ px: 4 }}
                  >
                    {submitting ? "Registering..." : "Register"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
