import { memo, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  THERAPIST_FEMALE,
  THERAPIST_MALE,
  THERAPISTS,
  TIME_COLUMN_WIDTH_PX,
  THERAPIST_COLUMN_WIDTH_PX,
  VISIBLE_THERAPIST_COLUMNS,
} from "../../utils/constants.js";
import { useAppStore } from "../../store/useAppStore.js";

function TherapistBadge({ number, gender }) {
  const bg = gender === "Female" ? THERAPIST_FEMALE : THERAPIST_MALE;
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
      style={{ backgroundColor: bg }}
    >
      {number}
    </span>
  );
}

export const TherapistHeaderRow = memo(function TherapistHeaderRow() {
  const therapistWindowStart = useAppStore((s) => s.therapistWindowStart);
  const shiftTherapistWindow = useAppStore((s) => s.shiftTherapistWindow);
  const maxStart = Math.max(0, THERAPISTS.length - VISIBLE_THERAPIST_COLUMNS);
  const visibleTherapists = useMemo(
    () =>
      THERAPISTS.slice(
        therapistWindowStart,
        therapistWindowStart + VISIBLE_THERAPIST_COLUMNS,
      ),
    [therapistWindowStart],
  );

  return (
    <div className="flex shrink-0 border-b border-[#E5E7EB] bg-white">
      <div
        className="flex shrink-0 flex-col justify-center border-r border-[#E5E7EB] bg-white px-2 pt-2.5"
        style={{ width: TIME_COLUMN_WIDTH_PX }}
      >
        <div className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
          Time
        </div>
      </div>
      <div className="flex min-w-0 flex-1">
        <button
          type="button"
          className="flex w-8 shrink-0 items-center justify-center border-r border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB] disabled:opacity-40"
          aria-label="Show previous therapists"
          onClick={() => shiftTherapistWindow(-1)}
          disabled={therapistWindowStart <= 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {visibleTherapists.map((th) => (
          <div
            key={th.id}
            className="flex shrink-0 items-center gap-2 border-r border-[#E5E7EB] px-3 py-2.5"
            style={{ width: THERAPIST_COLUMN_WIDTH_PX }}
          >
            <TherapistBadge number={th.number} gender={th.gender} />
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold leading-tight text-[#111827]">
                {th.name}
              </div>
              <div className="text-[11px] leading-tight text-[#6B7280]">
                {th.gender}
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="flex w-8 shrink-0 items-center justify-center border-r border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB] disabled:opacity-40"
          aria-label="Show next therapists"
          onClick={() => shiftTherapistWindow(1)}
          disabled={therapistWindowStart >= maxStart}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});
