import { call, put, takeLatest } from "redux-saga/effects";
import { getData, postData, putData, patchData } from "../../api/client";

function* fetchPrescriptions() {
  try {
    const data = yield call(getData, "/prescriptions"); // ✅ decrypted array

    // Parse medicines JSON string
    const parsedData = data.map(p => ({
      ...p,
      medicines: typeof p.medicines === 'string' ? JSON.parse(p.medicines) : p.medicines
    }));

    yield put({ type: "prescriptions/fetchSuccess", payload: parsedData });
  } catch (e) {
    yield put({ type: "prescriptions/fetchFailure", payload: e.message });
  }
}

function* createPrescription(action) {
  try {
    const created = yield call(postData, "/prescriptions", action.payload);
    yield put({ type: "prescriptions/createSuccess", payload: created });
  } catch (e) {
    yield put({ type: "prescriptions/createFailure", payload: e.message });
  }
}

function* updatePrescription(action) {
  try {
    const { id, data } = action.payload;
    let updated;
    if (data.status) {
      updated = yield call(patchData, `/prescriptions/${id}/status`, data);

      // ✅ If Dispensed → Automatically Create Invoice
      if (data.status === "Dispensed") {
        // 1. Fetch full prescription details to get patient/doctor IDs
        const pres = yield call(getData, `/prescriptions/${id}`);

        // 2. Prepare Billing Payload
        const billingPayload = {
          patientId: pres.patient_id || pres.patientId,
          doctorId: pres.doctor_id || pres.doctorId,
          appointmentId: pres.appointment_id || pres.appointmentId,
          // Calculate total from medicines if possible, else default
          totalAmount: 150, // Default pharmacy charge or sum of meds
          paidAmount: 0,
          status: "Unpaid",
          invoiceDate: new Date().toISOString().split("T")[0],
          tenant_id: pres.tenant_id
        };

        // 3. Dispatch Billing Creation
        yield put({
          type: "billing/createStart",
          payload: billingPayload
        });
      }

    } else {
      updated = yield call(putData, `/prescriptions/${id}`, data);
    }
    yield put({ type: "prescriptions/updateSuccess", payload: updated });
    yield put({ type: "prescriptions/fetchStart" });
  } catch (e) {
    yield put({ type: "prescriptions/updateFailure", payload: e.message });
  }
}

export default function* prescriptionsSaga() {
  yield takeLatest("prescriptions/fetchStart", fetchPrescriptions);
  yield takeLatest("prescriptions/createStart", createPrescription);
  yield takeLatest("prescriptions/updateStart", updatePrescription);
}
