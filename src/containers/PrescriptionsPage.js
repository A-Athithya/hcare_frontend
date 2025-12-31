import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { List, Card, Descriptions, Tag, Divider, Spin, Button, Modal, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import PrescriptionForm from "../components/Forms/PrescriptionForm";

export default function PrescriptionsPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const dispatch = useDispatch();
  const prescriptionsRaw = useSelector((s) => s.prescriptions?.list);
  const list = Array.isArray(prescriptionsRaw) ? prescriptionsRaw : [];
  const prescriptionsLoading = useSelector((s) => s.prescriptions?.loading) || false;

  const { user } = useSelector((state) => state.auth);
  const role = user?.role;

  const doctorsRaw = useSelector((s) => s.doctors?.list);
  const doctors = Array.isArray(doctorsRaw) ? doctorsRaw : [];
  const doctorsLoading = useSelector((s) => s.doctors?.loading) || false;

  const patientsRaw = useSelector((s) => s.patients?.list);
  const patients = Array.isArray(patientsRaw) ? patientsRaw : [];
  const patientsLoading = useSelector((s) => s.patients?.loading) || false;

  useEffect(() => {
    // Dispatch fetch actions for data needed (avoid direct getData)
    if (doctors.length === 0) dispatch({ type: "doctors/fetchStart" });
    if (patients.length === 0) dispatch({ type: "patients/fetchStart" });

    // Always fetch prescriptions if needed (or check list.length)
    dispatch({ type: "prescriptions/fetchStart" });
  }, [dispatch, doctors.length, patients.length]);

  const getDoctorName = (doctorId) => {
    const doc = doctors.find((d) => String(d.id) === String(doctorId));
    return doc ? doc.name : "Unknown Doctor";
  };

  const getPatientName = (patientId) => {
    const pat = patients.find((p) => String(p.id) === String(patientId));
    return pat ? pat.name : "Unknown Patient";
  };

  const isLoading = prescriptionsLoading || doctorsLoading || patientsLoading;

  return (
    <div style={{ padding: "12px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Prescriptions</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          Add Prescription
        </Button>
      </div>

      <Modal
        title="New Prescription"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <PrescriptionForm
          onSaved={() => {
            setIsModalVisible(false);
            dispatch({ type: "prescriptions/fetchStart" }); // Refresh list
          }}
          onCancel={() => setIsModalVisible(false)}
        />
      </Modal>

      <Card>
        {isLoading && <div style={{ textAlign: "center", padding: 20 }}><Spin /></div>}
        {!isLoading && (
          <List
            dataSource={list || []}
            renderItem={(prescription) => (
              <List.Item>
                <Card style={{ width: "100%" }}>
                  <Descriptions
                    title={`Prescription #${prescription.id}`}
                    bordered
                    column={2}
                  >
                    <Descriptions.Item label="Patient">
                      {getPatientName(prescription.patient_id || prescription.patientId)}
                    </Descriptions.Item>

                    <Descriptions.Item label="Doctor">
                      {getDoctorName(prescription.doctor_id || prescription.doctorId)}
                    </Descriptions.Item>

                    <Descriptions.Item label="Prescribed Date">
                      {prescription.prescription_date || prescription.prescriptionDate}
                    </Descriptions.Item>

                    <Descriptions.Item label="Status">
                      <Tag
                        color={
                          prescription.status === "Active" ? "green" :
                            prescription.status === "Dispensed" ? "blue" :
                              prescription.status === "Cancelled" ? "volcano" :
                                prescription.status === "Pending" ? "orange" :
                                  prescription.status === "Verified" ? "cyan" : "default"
                        }
                      >
                        {prescription.status}
                      </Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="Actions">
                      {/* Show Dispense button only to Admin & Pharmacist */}
                      {((role?.toLowerCase() === "pharmacist") || (role?.toLowerCase() === "admin")) && prescription.status === "Active" ? (
                        <Button
                          type="primary"
                          size="small"
                          style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                          onClick={() => {
                            dispatch({
                              type: "prescriptions/updateStart",
                              payload: {
                                id: prescription.id,
                                data: { status: "Dispensed" },
                              },
                            });
                            message.success("Prescription marked as dispensed");
                          }}
                        >
                          Mark as Dispensed
                        </Button>
                      ) : (
                        "—"
                      )}
                    </Descriptions.Item>
                  </Descriptions>

                  <Divider />

                  <h4>Prescribed Medicines</h4>

                  <List
                    dataSource={prescription.medicines || []}
                    renderItem={(med) => (
                      <List.Item>
                        <div>
                          <strong>{med.medicineName}</strong> - {med.dosage},{" "}
                          {med.frequency}, Duration: {med.duration}
                        </div>
                      </List.Item>
                    )}
                    size="small"
                  />
                </Card>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}
