// src/features/billing/billingSaga.js
import { call, put, takeLatest } from "redux-saga/effects";
import { getData, postData, patchData } from "../../api/client";

// Fetch all billings
function* fetchBilling() {
  try {
    const data = yield call(getData, "/billing");
    // Transform snake_case to camelCase
    const transformedData = (data || []).map(invoice => ({
      ...invoice,
      patientId: invoice.patient_id,
      doctorId: invoice.doctor_id,
      invoiceDate: invoice.invoice_date,
      totalAmount: invoice.total_amount,
      paidAmount: invoice.paid_amount,
      patientName: invoice.patient_name,
      doctorName: invoice.doctor_name
    }));
    yield put({ type: "billing/fetchSuccess", payload: transformedData });
  } catch (e) {
    yield put({ type: "billing/fetchFailure", payload: e.message });
  }
}

// Create billing/invoice
function* createBilling(action) {
  try {
    const created = yield call(postData, "/billing", action.payload);
    yield put({ type: "billing/createSuccess", payload: created });
    // Refresh billing list after creating
    yield put({ type: "billing/fetchStart" });
  } catch (e) {
    yield put({ type: "billing/createFailure", payload: e.message });
  }
}

// Update payment status
function* updatePayment(action) {
  try {
    const { id, paidAmount, status } = action.payload;

    const requestPayload = {
      status,
      paid_amount: paidAmount
    };

    const response = yield call(patchData, `/billing/${id}/status`, requestPayload);
    console.log("✅ PATCH response:", response);

    yield put({ type: "billing/updatePaymentSuccess" });
    console.log("🔄 Refreshing billing list...");
    // Refresh list after payment
    yield put({ type: "billing/fetchStart" });
    yield put({ type: "appointments/fetchStart" });
  } catch (e) {
    yield put({ type: "billing/updatePaymentFailure", payload: e.message });
  }
}

export default function* billingSaga() {
  yield takeLatest("billing/fetchStart", fetchBilling);
  yield takeLatest("billing/createStart", createBilling);
  yield takeLatest("billing/updatePaymentStart", updatePayment);
  yield takeLatest("payment/createStart", createBilling);
}
