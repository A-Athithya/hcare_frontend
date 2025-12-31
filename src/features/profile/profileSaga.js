import { call, put, takeLatest } from "redux-saga/effects";
import { getData, putData } from "../../api/client";
import {
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileFailure,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
} from "./profileSlice";
import { updateUser } from "../auth/authSlice";

function* fetchProfileWorker(action) {
  try {
    const { id, role, email } = action.payload || {};
    const normalizedRole = (role || "").toLowerCase();
    console.log(`🔍 Fetching profile for ${normalizedRole}: ${email}`);

    let endpoint = "";
    switch (normalizedRole) {
      case "admin":
        endpoint = `/users/${id}`;
        break;

      case "doctor":
      case "provider":
        endpoint = `/doctors?email=${encodeURIComponent(email)}`;
        break;

      case "patient":
        endpoint = `/patients?email=${encodeURIComponent(email)}`;
        break;

      case "nurse":
        endpoint = `/nurses?email=${encodeURIComponent(email)}`;
        break;

      case "pharmacist":
        endpoint = `/pharmacists?email=${encodeURIComponent(email)}`;
        break;

      case "receptionist":
        endpoint = `/receptionists?email=${encodeURIComponent(email)}`;
        break;

      default:
        console.error(`❌ Unsupported role: ${normalizedRole}`);
        throw new Error(`Unsupported role type: ${normalizedRole}`);
    }

    const response = yield call(getData, endpoint);

    // json-server returns array for filtered calls
    const profile = Array.isArray(response) ? response[0] : response;

    if (!profile) {
      throw new Error("Profile not found");
    }

    yield put(fetchProfileSuccess(profile));
  } catch (error) {
    yield put(fetchProfileFailure(error.message));
  }
}

function* updateProfileWorker(action) {
  try {
    const { id, role, data } = action.payload;
    const normalizedRole = (role || "").toLowerCase();

    if (!id || !normalizedRole) {
      throw new Error("Missing profile ID or role");
    }

    // Determine table name based on role
    let tableName = "";
    switch (normalizedRole) {
      case "doctor":
      case "provider": tableName = "doctors"; break;
      case "patient": tableName = "patients"; break;
      case "nurse": tableName = "nurses"; break;
      case "pharmacist": tableName = "pharmacists"; break;
      case "receptionist": tableName = "receptionists"; break;
      case "admin": tableName = "users"; break;
      default: throw new Error(`Unknown role: ${normalizedRole}`);
    }

    // Use centralized /profile endpoint for self-updates
    // This avoids needing 'admin' role for /doctors/ID, /patients/ID etc.
    const endpoint = '/profile';

    // putData handles encryption
    const response = yield call(putData, endpoint, data);

    // ✅ 1. Optimistically update local profile state
    yield put(updateProfileSuccess(data));

    // ✅ 2. Sync core info to auth slice (Header, Name display etc)
    yield put(updateUser({
      name: data.name,
      email: data.email
    }));

    // ✅ 3. Re-fetch full profile to ensure sync with DB (calculated fields)
    if (data.email) {
      yield put(fetchProfileStart({ id, role, email: data.email }));
    }

  } catch (error) {
    yield put(updateProfileFailure(error.message));
  }
}

export default function* profileSaga() {
  yield takeLatest(fetchProfileStart.type, fetchProfileWorker);
  yield takeLatest(updateProfileStart.type, updateProfileWorker);
}
