import { lazy, Suspense, useEffect } from "react";
import { MainHeader } from "../components/layout/MainHeader.jsx";
import { ScheduleToolbar } from "../components/layout/ScheduleToolbar.jsx";
import { TherapistHeaderRow } from "../components/calendar/TherapistHeaderRow.jsx";
import { ScheduleGrid } from "../components/calendar/ScheduleGrid.jsx";
import { CancelBookingModal } from "../components/booking/CancelBookingModal.jsx";
import { TabPlaceholderContent } from "../components/layout/TabPlaceholderContent.jsx";
import { SettingsModal } from "../components/layout/SettingsModal.jsx";
import { Toast } from "../components/ui/Toast.jsx";
import { useAppStore } from "../store/useAppStore.js";

const BookingSidePanel = lazy(async () => {
  const m = await import("../components/booking/BookingSidePanel.jsx");
  return { default: m.BookingSidePanel };
});

function PanelFallback() {
  return (
    <aside className="flex w-[384px] shrink-0 items-center justify-center border-l border-[#E5E7EB] bg-white text-[12px] text-[#6B7280]">
      Loading…
    </aside>
  );
}

export function DashboardPage() {
  const panelMode = useAppStore((s) => s.panelMode);
  const openNewBooking = useAppStore((s) => s.openNewBooking);
  const activeNavTab = useAppStore((s) => s.activeNavTab);
  const fetchBookings = useAppStore((s) => s.fetchBookings);
  const loading = useAppStore((s) => s.loading);
  const lastError = useAppStore((s) => s.lastError);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-x-hidden bg-[#F5F5F5]">
      <MainHeader />
      {loading ? (
        <div className="border-b border-[#E5E7EB] bg-[#EFF6FF] px-6 py-2 text-[12px] font-medium text-[#1D4ED8]">
          Loading bookings...
        </div>
      ) : null}
      {lastError ? (
        <div className="border-b border-[#FDE68A] bg-[#FFFBEB] px-6 py-2 text-[12px] font-medium text-[#92400E]">
          {lastError}
        </div>
      ) : null}
      <div className="relative flex min-h-0 flex-1 flex-col">
        <ScheduleToolbar />
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white lg:min-h-0">
            {activeNavTab === "home" ? (
              <>
                <TherapistHeaderRow />
                <ScheduleGrid />
              </>
            ) : (
              <TabPlaceholderContent tab={activeNavTab} />
            )}
          </div>
          {panelMode !== "idle" ? (
            <Suspense fallback={<PanelFallback />}>
              <div className="max-lg:max-h-[min(520px,55vh)] max-lg:overflow-hidden lg:max-h-none">
                <BookingSidePanel />
              </div>
            </Suspense>
          ) : null}
        </div>

        <div className="pointer-events-none absolute bottom-6 right-6 flex justify-end">
          <button
            type="button"
            className="pointer-events-auto h-10 rounded-lg border border-[#D1D5DB] bg-white px-4 text-[13px] font-semibold text-[#111827] shadow-md hover:bg-[#F9FAFB]"
            onClick={() => openNewBooking()}
          >
            New Booking
          </button>
        </div>
      </div>

      <CancelBookingModal />
      <SettingsModal />
      <Toast />
    </div>
  );
}
