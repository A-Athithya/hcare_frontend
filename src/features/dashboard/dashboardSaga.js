import { all, call, put, takeLatest } from "redux-saga/effects";
import { getData } from "../../api/client";
import {
  fetchDashboardDataStart,
  fetchDashboardDataSuccess,
  fetchDashboardDataFailure,
} from "./dashboardSlice";

/* ✅ DASHBOARD MAIN WORKER */
function* fetchDashboardWorker() {
  try {
    yield put(fetchDashboardDataStart());

    // Safe fetch helper
    const safeFetch = function* (endpoint) {
      try {
        return yield call(getData, endpoint);
      } catch (e) {
        console.error(`Failed to fetch ${endpoint}:`, e);
        return [];
      }
    };

    const [doctors, patients, appointments, medicines, billings] = yield all([
      call(safeFetch, "/doctors"),
      call(safeFetch, "/patients"),
      call(safeFetch, "/appointments"),
      call(safeFetch, "/medicines"),
      call(safeFetch, "/billing")
    ]);

    const allInvoices = Array.isArray(billings) ? billings : [];

    // ✅ TOTAL REVENUE CALCULATION
    const totalRevenue = allInvoices.reduce((sum, bill) => sum + Number(bill.paid_amount || bill.paidAmount || 0), 0);

    // ✅ MONTHLY REVENUE FOR GRAPH (Line / Bar Chart)
    const revenueByMonth = {};

    allInvoices.forEach((bill) => {
      const dateStr = bill.invoice_date || bill.invoiceDate || bill.date || bill.created_at || bill.registered_date;
      if (dateStr) {
        const month = dateStr.slice(0, 7); // YYYY-MM
        revenueByMonth[month] = (revenueByMonth[month] || 0) + Number(bill.paid_amount || bill.paidAmount || bill.amount || 0);
      }
    });

    const stats = {
      doctors: Array.isArray(doctors) ? doctors : [],
      patients: Array.isArray(patients) ? patients : [],
      appointments: Array.isArray(appointments) ? appointments : [],
      medicines: Array.isArray(medicines) ? medicines : [],
      invoices: allInvoices,
      totalRevenue,
      revenueGraph: revenueByMonth,
    };

    yield put(fetchDashboardDataSuccess(stats));
  } catch (err) {
    yield put(fetchDashboardDataFailure(err.message));
  }
}

/* ✅ WATCHER */
export default function* dashboardSaga() {
  yield takeLatest("dashboard/fetchDashboardData", fetchDashboardWorker);

  // ✅ Payment pannina udane dashboard auto refresh
  yield takeLatest("billing/createSuccess", fetchDashboardWorker);
}
