import { call, put, takeLatest } from "redux-saga/effects";
import { getData, postData, putData, deleteData } from "../../api/client";

// --- Worker sagas ---
// Fetch all doctors
function* fetchDoctors() {
  try {
    const data = yield call(getData, "/doctors"); // matches your backend route
    yield put({ type: "doctors/fetchSuccess", payload: data });
  } catch (err) {
    yield put({ type: "doctors/fetchFailure", payload: err.message });
  }
}

// Create doctor
function* createDoctor(action) {
  try {
    yield call(postData, "/doctors", action.payload);
    yield put({ type: "doctors/fetchStart" }); // reload list after create
  } catch (err) {
    yield put({ type: "doctors/createFailure", payload: err.message });
  }
}

// Update doctor
function* updateDoctor(action) {
  try {
    const { id, data } = action.payload;
    yield call(putData, `/doctors/${id}`, data);
    yield put({ type: "doctors/fetchStart" }); // reload list
  } catch (err) {
    yield put({ type: "doctors/updateFailure", payload: err.message });
  }
}

// Delete doctor
function* deleteDoctor(action) {
  try {
    const id = action.payload;
    yield call(deleteData, `/doctors/${id}`);
    yield put({ type: "doctors/deleteSuccess", payload: id });
  } catch (err) {
    yield put({ type: "doctors/deleteFailure", payload: err.message });
  }
}

// --- Watcher saga ---
export default function* doctorsSaga() {
  yield takeLatest("doctors/fetchStart", fetchDoctors);
  yield takeLatest("doctors/createStart", createDoctor);
  yield takeLatest("doctors/updateStart", updateDoctor);
  yield takeLatest("doctors/deleteStart", deleteDoctor);
}
