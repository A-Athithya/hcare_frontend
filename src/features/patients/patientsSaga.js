// src/features/patients/patientsSaga.js
import { call, put, takeLatest } from "redux-saga/effects";
import { getData, postData, putData, deleteData } from "../../api/client";

// Fetch all patients
function* fetchPatients() {
  try {
    const data = yield call(getData, "/patients");
    yield put({ type: "patients/fetchSuccess", payload: data });
  } catch (e) {
    yield put({ type: "patients/fetchFailure", payload: e.message });
  }
}

// Create patient
function* createPatient(action) {
  try {
    yield call(postData, "/patients", action.payload);

    // ✅ After create → reload list
    yield put({ type: "patients/fetchStart" });
  } catch (e) {
    yield put({ type: "patients/createFailure", payload: e.message });
  }
}

// Update patient
function* updatePatient(action) {
  try {
    const { id, data } = action.payload;
    yield call(putData, `/patients/${id}`, data);

    // ✅ Refresh list
    yield put({ type: "patients/fetchStart" });
  } catch (e) {
    yield put({ type: "patients/updateFailure", payload: e.message });
  }
}

// Delete patient
function* deletePatient(action) {
  try {
    const id = action.payload;
    yield call(deleteData, `/patients/${id}`);
    yield put({ type: "patients/deleteSuccess", payload: id });
  } catch (e) {
    yield put({ type: "patients/deleteFailure", payload: e.message });
  }
}

export default function* patientsSaga() {
  yield takeLatest("patients/fetchStart", fetchPatients);
  yield takeLatest("patients/createStart", createPatient);
  yield takeLatest("patients/updateStart", updatePatient);
  yield takeLatest("patients/deleteStart", deletePatient);
}
