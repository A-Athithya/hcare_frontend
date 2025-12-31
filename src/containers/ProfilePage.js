import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Card, Spin, Tag, Descriptions, Alert, Button, Space } from "antd";
import { EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { fetchProfileStart } from "../features/profile/profileSlice";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(s => s.auth.user);
  const profile = useSelector(s => s.profile);

  useEffect(() => {
    if (user?.id && user?.role && user?.email) {
      dispatch(fetchProfileStart({ id: user.id, role: user.role, email: user.email }));
    }
  }, [dispatch, user]);

  if (!user) return <div style={{ padding: 40, textAlign: 'center' }}><Spin size="large" /></div>;

  const d = profile.data || {};
  const normalizedRole = (user.role || "").toLowerCase();
  const f = x => (x && x !== "null" && x !== "undefined") ? x : "—";

  return (
    <div style={{ padding: 20 }}>
      {profile.error && (
        <Alert
          message="Profile Load Error"
          description={profile.error}
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
        />
      )}
      <Card
        title="My Profile"
        extra={
          <Space>
            <Tag color="blue">{user.role?.toUpperCase()}</Tag>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate("/settings")}
            >
              Update Profile
            </Button>
          </Space>
        }
      >
        {profile.loading && (
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <Spin tip="Loading details..." />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h2 style={{ margin: 0 }}>{d.name || user.name}</h2>
            <p style={{ color: '#666' }}>{d.email || user.email}</p>
          </div>

          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Phone/Contact">
              {f(d.contact || d.phone || d.phone_number)}
            </Descriptions.Item>
            <Descriptions.Item label="Gender">
              {f(d.gender)}
            </Descriptions.Item>
            <Descriptions.Item label="Age">
              {f(d.age)}
            </Descriptions.Item>
            <Descriptions.Item label="Address">
              {f(d.address)}
            </Descriptions.Item>

            {/* Doctor/Provider Specific */}
            {(normalizedRole === 'doctor' || normalizedRole === 'provider') && (
              <>
                <Descriptions.Item label="Specialization">
                  {f(d.specialization)}
                </Descriptions.Item>
                <Descriptions.Item label="Department">
                  {f(d.department)}
                </Descriptions.Item>
                <Descriptions.Item label="Experience">
                  {f(d.experience)}
                </Descriptions.Item>
                <Descriptions.Item label="License No">
                  {f(d.license_number || d.licenseNo)}
                </Descriptions.Item>
                <Descriptions.Item label="Qualification">
                  {f(d.qualification)}
                </Descriptions.Item>
              </>
            )}

            {/* Nurse Specific */}
            {normalizedRole === 'nurse' && (
              <>
                <Descriptions.Item label="Department">
                  {f(d.department)}
                </Descriptions.Item>
                <Descriptions.Item label="Shift">
                  {f(d.shift)}
                </Descriptions.Item>
                <Descriptions.Item label="Experience">
                  {f(d.experience)}
                </Descriptions.Item>
                <Descriptions.Item label="Date Joined">
                  {f(d.date_joined || d.dateJoined)}
                </Descriptions.Item>
              </>
            )}

            {/* Pharmacist / Receptionist / Other Staff */}
            {(normalizedRole === 'pharmacist' || normalizedRole === 'receptionist') && (
              <>
                <Descriptions.Item label="Shift">
                  {f(d.shift)}
                </Descriptions.Item>
                {normalizedRole === 'pharmacist' && (
                  <Descriptions.Item label="License No">
                    {f(d.license_no || d.licenseNo)}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Experience">
                  {f(d.experience)}
                </Descriptions.Item>
              </>
            )}

            {/* Patient Specific */}
            {normalizedRole === 'patient' && (
              <>
                <Descriptions.Item label="Blood Group">
                  {f(d.blood_group || d.bloodGroup)}
                </Descriptions.Item>
                <Descriptions.Item label="Registered Date">
                  {f(d.registered_date || d.registeredDate)}
                </Descriptions.Item>
                <Descriptions.Item label="Medical History">
                  {f(d.medical_history || d.medicalHistory)}
                </Descriptions.Item>
                <Descriptions.Item label="Allergies">
                  {f(d.allergies)}
                </Descriptions.Item>
                <Descriptions.Item label="Emergency Contact">
                  {f(d.emergency_contact || d.emergencyContact)}
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        </div>
      </Card>
    </div>
  );
}
