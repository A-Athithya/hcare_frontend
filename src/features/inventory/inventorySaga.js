import { call, put, takeLatest } from "redux-saga/effects";
import { getData, postData, putData, deleteData } from "../../api/client";
import {
  fetchInventoryRequest, fetchInventorySuccess, fetchInventoryFailure,
  addInventoryRequest, addInventorySuccess, addInventoryFailure,
  updateInventoryRequest, updateInventorySuccess, updateInventoryFailure,
  deleteInventoryRequest, deleteInventorySuccess, deleteInventoryFailure
} from "./inventorySlice";

const endpoint = "/medicines";

// FETCH
function* fetchInventorySaga() {
  try {
    const data = yield call(getData, endpoint);
    yield put(fetchInventorySuccess(data));
  } catch (error) {
    yield put(fetchInventoryFailure(error.message));
  }
}

// ADD
function* addInventorySaga(action) {
  try {
    yield call(postData, endpoint, action.payload);
    yield put(addInventorySuccess());
    yield put(fetchInventoryRequest());
  } catch (error) {
    yield put(addInventoryFailure(error.message));
  }
}

// UPDATE
function* updateInventorySaga(action) {
  try {
    yield call(putData, `${endpoint}/${action.payload.id}`, action.payload);
    yield put(updateInventorySuccess());
    yield put(fetchInventoryRequest());
  } catch (error) {
    yield put(updateInventoryFailure(error.message));
  }
}

// DELETE
function* deleteInventorySaga(action) {
  try {
    yield call(deleteData, `${endpoint}/${action.payload}`);
    yield put(deleteInventorySuccess());
    yield put(fetchInventoryRequest());
  } catch (error) {
    yield put(deleteInventoryFailure(error.message));
  }
}

// WATCHER
export default function* inventorySaga() {
  yield takeLatest(fetchInventoryRequest.type, fetchInventorySaga);
  yield takeLatest(addInventoryRequest.type, addInventorySaga);
  yield takeLatest(updateInventoryRequest.type, updateInventorySaga);
  yield takeLatest(deleteInventoryRequest.type, deleteInventorySaga);
}
