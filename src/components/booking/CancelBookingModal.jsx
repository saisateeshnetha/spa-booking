import { useState, useEffect } from "react";
import { HEADER_BG } from "../../utils/constants.js";
import { useAppStore } from "../../store/useAppStore.js";
import { logger } from "../../utils/logger.js";

export function CancelBookingModal() {
  const open = useAppStore((s) => s.cancelModalOpen);
  const close = useAppStore((s) => s.closeCancelModal);
  const cancelBooking = useAppStore((s) => s.cancelBooking);
  const deleteBooking = useAppStore((s) => s.deleteBooking);
  const closePanel = useAppStore((s) => s.closePanel);
  const selectedBooking = useAppStore((s) => s.selectedBooking);
  const showCancelled = useAppStore((s) => s.showCancelled);
  const [kind, setKind] = useState("normal");

  useEffect(() => {
    if (open) setKind("normal");
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={() => close()}
      role="presentation"
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-booking-title"
      >
        <div className="h-1 w-full bg-[#E5E7EB]">
          <div className="h-full w-1/3 bg-emerald-500" />
        </div>
        <div className="px-8 pb-8 pt-7">
          <div
            id="cancel-booking-title"
            className="text-[18px] font-bold text-[#111827]"
          >
            Cancel / Delete Booking
          </div>
          <div className="mt-1 text-[13px] font-medium text-[#6B7280]">
            Please select the cancellation type.
          </div>
          <div className="mt-6 space-y-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="radio"
                name="cancel-kind"
                className="mt-1 h-4 w-4 accent-[#F59E0B]"
                checked={kind === "normal"}
                onChange={() => setKind("normal")}
              />
              <span className="text-[14px] font-medium text-[#111827]">
                Normal Cancellation
              </span>
            </label>
            <label className="flex cursor-not-allowed items-start gap-3 opacity-40">
              <input
                type="radio"
                name="cancel-kind"
                className="mt-1 h-4 w-4"
                disabled
              />
              <span className="text-[14px] font-medium text-[#9CA3AF]">
                No Show
              </span>
            </label>
            <div>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="radio"
                  name="cancel-kind"
                  className="mt-1 h-4 w-4 accent-[#9CA3AF]"
                  checked={kind === "delete"}
                  onChange={() => setKind("delete")}
                />
                <span className="text-[14px] font-medium text-[#111827]">
                  Just Delete It
                </span>
              </label>
              <div className="ml-7 mt-2 text-[12px] leading-snug text-[#9CA3AF]">
                Bookings with a deposit cannot be deleted. Please cancel instead
                to retain a proper record.
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-[#E5E7EB] pt-6">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                className="h-10 rounded-lg border border-[#D1D5DB] bg-white px-5 text-[14px] font-semibold text-[#EF4444] hover:bg-[#FEF2F2]"
                onClick={() => close()}
              >
                Cancel
              </button>
              <button
                type="button"
                className="h-10 min-w-[160px] rounded-lg px-6 text-[14px] font-semibold text-white"
                style={{ backgroundColor: HEADER_BG }}
                onClick={() => {
                  if (!selectedBooking) {
                    close();
                    return;
                  }
                  if (kind === "delete") {
                    deleteBooking(selectedBooking.id);
                    closePanel();
                    logger.info("booking.deleted", {
                      id: selectedBooking.id,
                    });
                    close();
                    return;
                  }
                  cancelBooking(selectedBooking.id);
                  showCancelled({ ...selectedBooking, status: "cancelled" });
                  logger.info("booking.cancelled", {
                    id: selectedBooking.id,
                    kind,
                  });
                  close();
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
