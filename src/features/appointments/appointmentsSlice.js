// ✅ Transform snake_case backend fields to camelCase for frontend
const transformAppointment = (appt) => ({
  id: appt.id,
  patientId: appt.patient_id,
  doctorId: appt.doctor_id,
  appointmentDate: appt.appointment_date,
  appointmentTime: appt.appointment_time,
  reason: appt.reason,
  status: appt.status,
  paymentAmount: appt.payment_amount,
  notes: appt.notes,
  patientName: appt.patient_name,
  doctorName: appt.doctor_name,
  tenantId: appt.tenant_id,
});

const initial = { list: [], loading: false, error: null };

export default function appointmentsReducer(state = initial, action) {
  switch (action.type) {
    case "appointments/fetchStart":
      return { ...state, loading: true };
    case "appointments/fetchSuccess":
      // Transform all appointments from snake_case to camelCase
      const transformed = Array.isArray(action.payload)
        ? action.payload.map(transformAppointment)
        : [];
      return { ...state, loading: false, list: transformed };
    case "appointments/fetchFailure":
      return { ...state, loading: false, error: action.payload };

    case "appointments/createStart":
      return { ...state, loading: true };
    case "appointments/createSuccess":
      return { ...state, loading: false, list: [action.payload, ...state.list] };
    case "appointments/createFailure":
      return { ...state, loading: false, error: action.payload };

    case "appointments/updateStart":
      return { ...state, loading: true };
    case "appointments/updateSuccess":
      return {
        ...state,
        loading: false,
        list: state.list.map((item) =>
          item.id === action.payload.id ? { ...item, ...action.payload } : item
        ),
      };
    case "appointments/updateFailure":
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}
