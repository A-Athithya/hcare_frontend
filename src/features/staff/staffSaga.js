import { call, put, takeLatest } from "redux-saga/effects";
import { getData, postData, putData, deleteData } from "../../api/client";
import {
  fetchStaffRequest,
  fetchStaffSuccess,
  fetchStaffFailure,
  addStaffRequest,
  updateStaffRequest,
  deleteStaffRequest,
} from "./staffSlice";

const baseEndpoint = "/staff";

// FETCH
function* fetchStaffSaga(action) {
  try {
    const data = yield call(getData, `${baseEndpoint}?role=${action.payload.role}`);
    yield put(fetchStaffSuccess({ role: action.payload.role, data }));
  } catch (error) {
    yield put(fetchStaffFailure({ role: action.payload.role, error: error.message }));
  }
}

// ADD
function* addStaffSaga(action) {
  try {
    yield call(postData, baseEndpoint, { ...action.payload.staff, role: action.payload.role });
    yield put(fetchStaffRequest({ role: action.payload.role }));
  } catch (error) {
    console.error(error);
  }
}

// UPDATE
function* updateStaffSaga(action) {
  try {
    yield call(
      putData,
      `${baseEndpoint}/${action.payload.staff.id}`,
      { ...action.payload.staff, role: action.payload.role }
    );
    yield put(fetchStaffRequest({ role: action.payload.role }));
  } catch (error) {
    console.error(error);
  }
}

// DELETE
function* deleteStaffSaga(action) {
  try {
    yield call(deleteData, `${baseEndpoint}/${action.payload.id}?role=${action.payload.role}`);
    yield put(fetchStaffRequest({ role: action.payload.role }));
  } catch (error) {
    console.error(error);
  }
}

// WATCHER
export default function* staffSaga() {
  yield takeLatest(fetchStaffRequest.type, fetchStaffSaga);
  yield takeLatest(addStaffRequest.type, addStaffSaga);
  yield takeLatest(updateStaffRequest.type, updateStaffSaga);
  yield takeLatest(deleteStaffRequest.type, deleteStaffSaga);
}
