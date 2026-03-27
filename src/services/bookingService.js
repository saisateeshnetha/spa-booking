import { apiClient } from "./apiClient.js";
import { BOOKING_CARD, THERAPISTS } from "../utils/constants.js";
import { resolveBookingStatusKey } from "../utils/bookingVisual.js";

const DEFAULT_COMPANY_ID = Number(import.meta.env.VITE_COMPANY_ID ?? 1);
const DEFAULT_OUTLET_ID = Number(import.meta.env.VITE_OUTLET_ID ?? 1);
const DEFAULT_OUTLET_TYPE = Number(import.meta.env.VITE_OUTLET_TYPE ?? 2);
const DEFAULT_PANEL = import.meta.env.VITE_PANEL ?? "outlet";
const DEFAULT_CREATED_BY = Number(import.meta.env.VITE_CREATED_BY ?? 229061);

function toMin(value, fallback = 9 * 60) {
  if (!value) return fallback;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;
  return d.getHours() * 60 + d.getMinutes();
}

function toHm(minutes = 9 * 60) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function formatDateDDMMYYYY(d) {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function defaultDateRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 14);
  return `${formatDateDDMMYYYY(start)} / ${formatDateDDMMYYYY(end)}`;
}

function createBookingItemsPayload(bookingLike) {
  const startMin = Number(bookingLike?.startMin ?? 9 * 60);
  const duration = Number(bookingLike?.durationMin ?? 60);
  const endMin = startMin + duration;
  const therapistId = Number(bookingLike?.therapistId ?? THERAPISTS[0].id);
  const serviceId = Number(bookingLike?.serviceId ?? 34);
  const customerName = bookingLike?.clientName ?? "Walk-in Client";

  return [
    {
      service: serviceId,
      start_time: toHm(startMin),
      end_time: toHm(endMin),
      duration,
      therapist: therapistId,
      requested_person: 0,
      price: String(bookingLike?.price ?? "77.00"),
      quantity: "1",
      service_request: bookingLike?.requests ?? "",
      commission: null,
      customer_name: customerName,
      primary: 1,
      item_number: 1,
      room_segments: [],
    },
  ];
}

function pickTherapist(raw) {
  const id = String(
    raw?.therapist_id ??
      raw?.therapistId ??
      raw?.booking_item?.check?.[0]?.therapist_id ??
      THERAPISTS[0].id,
  );
  const therapist = THERAPISTS.find((t) => t.id === id) ?? THERAPISTS[0];
  return { therapistId: therapist.id, therapist };
}

export function normalizeBooking(raw, idx = 0) {
  const { therapistId, therapist } = pickTherapist(raw);
  const cardKeys = Object.keys(BOOKING_CARD);
  const cardKey = cardKeys[idx % cardKeys.length];
  const durationRaw = Number(
    raw?.duration ??
      raw?.durationMin ??
      raw?.booking_item?.check?.[0]?.duration ??
      60,
  );
  const durationMin = Number.isFinite(durationRaw)
    ? Math.max(15, durationRaw)
    : 60;
  const bookingItem = raw?.booking_item?.check?.[0];
  const startValue =
    raw?.start_time ??
    raw?.startAt ??
    raw?.date_time ??
    bookingItem?.service_at;
  const serviceName =
    raw?.service_name ?? raw?.service ?? bookingItem?.service ?? "Service";

  return {
    id: String(raw?.id ?? raw?.booking_id ?? `api-${idx + 1}`),
    therapistId,
    therapist,
    startMin: toMin(startValue),
    durationMin,
    service: serviceName,
    clientPhone: String(
      raw?.phone ??
        raw?.client_phone ??
        raw?.customer_phone ??
        raw?.mobile_number ??
        "",
    ),
    clientName:
      raw?.client_name ?? raw?.customer_name ?? raw?.name ?? "Walk-in Client",
    status: resolveBookingStatusKey(raw?.status),
    cardKey,
    bg: BOOKING_CARD[cardKey]?.bg ?? "#E5E7EB",
    room:
      raw?.room_name ?? raw?.room ?? bookingItem?.room_items?.[0]?.room_name,
    requests: raw?.request_type ?? raw?.requests,
    notes: raw?.notes ?? raw?.note ?? "",
    requestedTherapist: Boolean(
      bookingItem?.requested_person === 1 ||
      bookingItem?.requested_person === true,
    ),
    requestedRoom: Boolean(
      bookingItem?.requested_room === 1 ||
      bookingItem?.requested_room === true ||
      (Array.isArray(bookingItem?.room_items) &&
        bookingItem.room_items.length > 0),
    ),
  };
}

export const bookingService = {
  async list(token) {
    const endpoints = [
      {
        url: "/bookings/outlet/booking/list",
        params: {
          pagination: 1,
          daterange: defaultDateRange(),
          outlet: DEFAULT_OUTLET_ID,
          panel: DEFAULT_PANEL,
          view_type: "calendar",
        },
      },
      { url: "/bookings", params: { pagination: 1 } },
      { url: "/bookings/list", params: { pagination: 1 } },
    ];
    let lastError = null;
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    for (const endpoint of endpoints) {
      try {
        const res = await apiClient.get(endpoint.url, {
          headers,
          params: endpoint.params,
        });
        const rows = res.data?.data?.data;
        const list =
          (Array.isArray(rows?.list?.bookings) && rows.list.bookings) ||
          (Array.isArray(rows?.list?.data) && rows.list.data) ||
          (Array.isArray(rows?.list) && rows.list) ||
          (Array.isArray(rows?.bookingData) && rows.bookingData) ||
          (Array.isArray(rows) && rows) ||
          (Array.isArray(res.data?.data) && res.data.data) ||
          (Array.isArray(res.data) && res.data) ||
          [];
        return list.map((r, i) => normalizeBooking(r, i));
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError ?? new Error("Unable to fetch bookings.");
  },

  async create(payload, token) {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const form = new FormData();
    form.append("company", String(DEFAULT_COMPANY_ID));
    form.append("outlet", String(DEFAULT_OUTLET_ID));
    form.append("outlet_type", String(DEFAULT_OUTLET_TYPE));
    form.append("booking_type", String(payload?.bookingType ?? 1));
    form.append("customer", String(payload?.customerId ?? 980));
    form.append("created_by", String(payload?.createdBy ?? DEFAULT_CREATED_BY));
    form.append("items", JSON.stringify(createBookingItemsPayload(payload)));
    form.append("currency", payload?.currency ?? "SGD");
    form.append("source", payload?.source ?? "By Phone");
    form.append("payment_type", payload?.paymentType ?? "payatstore");
    form.append(
      "service_at",
      payload?.serviceAt ??
        `${formatDateDDMMYYYY(new Date())} ${toHm(payload?.startMin ?? 9 * 60)}`,
    );
    form.append("note", payload?.notes ?? "");
    form.append("membership", String(payload?.membership ?? 0));
    form.append("panel", DEFAULT_PANEL);
    form.append("type", payload?.type ?? "manual");

    const res = await apiClient.post("/bookings/create", form, { headers });
    return normalizeBooking(
      res.data?.data?.data ?? res.data?.data ?? res.data ?? payload,
      0,
    );
  },

  async update(id, payload, token) {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const form = new FormData();
    form.append("company", String(DEFAULT_COMPANY_ID));
    form.append("outlet", String(DEFAULT_OUTLET_ID));
    form.append("items", JSON.stringify(createBookingItemsPayload(payload)));
    form.append("currency", payload?.currency ?? "SGD");
    form.append("source", payload?.source ?? "By Phone");
    form.append(
      "service_at",
      payload?.serviceAt ??
        `${formatDateDDMMYYYY(new Date())} ${toHm(payload?.startMin ?? 9 * 60)}`,
    );
    form.append("customer", String(payload?.customerId ?? 980));
    form.append("panel", DEFAULT_PANEL);
    form.append("updated_by", String(payload?.updatedBy ?? DEFAULT_CREATED_BY));
    form.append("booking_type", String(payload?.bookingType ?? 1));
    form.append("membership", String(payload?.membership ?? 0));
    form.append("note", payload?.notes ?? "");

    const res = await apiClient.post(`/bookings/${id}`, form, { headers });
    return normalizeBooking(
      res.data?.data?.data ?? res.data?.data ?? res.data ?? payload,
      0,
    );
  },

  async cancel(id, payload = {}, token) {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const form = new FormData();
    form.append("company", String(DEFAULT_COMPANY_ID));
    form.append("id", String(id));
    form.append("type", payload?.type ?? "normal");
    form.append("panel", DEFAULT_PANEL);
    await apiClient.post("/bookings/item/cancel", form, { headers });
    return { id, status: "cancelled" };
  },

  async destroy(id, token) {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    await apiClient.delete(`/bookings/destroy/${id}`, { headers });
    return { id };
  },
};
