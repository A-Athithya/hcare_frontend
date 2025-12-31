import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Button,
  Box,
  Typography,
  Divider,
  Paper,
  Popper,
  ClickAwayListener,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircle from "@mui/icons-material/AccountCircle";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import { getData, postData } from "../../api/client";
import { logout } from "../../features/auth/authSlice";

export default function Navbar() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);

  // ================= FETCH NOTIFICATIONS =================
 useEffect(() => {
  if (!user) return;

  let intervalId;

  const fetchNotifications = async () => {
    try {
      const raw = await getData("/notifications");

      const list = Array.isArray(raw)
        ? raw.map((n) => ({
            id: n.id,
            message: n.message,
            timestamp: n.created_at,
            redirect: n.redirect || null,
          }))
        : [];

      setNotifications(
        list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      );
    } catch (err) {
      console.error("Fetch notifications failed", err);
    }
  };

  // 🔹 initial load
  fetchNotifications();

  // 🔁 poll every 5 seconds
  intervalId = setInterval(fetchNotifications, 5000);

  // 🔴 cleanup (important)
  return () => clearInterval(intervalId);
}, [user]);


  // ================= MARK AS READ =================
  const handleNotificationClick = (notif) => async () => {
    try {
      // ✅ BACKEND EXPECTS POST (NOT PUT)
      await postData(`/notifications/read/${notif.id}`);

      // ✅ UI instant update
      setNotifications((prev) =>
        prev.filter((n) => n.id !== notif.id)
      );

      // ✅ redirect if exists
      if (notif.redirect) {
        navigate(notif.redirect);
      }
    } catch (err) {
      
    } finally {
      setNotifAnchorEl(null);
    }
  };

  const handleNotifOpen = (e) => setNotifAnchorEl(e.currentTarget);
  const handleNotifClose = () => setNotifAnchorEl(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          background: "linear-gradient(90deg,#1e88e5,#3949ab)",
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            minHeight: 72,
            px: 2,
          }}
        >
          {/* LEFT */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <img
              src="/logo192.png"
              alt="logo"
              width={38}
              height={38}
              style={{ borderRadius: "50%" }}
            />
            <Link
              to="/dashboard"
              style={{
                color: "white",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              HealthTool
            </Link>
          </Box>

          {/* CENTER */}
          <Box sx={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
            <Button
              variant="contained"
              startIcon={<CalendarMonthIcon />}
              onClick={() => navigate("/appointments?create=true")}
              sx={{
                textTransform: "none",
                fontSize: 15,
                px: 3,
                py: 1.2,
                borderRadius: 5,
                background: "linear-gradient(90deg,#42a5f5,#1e88e5)",
                "&:hover": {
                  background: "linear-gradient(90deg,#64b5f6,#2196f3)",
                },
              }}
            >
              Book Appointment
            </Button>
          </Box>

          {/* RIGHT */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton color="inherit" onClick={() => navigate("/patient/add")}>
              <PersonAddAlt1Icon />
            </IconButton>

            <IconButton color="inherit" onClick={handleNotifOpen}>
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <Popper
              open={Boolean(notifAnchorEl)}
              anchorEl={notifAnchorEl}
              placement="bottom-end"
              sx={{ zIndex: 1301 }}
            >
              <ClickAwayListener onClickAway={handleNotifClose}>
                <Paper sx={{ width: 360, maxHeight: 400, overflowY: "auto", borderRadius: 2 }}>
                  <Typography sx={{ px: 2, py: 1, fontWeight: "bold" }}>
                    Notifications
                  </Typography>
                  <Divider />

                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <Box
                        key={n.id}
                        sx={{
                          p: 1.5,
                          borderBottom: "1px solid #eee",
                          cursor: "pointer",
                        }}
                        onClick={handleNotificationClick(n)}
                      >
                        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                          {n.message}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "gray" }}>
                          {new Date(n.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Box sx={{ p: 2, textAlign: "center", color: "gray" }}>
                      No notifications
                    </Box>
                  )}
                </Paper>
              </ClickAwayListener>
            </Popper>

            {user && (
              <div className="dropdown">
                <Button
                  variant="contained"
                  startIcon={<AccountCircle />}
                  sx={{
                    textTransform: "none",
                    borderRadius: 3,
                    bgcolor: "#fff",
                    color: "#1976d2",
                    "&:hover": { bgcolor: "#f0f0f0" },
                  }}
                >
                  {user.name}
                </Button>
                <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/appointments">
                      Appointments
                    </Link>
                  </li>
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ mt: "75px" }} />
    </>
  );
}