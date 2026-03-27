import { THERAPISTS } from "../../utils/constants.js";
import { useAppStore } from "../../store/useAppStore.js";
import { logger } from "../../utils/logger.js";

const STATUS_ROWS = [
  { key: "confirmed", label: "Confirmed", dot: "#3B82F6" },
  { key: "checkIn", label: "Checked In", dot: "#EC4899" },
  { key: "cancelled", label: "Cancelled", dot: "#9CA3AF" },
  { key: "completed", label: "Completed", dot: "#9CA3AF" },
  { key: "unconfirmed", label: "Unconfirmed", dot: "#F97316" },
  { key: "holding", label: "Holding", dot: "#F472B6" },
  { key: "noShow", label: "No Show", dot: "#6366F1" },
];

export function FilterSchedulePanel({ onClose }) {
  const filterGender = useAppStore((s) => s.filterGender);
  const setFilterGender = useAppStore((s) => s.setFilterGender);
  const filterStatus = useAppStore((s) => s.filterStatus);
  const toggleFilterStatus = useAppStore((s) => s.toggleFilterStatus);
  const therapistFilter = useAppStore((s) => s.therapistFilter);
  const toggleTherapistFilter = useAppStore((s) => s.toggleTherapistFilter);
  const selectAllTherapistsFilter = useAppStore(
    (s) => s.selectAllTherapistsFilter,
  );
  const resetScheduleFilters = useAppStore((s) => s.resetScheduleFilters);
  const showToast = useAppStore((s) => s.showToast);

  return (
    <div
      role="dialog"
      aria-label="Schedule filters"
      className="absolute left-0 right-0 top-full z-[100] mt-1 max-h-[min(85vh,560px)] w-full min-w-[280px] rounded-lg border border-[#E5E7EB] bg-white shadow-xl sm:left-auto sm:right-0 sm:w-[min(calc(100vw-1.5rem),380px)]"
    >
      <div className="max-h-[min(70vh,520px)] overflow-y-auto">
        <section className="border-b border-[#F3F4F6] p-3">
          <div className="text-[12px] font-semibold text-[#111827]">
            Show by group (Person who is on duty)
          </div>
          <div className="mt-2 space-y-2">
            {[
              { id: "all", label: "All Therapist" },
              { id: "male", label: "Male" },
              { id: "female", label: "Female" },
            ].map((opt) => (
              <label
                key={opt.id}
                className="flex cursor-pointer items-center justify-between gap-2 text-[13px] text-[#374151]"
              >
                <span>{opt.label}</span>
                <input
                  type="radio"
                  name="filter-gender"
                  className="h-4 w-4 accent-[#332314]"
                  checked={filterGender === opt.id}
                  onChange={() => setFilterGender(opt.id)}
                />
              </label>
            ))}
          </div>
        </section>

        <section className="border-b border-[#F3F4F6] p-3">
          <div className="text-[12px] font-semibold text-[#111827]">
            Resources
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-[13px] text-[#2563EB]">
            {["Rooms", "Sofa", "Monkey Chair"].map((r) => (
              <button
                key={r}
                type="button"
                className="rounded-md px-2 py-1 hover:bg-[#F9FAFB]"
                onClick={() => {
                  showToast(`Resource filter: ${r}`, "info");
                  logger.action("filter.resource", { resource: r });
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </section>

        <section className="border-b border-[#F3F4F6] p-3">
          <div className="text-[12px] font-semibold text-[#111827]">
            Booking Status
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
            {STATUS_ROWS.map((row) => {
              const activeKey =
                row.key === "unconfirmed" ||
                row.key === "holding" ||
                row.key === "noShow"
                  ? null
                  : row.key;
              return (
                <label
                  key={row.key}
                  className={`flex items-center gap-2 text-[12px] text-[#374151] ${activeKey ? "" : "opacity-60"}`}
                >
                  <input
                    type="checkbox"
                    className="h-2.5 w-2.5 rounded border-[#D1D5DB] accent-[#332314]"
                    checked={activeKey ? filterStatus[activeKey] : false}
                    disabled={!activeKey}
                    onChange={() => activeKey && toggleFilterStatus(activeKey)}
                  />
                  <span>{row.label}</span>
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: row.dot }}
                  />
                </label>
              );
            })}
          </div>
        </section>

        <section className="p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[12px] font-semibold text-[#111827]">
              Select Therapist
            </div>
            <button
              type="button"
              className="text-[12px] font-semibold text-[#332314] underline-offset-2 hover:underline"
              onClick={() => selectAllTherapistsFilter()}
            >
              Select All
            </button>
          </div>
          <input
            placeholder="Search by therapist"
            className="mt-2 h-9 w-full rounded-md border border-[#E5E7EB] px-2 text-[12px] text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/30"
            readOnly
            title="Filter list is short; scroll to pick therapists."
          />
          <div className="mt-2 max-h-36 space-y-1 overflow-y-auto pr-1 scrollbar-thin">
            {THERAPISTS.map((t) => (
              <label
                key={t.id}
                className="flex cursor-pointer items-center justify-between gap-2 rounded px-1 py-1 text-[11px] text-[#374151] hover:bg-[#F9FAFB]"
              >
                <span className="truncate">
                  {t.number} {t.name}
                </span>
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-[#D1D5DB] accent-[#332314]"
                  checked={therapistFilter[t.id]}
                  onChange={() => toggleTherapistFilter(t.id)}
                />
              </label>
            ))}
          </div>
        </section>
      </div>

      <div className="border-t border-[#F3F4F6] p-3">
        <button
          type="button"
          className="w-full text-center text-[13px] font-semibold text-[#EA580C] hover:underline"
          onClick={() => {
            resetScheduleFilters();
            showToast("Filters reset to default", "info");
            logger.action("filter.reset");
          }}
        >
          Clear Filter (Return to Default)
        </button>
        <button
          type="button"
          className="mt-3 w-full rounded-md bg-[#332314] py-2 text-[12px] font-semibold text-white hover:opacity-95"
          onClick={() => {
            showToast("Filters applied", "success");
            onClose?.();
            logger.action("filter.apply");
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );
}
