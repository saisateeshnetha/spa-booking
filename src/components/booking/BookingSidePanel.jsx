import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import {
  ChevronDown,
  Info,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  HEADER_BG,
  NAV_ACTIVE,
  STATUS_THEME,
  THERAPIST_FEMALE,
  THERAPIST_MALE,
} from "../../utils/constants.js";
import { useAppStore } from "../../store/useAppStore.js";
import {
  resolveBookingStatusKey,
  statusLabelForPanel,
} from "../../utils/bookingVisual.js";
import { Toggle } from "../ui/Toggle.jsx";
import { CustomerSearchDropdown } from "./CustomerSearchDropdown.jsx";
import { useClickOutside } from "../../hooks/useClickOutside.js";
import { logger } from "../../utils/logger.js";

function formatPanelDate(d) {
  return d.toLocaleDateString("en-SG", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatPanelTimeFromMin(minutes) {
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function SectionDivider() {
  return <div className="h-px w-full bg-[#E5E7EB]" />;
}

function TherapistDot({ number, gender = "Female" }) {
  const bg = gender === "Male" ? THERAPIST_MALE : THERAPIST_FEMALE;
  return (
    <span
      className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[11px] font-bold text-white"
      style={{ backgroundColor: bg }}
    >
      {number}
    </span>
  );
}

export function BookingSidePanel() {
  const panelMode = useAppStore((s) => s.panelMode);
  const selectedBooking = useAppStore((s) => s.selectedBooking);
  const closePanel = useAppStore((s) => s.closePanel);
  const openCancelModal = useAppStore((s) => s.openCancelModal);
  const editBooking = useAppStore((s) => s.editBooking);
  const createBooking = useAppStore((s) => s.createBooking);
  const saveBooking = useAppStore((s) => s.saveBooking);
  const deleteBooking = useAppStore((s) => s.deleteBooking);
  const checkInBooking = useAppStore((s) => s.checkInBooking);
  const checkoutBooking = useAppStore((s) => s.checkoutBooking);
  const showToast = useAppStore((s) => s.showToast);

  const [discount, setDiscount] = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreMenuRef = useRef(null);
  const onCloseMore = useCallback(() => setMoreOpen(false), []);
  useClickOutside(moreMenuRef, moreOpen, onCloseMore);

  const title = useMemo(() => {
    if (panelMode === "new") return "New Booking";
    if (panelMode === "edit") return "Update Booking";
    if (panelMode === "cancelled") return "Cancelled (Normal Cancellation)";
    return "Appointment";
  }, [panelMode]);

  if (panelMode === "idle") return null;

  const b = selectedBooking;

  let primaryActionLabel = "View Sale";
  let onPrimaryAction = () => {};
  if (panelMode === "view" && b) {
    const sk = resolveBookingStatusKey(b.status);
    if (sk === "confirmed") {
      primaryActionLabel = "Check-in";
      onPrimaryAction = () => {
        checkInBooking(b.id);
        showToast("Client checked in", "success");
        logger.action("booking.panel.checkIn", { id: b.id });
      };
    } else if (sk === "checkIn") {
      primaryActionLabel = "Checkout";
      onPrimaryAction = () => {
        checkoutBooking(b.id);
        showToast("Checkout completed", "success");
        logger.action("booking.panel.checkout", { id: b.id });
      };
    } else {
      primaryActionLabel = "View Sale";
      onPrimaryAction = () => {
        showToast("Opening sale view…", "info");
        logger.action("booking.viewSale", { id: b.id });
      };
    }
  }

  const statusDot =
    b && panelMode === "view"
      ? (STATUS_THEME[resolveBookingStatusKey(b.status)]?.dot ?? "#9CA3AF")
      : "#9CA3AF";
  const statusLabelText =
    b && panelMode === "view" ? statusLabelForPanel(b.status) : "";

  return (
    <aside className="flex w-[384px] shrink-0 flex-col border-l border-[#E5E7EB] bg-white shadow-[ -8px_0_24px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between gap-3 px-6 pb-4 pt-5">
        <div>
          <div className="flex items-center gap-2">
            {panelMode === "view" || panelMode === "cancelled" ? (
              <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#111827]">
                {panelMode === "cancelled" ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-sky-400" />
                    {title}
                  </>
                ) : (
                  title
                )}
              </span>
            ) : (
              <div className="text-[16px] font-bold leading-tight text-[#111827]">
                {title}
              </div>
            )}
          </div>
          {panelMode === "view" && b ? (
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#6B7280]">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: statusDot }}
                />
                {statusLabelText}
              </span>
              <button
                type="button"
                className="ml-auto rounded-md px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm"
                style={{ backgroundColor: HEADER_BG }}
                onClick={onPrimaryAction}
              >
                {primaryActionLabel}
              </button>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {panelMode === "view" ? (
            <>
              <div className="relative" ref={moreMenuRef}>
                <button
                  type="button"
                  className="rounded-md p-2 text-[#6B7280] hover:bg-[#F3F4F6]"
                  aria-label="More"
                  aria-expanded={moreOpen}
                  onClick={() => setMoreOpen((v) => !v)}
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>
                {moreOpen ? (
                  <div className="absolute right-0 z-20 mt-1 w-44 rounded-md border border-[#E5E7EB] bg-white py-1 shadow-lg">
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-[13px] text-[#111827] hover:bg-[#F9FAFB]"
                      onClick={() => {
                        setMoreOpen(false);
                        openCancelModal();
                      }}
                    >
                      Cancel / Delete
                    </button>
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                className="rounded-md p-2 text-[#6B7280] hover:bg-[#F3F4F6]"
                aria-label="Edit"
                onClick={() => b && editBooking(b)}
              >
                <Pencil className="h-5 w-5" />
              </button>
            </>
          ) : null}

          <button
            type="button"
            className="rounded-lg border border-[#D1D5DB] px-3 py-1.5 text-[12px] font-semibold text-[#F97316] hover:bg-[#FFF7ED]"
            onClick={closePanel}
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
        {panelMode === "new" ? (
          <NewBookingBody onCreate={createBooking} />
        ) : panelMode === "edit" ? (
          <UpdateBookingBody
            booking={b}
            onSave={saveBooking}
            deleteBooking={deleteBooking}
          />
        ) : panelMode === "cancelled" ? (
          <CancelledBody
            booking={b}
            discount={discount}
            setDiscount={setDiscount}
          />
        ) : (
          <ViewBody booking={b} discount={discount} setDiscount={setDiscount} />
        )}
      </div>
    </aside>
  );
}

function NewBookingBody({ onCreate }) {
  const outletName = useAppStore((s) => s.outletName);
  const selectedDate = useAppStore((s) => s.selectedDate);
  const closePanel = useAppStore((s) => s.closePanel);
  const showToast = useAppStore((s) => s.showToast);
  const [clientQuery, setClientQuery] = useState("");
  const [service, setService] = useState("60 Min Tui Na / Acupressure");
  const [durationMin, setDurationMin] = useState(60);
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [requestType, setRequestType] = useState("Soft");
  const [room, setRoom] = useState("806 Couples Room");
  const [therapistId, setTherapistId] = useState("3");

  const handleCreate = async () => {
    const name = clientQuery.split("—")[0]?.trim() || clientQuery.trim();
    if (!name || !clientPhone.trim()) {
      showToast("Client name and phone are required", "error");
      return;
    }
    await onCreate?.({
      service,
      durationMin,
      therapistId,
      clientName: name,
      clientPhone: clientPhone.trim(),
      notes,
      requests: requestType,
      room,
      startMin: 9 * 60 + 30,
    });
    showToast("Booking created", "success");
    closePanel();
  };

  return (
    <div className="space-y-0">
      <div className="py-3 text-[12px] text-[#6B7280]">
        Outlet{" "}
        <span className="font-semibold text-[#111827]">{outletName}</span>
      </div>
      <SectionDivider />
      <div className="grid grid-cols-2 gap-3 py-4">
        <div className="rounded-md border border-[#E5E7EB] px-3 py-2.5">
          <div className="text-[11px] font-medium text-[#6B7280]">On</div>
          <div className="mt-1 text-[13px] font-semibold text-[#111827]">
            {formatPanelDate(selectedDate)}
          </div>
        </div>
        <div className="rounded-md border border-[#E5E7EB] px-3 py-2.5">
          <div className="text-[11px] font-medium text-[#6B7280]">At</div>
          <div className="mt-1 text-[13px] font-semibold text-[#111827]">
            {formatPanelTimeFromMin(9 * 60 + 30)}
          </div>
        </div>
      </div>
      <SectionDivider />
      <div className="py-4">
        <div className="relative">
          <input
            value={clientQuery}
            onChange={(e) => setClientQuery(e.target.value)}
            placeholder="Search or create client"
            className="h-10 w-full rounded-md border border-[#D1D5DB] px-3 pr-10 text-[13px] focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/30"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB]"
            aria-label="Add client"
            onClick={() => {
              showToast("Add new client form (demo)", "info");
              logger.action("booking.new.addClient");
            }}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3">
          <CustomerSearchDropdown
            onSelect={(c) => {
              setClientQuery(`${c.name} — ${c.phone}`);
              showToast(`Client selected: ${c.name}`, "success");
              logger.action("booking.new.client.select", { name: c.name });
            }}
          />
        </div>
        <div className="mt-3">
          <input
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            placeholder="Client phone"
            className="h-10 w-full rounded-md border border-[#D1D5DB] px-3 text-[13px] focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/30"
          />
        </div>
      </div>
      <SectionDivider />
      <div className="grid grid-cols-2 gap-3 py-4">
        <input
          value={service}
          onChange={(e) => setService(e.target.value)}
          placeholder="Service"
          className="h-10 rounded-md border border-[#D1D5DB] px-3 text-[13px] focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/30"
        />
        <select
          value={durationMin}
          onChange={(e) => setDurationMin(Number(e.target.value))}
          className="h-10 rounded-md border border-[#D1D5DB] px-3 text-[13px] focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/30"
        >
          {[30, 45, 60, 90, 120].map((v) => (
            <option key={v} value={v}>
              {v} min
            </option>
          ))}
        </select>
        <select
          value={therapistId}
          onChange={(e) => setTherapistId(e.target.value)}
          className="h-10 rounded-md border border-[#D1D5DB] px-3 text-[13px] focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/30"
        >
          <option value="3">Lily</option>
          <option value="8">James</option>
          <option value="14">Nina</option>
          <option value="10">Philip</option>
        </select>
        <input
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="Room"
          className="h-10 rounded-md border border-[#D1D5DB] px-3 text-[13px] focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/30"
        />
        <input
          value={requestType}
          onChange={(e) => setRequestType(e.target.value)}
          placeholder="Request type"
          className="h-10 rounded-md border border-[#D1D5DB] px-3 text-[13px] focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/30"
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes"
          className="col-span-2 h-20 resize-none rounded-md border border-[#D1D5DB] p-3 text-[13px] focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/30"
        />
      </div>
      <button
        type="button"
        className="mt-2 h-11 w-full rounded-lg text-[14px] font-bold text-white"
        style={{ backgroundColor: HEADER_BG }}
        onClick={handleCreate}
      >
        Create Booking
      </button>
    </div>
  );
}

function ViewBody({ booking, discount, setDiscount }) {
  const showToast = useAppStore((s) => s.showToast);
  const selectedDate = useAppStore((s) => s.selectedDate);
  if (!booking) return null;
  return (
    <div className="space-y-0">
      <div className="grid grid-cols-2 gap-3 py-4">
        <div className="rounded-md border border-[#E5E7EB] px-3 py-2.5">
          <div className="text-[11px] font-medium text-[#6B7280]">On</div>
          <div className="mt-1 text-[13px] font-semibold text-[#111827]">
            {formatPanelDate(selectedDate)}
          </div>
        </div>
        <div className="rounded-md border border-[#E5E7EB] px-3 py-2.5">
          <div className="text-[11px] font-medium text-[#6B7280]">At</div>
          <div className="mt-1 text-[13px] font-semibold text-[#111827]">
            {formatPanelTimeFromMin(booking.startMin ?? 12 * 60 + 30)}
          </div>
        </div>
      </div>
      <SectionDivider />
      <div className="py-4">
        <div className="flex items-start gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-[14px] font-bold text-white"
            style={{ backgroundColor: "#F59E0B" }}
          >
            VB
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-bold text-[#111827]">
              {booking.clientPhone} {booking.clientName}
            </div>
            <div className="mt-1 text-[12px] text-[#6B7280]">
              Client since December 2023
            </div>
            <div className="mt-2 text-[12px] text-[#6B7280]">
              Phone: {booking.clientPhone}
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="text-[12px] font-medium text-[#374151]">
            Apply membership discount:
          </div>
          <Toggle checked={discount} onChange={setDiscount} />
        </div>
      </div>
      <SectionDivider />
      <div className="py-4">
        <div className="text-[14px] font-bold text-[#111827]">
          {booking.service}
        </div>
        <div className="mt-2 flex items-center gap-2 text-[12px] text-[#374151]">
          With:{" "}
          <TherapistDot
            number={booking.therapist?.number ?? 3}
            gender={booking.therapist?.gender}
          />{" "}
          <span className="font-semibold text-[#111827]">
            {booking.therapist?.name ?? "Lily"}
          </span>
        </div>
        <label className="mt-3 flex items-center gap-2 text-[12px] font-medium text-[#374151]">
          <input
            type="checkbox"
            defaultChecked={Boolean(booking.requestedTherapist)}
            className="h-4 w-4 rounded border-[#D1D5DB] accent-[#3E2723]"
          />
          Requested Therapist
          <button
            type="button"
            className="inline-flex rounded p-0.5 text-[#9CA3AF] hover:text-[#374151]"
            title="The client asked for this therapist specifically."
            aria-label="About requested therapist"
            onClick={() =>
              showToast(
                "Requested therapist: client preference is recorded.",
                "info",
              )
            }
          >
            <Info className="h-4 w-4" />
          </button>
        </label>
        <div className="mt-3 space-y-1 text-[12px] text-[#374151]">
          <div>
            For:{" "}
            <span className="font-semibold text-[#111827]">
              {booking.durationMin ?? 60} min
            </span>
          </div>
          <div>
            At:{" "}
            <span className="font-semibold text-[#111827]">
              {formatPanelTimeFromMin(booking.startMin ?? 9 * 60 + 30)}
            </span>
          </div>
          <div>
            Using:{" "}
            <span className="font-semibold text-[#111827]">
              {booking.room ?? "806 Couples Room"}
            </span>
            {booking.requestedRoom ? (
              <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#3B82F6]/40 text-[10px] font-bold text-[#1D4ED8]">
                R
              </span>
            ) : null}
          </div>
          <div>
            Select request(s){" "}
            <span className="font-semibold text-[#111827]">
              {booking.requests ?? "Soft, China"}
            </span>
          </div>
        </div>
      </div>
      <div className="rounded-md bg-[#FEF9C3] p-3 text-[12px] leading-snug text-[#713F12]">
        {booking.notes ??
          "I have an allergy to eucalyptus, lavender, and citrus oils. Please avoid using them in my body massage."}
      </div>
      <div className="mt-6 space-y-2 text-[11px] text-[#6B7280]">
        <div>Booked on: Thu, May 22 at 5:34 PM</div>
        <div>Booked by: Victoria Baker</div>
        <div>Source: By Phone</div>
      </div>
    </div>
  );
}

const DEFAULT_NOTES =
  "I have an allergy to eucalyptus, lavender, and citrus oils. Please avoid using them in my body massage.";

function UpdateBookingBody({ booking, onSave, deleteBooking }) {
  const outletName = useAppStore((s) => s.outletName);
  const selectedDate = useAppStore((s) => s.selectedDate);
  const closePanel = useAppStore((s) => s.closePanel);
  const showToast = useAppStore((s) => s.showToast);
  const [notes, setNotes] = useState(DEFAULT_NOTES);
  const [notesError, setNotesError] = useState("");

  useEffect(() => {
    if (!booking) return;
    setNotes(booking.notes ?? DEFAULT_NOTES);
    setNotesError("");
  }, [booking?.id]);

  if (!booking) return null;

  const handleSave = () => {
    const trimmed = notes.trim();
    if (trimmed.length < 10) {
      setNotesError("Notes must be at least 10 characters.");
      showToast("Please fix validation errors", "error");
      return;
    }
    setNotesError("");
    onSave?.({ ...booking, notes: trimmed });
    showToast("Changes saved", "success");
    logger.action("booking.update.save", { id: booking.id });
  };

  const handleDelete = () => {
    if (!window.confirm("Remove this booking from the schedule?")) return;
    deleteBooking?.(booking.id);
    showToast("Booking removed", "success");
    closePanel();
    logger.action("booking.update.delete", { id: booking.id });
  };

  return (
    <div className="space-y-0">
      <div className="py-3 text-[12px] text-[#6B7280]">
        Outlet:{" "}
        <span className="font-semibold text-[#111827]">{outletName}</span>
      </div>
      <SectionDivider />
      <div className="grid grid-cols-2 gap-3 py-4">
        <div className="rounded-md border border-[#E5E7EB] px-3 py-2.5">
          <div className="text-[11px] font-medium text-[#6B7280]">On</div>
          <div className="mt-1 text-[13px] font-semibold text-[#111827]">
            {formatPanelDate(selectedDate)}
          </div>
        </div>
        <div className="rounded-md border border-[#E5E7EB] px-3 py-2.5">
          <div className="text-[11px] font-medium text-[#6B7280]">At</div>
          <div className="mt-1 text-[13px] font-semibold text-[#111827]">
            {formatPanelTimeFromMin(booking.startMin ?? 9 * 60 + 30)}
          </div>
        </div>
      </div>
      <SectionDivider />
      <div className="py-4">
        <div className="flex items-start gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-[14px] font-bold text-white"
            style={{ backgroundColor: "#F59E0B" }}
          >
            VB
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-bold text-[#111827]">
              {booking.clientPhone} {booking.clientName ?? "Victoria Baker"}
            </div>
            <div className="mt-1 text-[12px] text-[#6B7280]">
              Client since December 2023
            </div>
            <div className="mt-2 text-[12px] text-[#6B7280]">
              {booking.clientPhone}
            </div>
          </div>
          <button
            type="button"
            className="rounded-md p-2 text-[#9CA3AF] hover:bg-[#F3F4F6]"
            aria-label="Delete booking"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <SectionDivider />
      <div className="py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[14px] font-bold text-[#111827]">
            120 Mins Body Therapy
          </div>
          <button
            type="button"
            className="rounded p-1 text-[#6B7280] hover:bg-[#F3F4F6]"
            aria-label="Service options"
            onClick={() => showToast("Service options (demo)", "info")}
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[12px] text-[#374151]">
          With:{" "}
          <TherapistDot
            number={booking.therapist?.number ?? 3}
            gender={booking.therapist?.gender}
          />{" "}
          <span className="font-semibold">
            {booking.therapist?.name ?? "Lily"}
          </span>
        </div>
        <label className="mt-3 flex items-center gap-2 text-[12px] font-medium text-[#374151]">
          <input
            type="checkbox"
            defaultChecked
            className="h-4 w-4 accent-[#3E2723]"
          />
          Requested Therapist{" "}
          <button
            type="button"
            className="inline-flex rounded p-0.5 text-[#9CA3AF] hover:text-[#374151]"
            title="The client asked for this therapist specifically."
            aria-label="About requested therapist"
            onClick={() => showToast("Requested therapist preference.", "info")}
          >
            <Info className="h-4 w-4" />
          </button>
        </label>
        <div className="mt-3 space-y-2 text-[12px]">
          <div className="flex justify-between gap-3">
            <span className="text-[#6B7280]">For:</span>
            <span className="font-semibold text-[#111827]">120 min</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[#6B7280]">At:</span>
            <button
              type="button"
              className="flex items-center gap-1 font-semibold text-[#111827]"
              onClick={() => showToast("Time picker (demo)", "info")}
            >
              9:30 AM <ChevronDown className="h-4 w-4 text-[#9CA3AF]" />
            </button>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-[#6B7280]">Adjusted Commission (S$)</span>
            <span className="font-bold text-[#111827]">$52.00</span>
          </div>
        </div>
        <button
          type="button"
          className="mt-3 text-[12px] font-semibold text-[#2563EB]"
          onClick={() => {
            showToast("Add therapist (split) — demo", "info");
            logger.action("booking.edit.addTherapist");
          }}
        >
          + Add therapist (split commission)
        </button>
        <div className="mt-3 flex items-center justify-between text-[12px]">
          <span className="text-[#6B7280]">Using:</span>
          <span className="font-semibold text-[#111827]">806 Couples Room</span>
          <button
            type="button"
            className="rounded p-1 text-[#9CA3AF] hover:bg-[#F3F4F6]"
            aria-label="Edit room"
            onClick={() => showToast("Edit room (demo)", "info")}
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between text-[12px]">
          <span className="text-[#6B7280]">Select request(s)</span>
          <span className="font-semibold text-[#111827]">Soft, China</span>
          <button
            type="button"
            className="rounded p-1 text-[#9CA3AF] hover:bg-[#F3F4F6]"
            aria-label="Edit requests"
            onClick={() => showToast("Edit requests (demo)", "info")}
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-2 flex gap-6 text-[12px] font-semibold text-[#2563EB]">
        <button
          type="button"
          className="inline-flex items-center gap-1"
          onClick={() => {
            showToast("Add service (demo)", "info");
            logger.action("booking.edit.addService");
          }}
        >
          <Plus className="h-4 w-4" /> Add service
        </button>
      </div>
      <div className="mt-4">
        <div className="text-[12px] font-semibold text-[#374151]">By Phone</div>
        <textarea
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setNotesError("");
          }}
          className="mt-2 h-24 w-full resize-none rounded-md border border-[#D1D5DB] p-3 text-[12px] text-[#111827] focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/30"
        />
        {notesError ? (
          <div className="mt-1 text-[12px] text-red-600">{notesError}</div>
        ) : null}
      </div>
      <button
        type="button"
        className="mt-6 h-11 w-full rounded-lg text-[14px] font-bold text-white"
        style={{ backgroundColor: HEADER_BG }}
        onClick={handleSave}
      >
        Save Changes
      </button>
    </div>
  );
}

function CancelledBody({ booking, discount, setDiscount }) {
  const showToast = useAppStore((s) => s.showToast);
  const selectedDate = useAppStore((s) => s.selectedDate);
  if (!booking) return null;
  return (
    <div className="space-y-0">
      <div className="rounded-md bg-[#F3F4F6] px-3 py-2 text-[12px] font-semibold text-[#374151]">
        <span>On {formatPanelDate(selectedDate)}</span>
        <span className="mx-2 text-[#D1D5DB]">|</span>
        <span>
          At {formatPanelTimeFromMin(booking.startMin ?? 12 * 60 + 30)}
        </span>
      </div>
      <div className="py-5">
        <div className="flex items-start gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-[14px] font-bold text-white"
            style={{ backgroundColor: NAV_ACTIVE }}
          >
            VB
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-bold text-[#111827]">
              {booking.clientPhone} (#9221)
            </div>
            <div className="text-[14px] font-bold text-[#111827]">
              {booking.clientName}
            </div>
            <div className="mt-1 text-[12px] text-[#6B7280]">
              Client since December 2023
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-[12px] font-medium text-[#374151]">
            Apply membership discount:
          </div>
          <Toggle checked={discount} onChange={setDiscount} />
        </div>
      </div>
      <SectionDivider />
      <div className="py-4">
        <div className="text-[14px] font-bold text-[#111827]">
          {booking.service}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[12px] text-[#374151]">
            With:{" "}
            <TherapistDot
              number={booking.therapist?.number ?? 3}
              gender={booking.therapist?.gender}
            />{" "}
            <span className="font-semibold">
              {booking.therapist?.name ?? "Lily"}
            </span>
          </div>
          <label className="flex items-center gap-2 text-[11px] font-medium text-[#374151]">
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 accent-[#3E2723]"
            />
            Requested Therapist{" "}
            <button
              type="button"
              className="inline-flex rounded p-0.5 text-[#9CA3AF] hover:text-[#374151]"
              title="Requested therapist"
              aria-label="About requested therapist"
              onClick={() =>
                showToast("Requested therapist preference.", "info")
              }
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </label>
        </div>
        <div className="mt-3 space-y-1 text-[12px] text-[#374151]">
          <div>
            For: <span className="font-semibold text-[#111827]">60 min</span>
          </div>
          <div>
            At: <span className="font-semibold text-[#111827]">9:30 AM</span>
          </div>
          <div>
            Using:{" "}
            <span className="font-semibold text-[#111827]">
              806 Couples Room
            </span>
          </div>
          <div>
            Select request(s){" "}
            <span className="font-semibold text-[#111827]">Soft, China</span>
          </div>
        </div>
      </div>
      <SectionDivider />
      <div className="py-4">
        <div className="text-[14px] font-bold text-[#111827]">
          30 Mins Foot Reflexology
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[12px] text-[#374151]">
            With: <TherapistDot number={14} />{" "}
            <span className="font-semibold">Nina</span>
          </div>
          <label className="flex items-center gap-2 text-[11px] font-medium text-[#374151]">
            <input type="checkbox" className="h-4 w-4 accent-[#3E2723]" />
            Requested Therapist
          </label>
        </div>
        <div className="mt-3 space-y-1 text-[12px] text-[#374151]">
          <div>
            For: <span className="font-semibold text-[#111827]">30 min</span>
          </div>
          <div>
            At: <span className="font-semibold text-[#111827]">10:30 AM</span>
          </div>
        </div>
      </div>
      <div className="rounded-md border border-[#FDE68A] bg-[#FFFBEB] p-3 text-[12px] leading-snug text-[#713F12]">
        I have an allergy to eucalyptus, lavender, and citrus oils. Please avoid
        using them in my body massage.
      </div>
      <div className="mt-6 space-y-2 text-[11px] text-[#6B7280]">
        <div>
          <span className="font-semibold text-[#111827]">Booked on:</span> Thu,
          May 22 at 5:34 PM
        </div>
        <div>
          <span className="font-semibold text-[#111827]">Booked by:</span>{" "}
          Victoria Baker
        </div>
        <div>
          <span className="font-semibold text-[#111827]">Cancelled on:</span>{" "}
          Thu, Jun 13 at 5:34 PM
        </div>
        <div>
          <span className="font-semibold text-[#111827]">Cancelled by:</span>{" "}
          Sandy (HQ)
        </div>
      </div>
    </div>
  );
}
