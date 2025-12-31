import { call, put, takeLatest } from "redux-saga/effects";
import { getData, postData } from "../../api/client";
import {
  fetchAppointmentsRequest,
  fetchAppointmentsSuccess,
  fetchNotesRequest,
  fetchNotesSilentRequest,
  fetchNotesSuccess,
  fetchHistoryRequest,
  fetchHistorySuccess,
  addNoteRequest,
  addNoteSuccess,
  communicationFailure
} from "./communicationSlice";

/* ================= FETCH APPOINTMENTS ================= */
function* fetchAppointmentsSaga() {
  try {
    const data = yield call(getData, "/appointments"); // adjust API
    yield put(fetchAppointmentsSuccess(data));
  } catch (err) {
    yield put(communicationFailure(err.message || "Failed to fetch appointments"));
  }
}

/* ================= FETCH NOTES ================= */
function* fetchNotesSaga(action) {
  try {
    const appointmentId = action.payload;
    const data = yield call(
      getData,
      `/communication/notes/appointment/${appointmentId}`
    );
    yield put(fetchNotesSuccess({ appointmentId, notes: data }));
  } catch (err) {
    yield put(communicationFailure(err.message || "Failed to fetch notes"));
  }
}

/* ================= FETCH HISTORY ================= */
function* fetchHistorySaga() {
  try {
    const data = yield call(getData, "/communication/history");
    yield put(fetchHistorySuccess(data));
  } catch (err) {
    yield put(communicationFailure(err.message || "Failed to fetch history"));
  }
}

/* ================= ADD NOTE ================= */
function* addNoteSaga(action) {
  try {
    const payload = action.payload;

    yield call(postData, "/communication/notes", payload);
    yield put(addNoteSuccess());

    // 🔁 Auto refresh notes
    yield put(fetchNotesSilentRequest(payload.appointment_id));
  } catch (err) {
    yield put(communicationFailure(err.message || "Failed to add note"));
  }
}

export default function* communicationSaga() {
  yield takeLatest(fetchAppointmentsRequest.type, fetchAppointmentsSaga);
  yield takeLatest(fetchNotesRequest.type, fetchNotesSaga);
  yield takeLatest(fetchNotesSilentRequest.type, fetchNotesSaga);
  yield takeLatest(fetchHistoryRequest.type, fetchHistorySaga);
  yield takeLatest(addNoteRequest.type, addNoteSaga);
}
