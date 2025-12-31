// src/features/appointments/appointmentsSaga.js
import { call, put, takeLatest } from "redux-saga/effects";
import { getData, putData, postData } from "../../api/client";

// Fetch appointments
function* fetchAppointments() {
  try {
    const data = yield call(getData, "/appointments");
    yield put({ type: "appointments/fetchSuccess", payload: data });
  } catch (e) {
    yield put({ type: "appointments/fetchFailure", payload: e.message });
  }
}

// Create Appointment
function* createAppointment(action) {
  try {
    const data = yield call(postData, "/appointments", action.payload);
    yield put({ type: "appointments/createSuccess", payload: { ...action.payload, id: data.id } });
    // Refresh list to get joined names (patient_name, doctor_name)
    yield put({ type: "appointments/fetchStart" });
  } catch (e) {
    yield put({ type: "appointments/createFailure", payload: e.message });
  }
}

// ✅ Update status + create billing when completed
function* updateAppointmentStatus(action) {
  try {
    const { appointment, status } = action.payload;

    const updatedAppointment = {
      ...appointment,
      status,
    };

    yield call(putData, `/appointments/${appointment.id}`, updatedAppointment);

    yield put({
      type: "appointments/updateSuccess",
      payload: updatedAppointment,
    });

    // Refresh list to update any backend calculations or just to be in sync
    yield put({ type: "appointments/fetchStart" });

    // ✅ If Completed → Create Billing Entry
    if (status === "Completed") {
      const billingPayload = {
        patientId: appointment.patientId || appointment.patient_id,
        doctorId: appointment.doctorId || appointment.doctor_id,
        appointmentId: appointment.id,
        amount: appointment.consultationFee || 500,
        status: "Unpaid",
        date: new Date().toISOString().split("T")[0],
      };

      yield put({
        type: "billing/createStart",
        payload: billingPayload,
      });
    }

  } catch (e) {
    yield put({
      type: "appointments/updateFailure",
      payload: e.message,
    });
  }
}

export default function* appointmentsSaga() {
  yield takeLatest("appointments/fetchStart", fetchAppointments);
  yield takeLatest("appointments/createStart", createAppointment);
  yield takeLatest("appointments/updateStatus", updateAppointmentStatus);
}
