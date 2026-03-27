import { useRef, useEffect, useCallback } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Printer,
  Search,
} from "lucide-react";
import { DISPLAY_INTERVAL_OPTIONS } from "../../utils/constants.js";
import { useAppStore } from "../../store/useAppStore.js";
import { useClickOutside } from "../../hooks/useClickOutside.js";
import { logger } from "../../utils/logger.js";
import { FilterSchedulePanel } from "./FilterSchedulePanel.jsx";

function formatNavDate(d) {
  return d.toLocaleDateString("en-SG", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function toInputDateValue(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function ScheduleToolbar() {
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const selectedDate = useAppStore((s) => s.selectedDate);
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);
  const displayIntervalLabel = useAppStore((s) => s.displayIntervalLabel);
  const setDisplayIntervalLabel = useAppStore((s) => s.setDisplayIntervalLabel);

  const outletName = useAppStore((s) => s.outletName);
  const outlets = useAppStore((s) => s.outlets);
  const outletDropdownOpen = useAppStore((s) => s.outletDropdownOpen);
  const toggleOutletDropdown = useAppStore((s) => s.toggleOutletDropdown);
  const closeOutletDropdown = useAppStore((s) => s.closeOutletDropdown);
  const selectOutlet = useAppStore((s) => s.selectOutlet);

  const displayDropdownOpen = useAppStore((s) => s.displayDropdownOpen);
  const toggleDisplayDropdown = useAppStore((s) => s.toggleDisplayDropdown);
  const closeDisplayDropdown = useAppStore((s) => s.closeDisplayDropdown);

  const filterPanelOpen = useAppStore((s) => s.filterPanelOpen);
  const toggleFilterPanel = useAppStore((s) => s.toggleFilterPanel);
  const closeFilterPanel = useAppStore((s) => s.closeFilterPanel);

  const searchFocusTick = useAppStore((s) => s.searchFocusTick);
  const requestSearchFocus = useAppStore((s) => s.requestSearchFocus);
  const runToolbarSearch = useAppStore((s) => s.runToolbarSearch);
  const showToast = useAppStore((s) => s.showToast);

  const searchInputRef = useRef(null);
  const dateInputRef = useRef(null);
  const outletRef = useRef(null);
  const displayRef = useRef(null);
  const filterRef = useRef(null);

  const cbOutlet = useCallback(
    () => closeOutletDropdown(),
    [closeOutletDropdown],
  );
  const cbDisplay = useCallback(
    () => closeDisplayDropdown(),
    [closeDisplayDropdown],
  );
  const cbFilter = useCallback(() => closeFilterPanel(), [closeFilterPanel]);

  useClickOutside(outletRef, outletDropdownOpen, cbOutlet);
  useClickOutside(displayRef, displayDropdownOpen, cbDisplay);
  useClickOutside(filterRef, filterPanelOpen, cbFilter);

  useEffect(() => {
    if (searchFocusTick > 0) {
      searchInputRef.current?.focus();
    }
  }, [searchFocusTick]);

  const shiftDay = (delta) => {
    const n = new Date(selectedDate);
    n.setDate(n.getDate() + delta);
    setSelectedDate(n);
  };

  const openCalendarPicker = () => {
    const el = dateInputRef.current;
    if (!el) return;
    if (typeof el.showPicker === "function") {
      el.showPicker();
    } else {
      el.click();
    }
    logger.action("toolbar.calendar.open");
  };

  const runSearch = () => {
    requestSearchFocus();
    runToolbarSearch();
    showToast(`Search: ${searchQuery.trim() || "(empty)"}`, "info");
  };

  return (
    <div className="relative z-30 flex min-h-[72px] min-w-0 shrink-0 flex-wrap items-center gap-y-2 border-b border-[#E5E7EB] bg-white px-3 py-2 sm:px-6 lg:flex-nowrap lg:py-0">
      <div className="flex w-full shrink-0 flex-col justify-center gap-1.5 sm:w-[200px]">
        <div className="relative" ref={outletRef}>
          <button
            type="button"
            className="flex w-fit items-center gap-1 text-left text-[14px] font-semibold text-[#111827]"
            aria-expanded={outletDropdownOpen}
            onClick={() => toggleOutletDropdown()}
          >
            {outletName}
            <ChevronDown className="h-4 w-4 text-[#6B7280]" />
          </button>
          {outletDropdownOpen ? (
            <div className="absolute left-0 top-full z-40 mt-1 max-h-56 w-52 overflow-y-auto rounded-md border border-[#E5E7EB] bg-white py-1 shadow-lg">
              {outlets.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className="w-full px-3 py-2 text-left text-[13px] text-[#111827] hover:bg-[#F9FAFB]"
                  onClick={() => {
                    selectOutlet(o.id);
                    logger.action("toolbar.outlet.select", { id: o.id });
                  }}
                >
                  {o.name}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="relative" ref={displayRef}>
          <button
            type="button"
            className="flex w-fit items-center gap-1 text-left text-[12px] font-normal text-[#6B7280]"
            aria-expanded={displayDropdownOpen}
            onClick={() => toggleDisplayDropdown()}
          >
            Display : {displayIntervalLabel}
            <ChevronDown className="h-3.5 w-3.5 text-[#9CA3AF]" />
          </button>
          {displayDropdownOpen ? (
            <div className="absolute left-0 top-full z-40 mt-1 w-40 rounded-md border border-[#E5E7EB] bg-white py-1 shadow-lg">
              {DISPLAY_INTERVAL_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className="w-full px-3 py-2 text-left text-[13px] text-[#111827] hover:bg-[#F9FAFB]"
                  onClick={() => {
                    setDisplayIntervalLabel(opt);
                    logger.action("toolbar.display.interval", { opt });
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-2 px-1 sm:gap-3 sm:px-4">
        <div className="relative h-10 min-w-0 max-w-[520px] flex-1 overflow-x-hidden">
          <button
            type="button"
            className="absolute left-3 top-1/2 z-[1] flex h-[18px] w-[18px] -translate-y-1/2 items-center justify-center text-[#9CA3AF] hover:text-[#374151]"
            aria-label="Run search"
            onClick={runSearch}
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") runSearch();
            }}
            placeholder="Search Sales by phone/name"
            className="h-10 w-full rounded-lg border border-[#D1D5DB] bg-white pl-10 pr-3 text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/40"
          />
        </div>
        <div className="relative z-[100]" ref={filterRef}>
          <button
            type="button"
            className={`flex h-10 shrink-0 items-center gap-2 rounded-lg border px-4 text-[14px] font-medium transition-colors ${
              filterPanelOpen
                ? "border-[#FDBA74] bg-[#FFF7ED] text-[#9A3412]"
                : "border-[#D1D5DB] bg-white text-[#374151] hover:bg-[#F9FAFB]"
            }`}
            aria-expanded={filterPanelOpen}
            onClick={() => toggleFilterPanel()}
          >
            Filter
            <Filter className="h-4 w-4 text-[#6B7280]" />
          </button>
          {filterPanelOpen ? (
            <FilterSchedulePanel onClose={closeFilterPanel} />
          ) : null}
        </div>
      </div>

      <div className="relative flex w-full min-w-0 shrink-0 flex-wrap items-center justify-end gap-2 sm:w-auto">
        <input
          ref={dateInputRef}
          type="date"
          value={toInputDateValue(selectedDate)}
          onChange={(e) => {
            const v = e.target.value;
            if (v) setSelectedDate(new Date(`${v}T12:00:00`));
            logger.action("toolbar.date.change", { v });
          }}
          className="pointer-events-none absolute h-0 w-0 opacity-0"
          tabIndex={-1}
          aria-hidden
        />
        <button
          type="button"
          className="h-9 rounded-lg border border-[#D1D5DB] bg-white px-4 text-[13px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
          onClick={() => setSelectedDate(new Date())}
        >
          Today
        </button>
        <div className="flex h-9 items-center gap-1 rounded-lg border border-[#D1D5DB] bg-white px-2">
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded text-[#374151] hover:bg-[#F3F4F6]"
            aria-label="Previous day"
            onClick={() => shiftDay(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[120px] text-center text-[13px] font-medium text-[#111827]">
            {formatNavDate(selectedDate)}
          </span>
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded text-[#374151] hover:bg-[#F3F4F6]"
            aria-label="Next day"
            onClick={() => shiftDay(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D1D5DB] bg-white text-[#374151] hover:bg-[#F9FAFB]"
          aria-label="Open calendar"
          onClick={openCalendarPicker}
        >
          <CalendarDays className="h-[18px] w-[18px]" />
        </button>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D1D5DB] bg-white text-[#374151] hover:bg-[#F9FAFB]"
          aria-label="Print schedule"
          onClick={() => {
            window.print();
            logger.action("toolbar.print");
          }}
        >
          <Printer className="h-[18px] w-[18px]" />
        </button>
      </div>
    </div>
  );
}
