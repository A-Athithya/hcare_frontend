import { call, put, takeLatest, all } from "redux-saga/effects";
import { getData, postData } from "../../api/client";
import {
  fetchNotificationsRequest,
  fetchNotificationsSuccess,
  fetchNotificationsFailure,
  markNotificationReadRequest,
  markNotificationReadSuccess,
  markNotificationReadFailure,
  createNotificationRequest,
  createNotificationSuccess,
  createNotificationFailure,
} from "./notificationSlice";

/* ================= FETCH UNREAD ================= */
function* fetchNotificationsSaga() {
  try {
    const list = yield call(() => getData("/notifications"));
    // backend already sends unread only
    yield put(fetchNotificationsSuccess(list || []));
  } catch (err) {
    yield put(fetchNotificationsFailure(err.message));
  }
}

/* ================= MARK AS READ ================= */
function* markNotificationReadSaga(action) {
  try {
    const { id } = action.payload;

    // ✅ CORRECT backend API
    yield call(() => postData(`/notifications/read/${id}`));

    // remove from redux
    yield put(markNotificationReadSuccess({ id }));
  } catch (err) {
    yield put(markNotificationReadFailure(err.message));
  }
}

/* ================= CREATE ================= */
function* createNotificationSaga(action) {
  try {
    const res = yield call(() =>
      postData("/notifications", action.payload)
    );
    yield put(createNotificationSuccess(res));
  } catch (err) {
    yield put(createNotificationFailure(err.message));
  }
}

export default function* notificationSaga() {
  yield all([
    takeLatest(fetchNotificationsRequest.type, fetchNotificationsSaga),
    takeLatest(markNotificationReadRequest.type, markNotificationReadSaga),
    takeLatest(createNotificationRequest.type, createNotificationSaga),
  ]);
}
