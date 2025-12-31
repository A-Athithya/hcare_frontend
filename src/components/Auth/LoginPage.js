import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import { Lock as LockIcon, Email as EmailIcon } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { loginStart, setCsrfToken } from "../../features/auth/authSlice";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/client";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((s) => s.auth || {});

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    role: "patient",
  });

  // ✅ Pre-fetch CSRF token (LOGIC UNCHANGED)
  useEffect(() => {
    api.get("/csrf-token")
      .then(res => {
        let data = res.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (e) {
            console.error("Failed to parse CSRF response:", e);
          }
        }
        const token = data?.csrf_token || data?.csrfToken;
        if (token) dispatch(setCsrfToken(token));
      })
      .catch(err => console.error("❌ Failed to fetch CSRF token:", err));
  }, []);

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const roles = [
    { value: "admin", label: "Admin" },
    { value: "doctor", label: "Doctor" },
    { value: "nurse", label: "Nurse" },
    { value: "pharmacist", label: "Pharmacist" },
    { value: "receptionist", label: "Receptionist" },
    { value: "patient", label: "Patient" },
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(loginStart(loginForm));
  };

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
      <Grid
        container
        justifyContent="center"
        alignItems="center"
      >
        {/* CENTERED LOGIN CARD */}
        <Grid item xs={12} sm={8} md={5} lg={4}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: "#1976d2",
                    mx: "auto",
                    mb: 1.5,
                  }}
                >
                  <LockIcon fontSize="large" />
                </Avatar>

                <Typography variant="h5" fontWeight={700}>
                  Sign In
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", mt: 0.5 }}
                >
                  Access your healthcare dashboard
                </Typography>
              </Box>

              <Box
                component="form"
                onSubmit={handleLogin}
                sx={{ display: "grid", gap: 2 }}
              >
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={loginForm.role}
                    label="Role"
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, role: e.target.value })
                    }
                  >
                    {roles.map((r) => (
                      <MenuItem key={r.value} value={r.value}>
                        {r.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Email"
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, email: e.target.value })
                  }
                  InputProps={{
                    startAdornment: (
                      <EmailIcon
                        sx={{ mr: 1, color: "rgba(0,0,0,0.45)" }}
                      />
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                />

                {error && <Alert severity="error">{error}</Alert>}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    py: 1.4,
                    mt: 1,
                    fontWeight: 600,
                    borderRadius: 2,
                    background:
                      "linear-gradient(90deg,#1976d2,#1e88e5)",
                  }}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>

                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography variant="body2">
                    New user?
                  </Typography>
                  <Link to="/register" style={{ textDecoration: "none" }}>
                    <Button size="small">Create Account</Button>
                  </Link>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
