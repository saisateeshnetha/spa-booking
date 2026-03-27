import { useMemo, useRef, memo, useCallback } from "react";
import {
  DndContext,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  SCHEDULE_END_MIN,
  SCHEDULE_START_MIN,
  SLOT_HEIGHT_PX,
  SLOT_MINUTES,
  THERAPISTS,
  TIME_COLUMN_WIDTH_PX,
  THERAPIST_COLUMN_WIDTH_PX,
  VISIBLE_THERAPIST_COLUMNS,
} from "../../utils/constants.js";
import {
  formatTimeLabel,
  totalScheduleHeightPx,
  totalSlotCount,
  minutesToTopPx,
  durationToHeightPx,
  hourStartMinutesList,
} from "../../utils/schedule.js";
import { useAppStore } from "../../store/useAppStore.js";
import { resolveBookingStatusKey } from "../../utils/bookingVisual.js";
import { AppointmentBlock } from "./AppointmentBlock.jsx";

const TherapistColumn = memo(function TherapistColumn({
  therapistId,
  left,
  width,
  height,
  children,
}) {
  const { setNodeRef } = useDroppable({ id: `therapist-${therapistId}` });
  return (
    <div
      ref={setNodeRef}
      className="absolute top-0 z-[5]"
      style={{ left, width, height }}
    >
      {children}
    </div>
  );
});

function TimeLabelsColumn({ totalHeightPx }) {
  const hours = useMemo(() => hourStartMinutesList(), []);

  return (
    <div
      className="relative shrink-0 border-r border-[#E5E7EB] bg-white"
      style={{ width: TIME_COLUMN_WIDTH_PX, height: totalHeightPx }}
    >
      {hours.map((m) => {
        const top = minutesToTopPx(m);
        return (
          <div
            key={m}
            className="absolute left-0 right-0 px-2 pt-1"
            style={{ top }}
          >
            <div className="text-[12px] font-bold leading-none text-[#111827]">
              {formatTimeLabel(m)}
            </div>
            <div className="mt-0.5 text-[10px] leading-none text-[#9CA3AF]">
              23F 25M
            </div>
          </div>
        );
      })}
    </div>
  );
}

const UnavailableStripe = memo(function UnavailableStripe({ topPx, heightPx }) {
  return (
    <div
      className="pointer-events-none absolute left-0 right-0 z-[1] bg-[#EFEFEF]"
      style={{ top: topPx, height: heightPx }}
    />
  );
});

export const ScheduleGrid = memo(function ScheduleGrid() {
  const parentRef = useRef(null);
  const bookings = useAppStore((s) => s.bookings);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const filterGender = useAppStore((s) => s.filterGender);
  const filterStatus = useAppStore((s) => s.filterStatus);
  const therapistFilter = useAppStore((s) => s.therapistFilter);
  const openBooking = useAppStore((s) => s.openBooking);
  const selectedBooking = useAppStore((s) => s.selectedBooking);
  const moveBooking = useAppStore((s) => s.moveBooking);
  const therapistWindowStart = useAppStore((s) => s.therapistWindowStart);

  const visibleTherapists = useMemo(
    () =>
      THERAPISTS.slice(
        therapistWindowStart,
        therapistWindowStart + VISIBLE_THERAPIST_COLUMNS,
      ),
    [therapistWindowStart],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const totalHeightPx = totalScheduleHeightPx();
  const slotCount = totalSlotCount();

  const rowVirtualizer = useVirtualizer({
    count: slotCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => SLOT_HEIGHT_PX,
    overscan: 16,
  });

  const positioned = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return bookings
      .filter((b) => {
        if (!q) return true;
        return (
          String(b.clientPhone).toLowerCase().includes(q) ||
          String(b.clientName).toLowerCase().includes(q)
        );
      })
      .filter((b) => {
        if (filterGender === "male" && b.therapist?.gender !== "Male")
          return false;
        if (filterGender === "female" && b.therapist?.gender !== "Female")
          return false;
        if (therapistFilter && therapistFilter[b.therapistId] === false)
          return false;
        const sk = resolveBookingStatusKey(b.status);
        if (!filterStatus[sk]) return false;
        return true;
      })
      .map((b) => ({
        ...b,
        topPx: minutesToTopPx(b.startMin),
        heightPx: Math.max(
          durationToHeightPx(b.durationMin),
          SLOT_HEIGHT_PX * 2,
        ),
      }));
  }, [bookings, searchQuery, filterGender, filterStatus, therapistFilter]);

  const byTherapist = useMemo(() => {
    const map = new Map();
    THERAPISTS.forEach((t) => map.set(t.id, []));
    positioned.forEach((b) => {
      const arr = map.get(b.therapistId);
      if (arr) arr.push(b);
    });
    return map;
  }, [positioned]);

  const handleBookingClick = useCallback(
    (b) => {
      openBooking(b);
    },
    [openBooking],
  );

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over, delta } = event;
      const rawId = String(active.id);
      if (!rawId.startsWith("booking-")) return;
      const id = rawId.replace("booking-", "");
      const b = bookings.find((x) => x.id === id);
      if (!b) return;

      let therapistId = b.therapistId;
      if (over && String(over.id).startsWith("therapist-")) {
        therapistId = String(over.id).replace("therapist-", "");
      }

      const deltaMin = Math.round(delta.y / SLOT_HEIGHT_PX) * SLOT_MINUTES;
      const maxStart = SCHEDULE_END_MIN - b.durationMin;
      const startMin = Math.min(
        maxStart,
        Math.max(SCHEDULE_START_MIN, b.startMin + deltaMin),
      );

      moveBooking(id, { therapistId, startMin });
    },
    [bookings, moveBooking],
  );

  const unavailable = useMemo(
    () => [
      {
        therapistId: "10",
        top: minutesToTopPx(9 * 60 + 45),
        h: minutesToTopPx(12 * 60) - minutesToTopPx(9 * 60 + 45),
      },
      {
        therapistId: "14",
        top: minutesToTopPx(10 * 60 + 30),
        h: minutesToTopPx(13 * 60) - minutesToTopPx(10 * 60 + 30),
      },
    ],
    [],
  );

  const gridWidth = visibleTherapists.length * THERAPIST_COLUMN_WIDTH_PX;

  return (
    <div
      ref={parentRef}
      className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-white"
    >
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex" style={{ minHeight: totalHeightPx }}>
          <TimeLabelsColumn totalHeightPx={totalHeightPx} />
          <div className="relative min-w-0 flex-1">
            <div
              className="relative"
              style={{
                width: gridWidth,
                height: totalHeightPx,
              }}
            >
              {/* Columns + unavailable + virtualized horizontal lines */}
              <div className="pointer-events-none absolute inset-0 z-0">
                {visibleTherapists.map((t, colIdx) => (
                  <div
                    key={t.id}
                    className="absolute top-0 border-r border-[#E5E7EB] bg-white"
                    style={{
                      left: colIdx * THERAPIST_COLUMN_WIDTH_PX,
                      width: THERAPIST_COLUMN_WIDTH_PX,
                      height: totalHeightPx,
                    }}
                  >
                    {unavailable
                      .filter((u) => u.therapistId === t.id)
                      .map((u, i) => (
                        <UnavailableStripe
                          key={i}
                          topPx={u.top}
                          heightPx={u.h}
                        />
                      ))}
                  </div>
                ))}
              </div>

              <div
                className="pointer-events-none absolute left-0 top-0 z-[2]"
                style={{
                  width: gridWidth,
                  height: rowVirtualizer.getTotalSize(),
                }}
              >
                {rowVirtualizer.getVirtualItems().map((vi) => (
                  <div
                    key={vi.key}
                    className="absolute left-0 border-b border-[#F3F4F6]"
                    style={{
                      width: gridWidth,
                      height: vi.size,
                      transform: `translateY(${vi.start}px)`,
                    }}
                  />
                ))}
              </div>

              {/* Booking blocks */}
              {visibleTherapists.map((t, colIdx) => (
                <TherapistColumn
                  key={t.id}
                  therapistId={t.id}
                  left={colIdx * THERAPIST_COLUMN_WIDTH_PX}
                  width={THERAPIST_COLUMN_WIDTH_PX}
                  height={totalHeightPx}
                >
                  {(byTherapist.get(t.id) ?? []).map((b) => (
                    <AppointmentBlock
                      key={b.id}
                      booking={b}
                      onClick={handleBookingClick}
                      isSelected={selectedBooking?.id === b.id}
                    />
                  ))}
                </TherapistColumn>
              ))}
            </div>
          </div>
        </div>
      </DndContext>
    </div>
  );
});
